'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  FaStar, FaArrowRight, FaShoppingBag, FaWhatsapp, 
  FaPalette, FaHeart, FaCheckCircle, FaGift 
} from 'react-icons/fa';

import { formatARS } from '@/app/lib/formatcurrenci';
import VideoHero from './components/ui/VideoHero';
import { siteConfig } from '@/app/lib/config';


interface Product {
  _id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  moneda: 'ARS' | 'USD';
  imagen: string;
  slug: string;
  destacado: boolean;
  nuevo: boolean;
  caracteristicas: {
    talle?: string;
    color: string;
    material: string;
    personalizable: boolean;
  };
}

interface DynamicCategory {
  slug: string;
  name: string;
  count: number;
  icon: string;
  color: string;
}

const formatPrice = (monto: number, moneda: 'ARS' | 'USD' = 'ARS') => {
  if (moneda === 'ARS') return formatARS ? formatARS(monto) : `$ ${monto.toLocaleString('es-AR')}`;
  return `USD ${monto.toLocaleString('es-AR')}`;
};

function ProductsSectionLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white/60 rounded-[2rem] overflow-hidden border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
            <div className="aspect-[3/4] bg-gradient-to-br from-rose-50 to-amber-50" />
            <div className="p-6 space-y-4">
              <div className="h-5 bg-rose-100/60 rounded-lg w-3/4" />
              <div className="h-4 bg-rose-100/40 rounded-lg w-1/2" />
              <div className="h-10 bg-gradient-to-r from-rose-200 to-pink-200 rounded-xl w-1/3 mt-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return <PageContent />;
}

function PageContent() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const move = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      container.style.setProperty('--x', `${x}px`);
      container.style.setProperty('--y', `${y}px`);
    };
    container.addEventListener('mousemove', move);
    return () => container.removeEventListener('mousemove', move);
  }, []);

  // 📥 Cargar datos de productos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/public/productos');
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.productos || []).map((p: any) => ({
            ...p,
            precio: p.precioFinal || p.precio || 0,
            moneda: p.moneda || 'ARS',
            caracteristicas: p.caracteristicas || { color: 'Variado', material: 'Premium', personalizable: true },
            destacado: Boolean(p.destacado) // ✅ Forzamos que sea booleano
          }));
          
          console.log('📦 Total productos cargados desde la API:', mapped.length);
          
          // Filtramos SOLO los que tengan destacado === true
          const destacados = mapped.filter((p: Product) => p.destacado === true);
          console.log('⭐ Productos destacados encontrados:', destacados.length);
          
          setAllProducts(mapped);
          setFeaturedProducts(destacados.slice(0, 6)); // Mostramos máximo 6
        } else {
          console.error('❌ Error en la respuesta de la API:', res.status);
        }
      } catch (err) {
        console.error('❌ Error cargando productos:', err);
      } finally {
        setFeaturedLoading(false);
        setProductsLoading(false);
      }
    };

    fetchData();
  }, []);
  // ─────────────────────────────────────────────────────────────
  // 🔹 GENERACIÓN DINÁMICA DE CATEGORÍAS
  // ─────────────────────────────────────────────────────────────
  const categoryStyles: Record<string, { icon: string; color: string }> = {
    'sublimacion': { icon: '🎨', color: 'from-rose-300 to-pink-400' },
    'remeras': { icon: '👚', color: 'from-amber-200 to-orange-300' },
    'cumpleaños': { icon: '🎈', color: 'from-fuchsia-300 to-rose-400' },
    'tazas': { icon: '☕', color: 'from-sky-200 to-teal-300' },
    'accesorios': { icon: '🎀', color: 'from-purple-300 to-indigo-400' },
    'decoracion': { icon: '✨', color: 'from-yellow-200 to-amber-300' },
    'default': { icon: '🎁', color: 'from-stone-200 to-stone-300' }
  };

  const dynamicCategories = useMemo(() => {
    if (allProducts.length === 0) return [];

    const categoryCounts: Record<string, number> = {};
    allProducts.forEach(prod => {
      const cat = prod.categoria.toLowerCase().trim();
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([slug, count]) => {
      const styles = categoryStyles[slug] || categoryStyles['default'];
      const name = slug.charAt(0).toUpperCase() + slug.slice(1);
      
      return { slug, name, count, icon: styles.icon, color: styles.color };
    });
  }, [allProducts]);

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="group relative bg-white/80 rounded-[2rem] overflow-hidden border border-rose-100 hover:border-rose-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(253,164,175,0.35)]">
      <div className="relative aspect-[3/4] overflow-hidden bg-rose-50/50">
        <Image 
          src={product.imagen || '/img/no-image.png'} 
          alt={product.nombre} 
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rose-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {product.destacado && (
          <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-rose-600 text-[10px] font-bold uppercase tracking-wider shadow-sm border border-rose-100">
            ⭐ Destacado
          </span>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <button 
            onClick={() => setSelectedProduct(product)}
            className="w-full py-3.5 rounded-xl bg-white/95 backdrop-blur-md text-rose-600 font-bold text-sm hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-lg border border-rose-100 hover:border-rose-500"
          >
            Ver Detalles
          </button>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-stone-800 font-serif font-medium truncate mb-1 text-lg group-hover:text-rose-600 transition-colors">
          {product.nombre}
        </h3>
        <p className="text-stone-500 text-xs mb-4 capitalize font-medium tracking-wide">
          {product.categoria}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-rose-600 font-serif font-bold text-xl">
            {formatPrice(product.precio, product.moneda)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 text-stone-800 selection:bg-rose-200 selection:text-rose-900">
    
      {/* HERO */}
      <div className="relative w-full left-0 right-0 overflow-hidden">
        <VideoHero videoSrc="/videos/header1.mp4" overlayOpacity={0.2}>
          <div className="max-w-7xl mx-auto px-6 pt-32 sm:pt-40 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 items-center mt-12">
              <div className="text-left space-y-8">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 border border-rose-200 shadow-[0_8px_20px_rgba(253,164,175,0.2)] backdrop-blur-sm">
                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">Hecho con Amor 💜</span>
                </div>
                
                <h1 className="relative z-10 text-5xl md:text-7xl lg:text-8xl font-serif font-light leading-[1.1] tracking-tight text-stone-800">
                  <span className="block bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent font-medium">Creando</span>
                  <span className="block italic text-stone-400 my-2 text-4xl md:text-6xl lg:text-7xl">Momentos</span>
                  <span className="block bg-gradient-to-r from-amber-300 via-rose-400 to-pink-400 bg-clip-text text-transparent font-medium">Únicos</span>
                </h1>

                <p className="text-lg md:text-xl text-stone-600 max-w-lg font-light leading-relaxed">
                  Productos personalizados con dedicación para hacer tus celebraciones 
                  <span className="text-rose-600 font-medium italic">inolvidables</span>. 
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  {/* ✅ CORRECCIÓN 2: Enlace correcto a tu página de catálogo */}
                  <Link href="/catalogo" className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold rounded-full shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                    <FaShoppingBag className="w-5 h-5" />
                    Ver Catálogo
                    <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-md text-rose-700 font-bold rounded-full border border-rose-200 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-800 transition-all duration-300 shadow-sm">
                    <FaWhatsapp className="w-5 h-5 text-emerald-500" />
                    Cotizar Ahora
                  </a>
                </div>
              </div>
            </div>
          </div>
        </VideoHero>
      </div>

      {/* CATEGORÍAS DINÁMICAS */}
      <section className="py-20 sm:py-24 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-stone-800 mb-4">
              Explora Nuestras <span className="italic text-rose-500">Categorías</span>
            </h2>
            <p className="text-stone-500 max-w-2xl mx-auto font-light">
              Tenemos todo para hacer tu evento especial.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {productsLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="animate-pulse p-6 rounded-[2rem] bg-white/60 border border-rose-100">
                  <div className="w-16 h-16 bg-rose-100/60 rounded-2xl mb-4" />
                  <div className="h-5 bg-rose-100/60 rounded-lg w-3/4 mb-3" />
                  <div className="h-4 bg-rose-100/40 rounded-lg w-1/2" />
                </div>
              ))
            ) : dynamicCategories.length > 0 ? (
              dynamicCategories.map((cat, idx) => (
                <Link
                  key={cat.slug}
                  // ✅ CORRECCIÓN 3: Apunta a /catalogo con el filtro de categoría
                  href={`/catalogo?categoria=${cat.slug}`}
                  className="group relative p-6 rounded-[2rem] bg-white/70 border border-rose-100 hover:border-rose-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(253,164,175,0.3)] overflow-hidden"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl mb-5 shadow-md shadow-rose-100/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      {cat.icon}
                    </div>
                    <h3 className="text-stone-800 font-serif font-medium text-lg mb-2 group-hover:text-rose-600 transition-colors capitalize">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-stone-500 font-medium">
                      {cat.count} {cat.count === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <FaArrowRight className="text-rose-400 w-5 h-5" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-stone-500 bg-white/50 rounded-[2rem] border border-rose-100">
                <p className="text-lg mb-2">📦 Aún no hay productos en el catálogo.</p>
                <p className="text-sm">Agrega productos desde el panel de administración para verlos aquí.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-medium text-stone-800 flex items-center gap-3">
                <FaStar className="text-amber-300 text-2xl" />
                Favoritos
              </h2>
              <p className="text-stone-500 mt-2 font-light">Las piezas más elegidas por nuestras clientas</p>
            </div>
            <Link href="/catalogo" className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-rose-200 text-rose-600 font-bold text-sm shadow-sm hover:bg-rose-50 hover:border-rose-300 hover:shadow-md transition-all">
              Ver Todos
              <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {featuredLoading ? (
            <ProductsSectionLoader />
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white/60 rounded-[2rem] border border-rose-100 shadow-sm">
              <div className="text-6xl mb-4">🎁</div>
              <p className="text-stone-600 text-lg font-medium mb-4">Próximamente más productos destacados</p>
              <Link href="/catalogo" className="text-rose-500 font-bold hover:text-rose-600 underline underline-offset-4">
                Ver todo el catálogo →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODAL DE PRODUCTO (Se mantiene igual) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
          <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-2xl rounded-[2rem] border border-rose-100 shadow-[0_40px_80px_-20px_rgba(253,164,175,0.4)]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center transition-colors border border-rose-100">
              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-square bg-rose-50/50">
                <Image src={selectedProduct.imagen || '/img/producto-default.jpg'} alt={selectedProduct.nombre} fill className="object-cover rounded-t-[2rem] md:rounded-l-[2rem] md:rounded-tr-none" />
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider mb-3 border border-rose-100 capitalize">{selectedProduct.categoria}</span>
                  <h2 className="text-3xl font-serif font-medium text-stone-800 mb-2">{selectedProduct.nombre}</h2>
                  <p className="text-3xl font-serif font-bold text-rose-600">{formatPrice(selectedProduct.precio, selectedProduct.moneda)}</p>
                </div>
                <p className="text-stone-600 leading-relaxed font-light">{selectedProduct.descripcion}</p>
                <a href={`https://wa.me/5491141461312?text=${encodeURIComponent(`Hola! Me interesa: ${selectedProduct.nombre}`)}`} target="_blank" rel="noopener noreferrer" className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-lg hover:from-emerald-500 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200/50 inline-flex items-center justify-center gap-3">
                  <FaWhatsapp className="w-6 h-6" /> Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}