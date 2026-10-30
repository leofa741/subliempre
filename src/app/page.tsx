'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { FaStar, FaArrowRight, FaShoppingBag, FaWhatsapp, FaSearch, FaPalette, FaHeart } from 'react-icons/fa';
import { formatARS } from '@/app/lib/formatcurrenci';

import VideoHero from './components/ui/VideoHero';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import RotatingCircle from './components/ui/RotatingCircle';

// ─────────────────────────────────────────────────────────────
// 🔹 Tipos para PRODUCTOS PERSONALIZADOS
// ─────────────────────────────────────────────────────────────

interface Product {
  _id: string;
  nombre: string;
  descripcion: string;
  categoria: 'sublimacion' | 'remeras' | 'decoracion' | 'tazas' | 'accesorios' | 'cumpleaños';
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

interface CategoryCount {
  slug: string;
  name: string;
  count: number;
  icon: string;
  color: string;
}

// ─────────────────────────────────────────────────────────────
// 🔹 Helpers de formato
// ─────────────────────────────────────────────────────────────

const formatPrice = (monto: number, moneda: 'ARS' | 'USD' = 'ARS') => {
  if (moneda === 'ARS') return formatARS ? formatARS(monto) : `$ ${monto.toLocaleString('es-AR')}`;
  return `USD ${monto.toLocaleString('es-AR')}`;
};

// ─────────────────────────────────────────────────────────────
// 🔹 Componentes de Loading (Estilo Cremoso)
// ─────────────────────────────────────────────────────────────

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

function CategoriesSectionLoader() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse p-6 rounded-[2rem] bg-white/60 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl" />
            <div className="w-12 h-6 bg-rose-100/50 rounded-full" />
          </div>
          <div className="h-5 bg-rose-100/60 rounded-lg w-3/4 mb-3" />
          <div className="h-4 bg-rose-100/40 rounded-lg w-1/2" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 🔹 Componente Principal
// ─────────────────────────────────────────────────────────────

export default function HomePage() {
  return <PageContent />;
}

function PageContent() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Efecto para el mouse move del background (sutil)
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
        const res = await fetch('/api/gestion/public/productos?destacado=true&limit=6');
        if (res.ok) {
          const data = await res.json();
          setFeaturedProducts(data.productos || []);
        }
      } catch (err) {
        console.error('Error loading featured products:', err);
      } finally {
        setFeaturedLoading(false);
      }

      try {
        const res = await fetch('/api/gestion/public/productos?limit=12');
        if (res.ok) {
          const data = await res.json();
          setAllProducts(data.productos || []);
        }
      } catch (err) {
        console.error('Error loading all products:', err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔍 Búsqueda local
  const filteredProducts = allProducts.filter(prod =>
    searchQuery === '' ||
    prod.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prod.categoria.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Categorías con iconos y gradientes sedosos
  const categories: CategoryCount[] = [
    { slug: 'sublimacion', name: 'Sublimación', count: 45, icon: '🎨', color: 'from-rose-300 to-pink-400' },
    { slug: 'remeras', name: 'Remeras & Tops', count: 32, icon: '👚', color: 'from-amber-200 to-orange-300' },
    { slug: 'cumpleaños', name: 'Decoración', count: 28, icon: '🎈', color: 'from-fuchsia-300 to-rose-400' },
    { slug: 'tazas', name: 'Tazas & Mugs', count: 24, icon: '☕', color: 'from-sky-200 to-teal-300' },
  ];

  // ─────────────────────────────────────────────────────────────
  // 🔹 Componente de beneficio (Estilo Porcelana/Seda)
  // ─────────────────────────────────────────────────────────────
  const BenefitCard = ({
    icon,
    title,
    description,
    delay,
    gradient = "from-rose-300 to-pink-400"
  }: {
    icon: string;
    title: string;
    description: string;
    delay: number;
    gradient?: string;
  }) => (
    <div
      className="group relative p-8 rounded-[2rem] bg-white/70 border border-rose-100/80 backdrop-blur-xl hover:bg-white/90 hover:border-rose-200 hover:shadow-[0_20px_40px_-15px_rgba(253,164,175,0.4)] transition-all duration-500 animate-fadeInUp"
      style={{ animationDelay: `${delay + 200}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-[2rem] opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-2xl -z-10`} />
      <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-2 transition-all duration-500 shadow-md shadow-rose-100/50`}>
        <span className="text-3xl filter drop-shadow-sm">{icon}</span>
      </div>
      <h3 className="relative text-xl font-serif font-medium text-stone-800 mb-3 group-hover:text-rose-600 transition-colors duration-300">
        {title}
      </h3>
      <p className="relative text-sm text-stone-500 leading-relaxed group-hover:text-stone-600 transition-colors duration-300">
        {description}
      </p>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // 🔹 Product Card (Estilo Boutique Premium)
  // ─────────────────────────────────────────────────────────────
  const ProductCard = ({ product }: { product: Product }) => (
    <div className="group relative bg-white/80 rounded-[2rem] overflow-hidden border border-rose-100 hover:border-rose-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(253,164,175,0.35)]">
      <div className="relative aspect-[3/4] overflow-hidden bg-rose-50/50">
        <Image 
          src={product.imagen || '/img/no-image.png'} 
          alt={product.nombre} 
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        {/* Overlay sedoso en hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-rose-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {product.destacado && (
          <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-rose-600 text-[10px] font-bold uppercase tracking-wider shadow-sm border border-rose-100">
            ⭐ Destacado
          </span>
        )}
        {product.nuevo && (
          <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md shadow-rose-200/50">
            ✨ Nuevo
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
          {product.caracteristicas.personalizable && (
            <span className="text-[10px] bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full font-bold border border-rose-100">
              Personalizable
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // ✅ Render principal
  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 text-stone-800 selection:bg-rose-200 selection:text-rose-900">
    
      {/* ═══════════════════════════════════════════════════════
          HERO CON VIDEO - Estética Sedosa
          ═══════════════════════════════════════════════════════ */}
      <div className="relative w-full left-0 right-0 overflow-hidden">
        <VideoHero videoSrc="/videos/header4.mp4" overlayOpacity={0.2}>
          <div className="max-w-7xl mx-auto px-6 pt-32 sm:pt-40 pb-20">
            <div className="absolute top-20 right-10 w-64 h-64 bg-rose-200/30 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-20 left-10 w-80 h-80 bg-amber-200/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-40 left-1/4 w-48 h-48 bg-pink-200/30 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 items-center mt-12">
              <div className="text-left space-y-8">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 border border-rose-200 shadow-[0_8px_20px_rgba(253,164,175,0.2)] backdrop-blur-sm">
                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">Hecho con Amor 💜</span>
                </div>
                
                <div className="group relative inline-block">
                  <h1 className="relative z-10 text-5xl md:text-7xl lg:text-8xl font-serif font-light leading-[1.1] tracking-tight text-stone-800">
                    <span className="block bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent font-medium">
                      Creando
                    </span>
                    <span className="block italic text-stone-400 my-2 text-4xl md:text-6xl lg:text-7xl">
                      Momentos
                    </span>
                    <span className="block bg-gradient-to-r from-amber-300 via-rose-400 to-pink-400 bg-clip-text text-transparent font-medium">
                      Únicos
                    </span>
                  </h1>
                  <div className="absolute -inset-4 bg-gradient-to-r from-rose-200/40 via-pink-200/40 to-amber-200/40 rounded-[2rem] blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>

                <p className="text-lg md:text-xl text-stone-600 max-w-lg font-light leading-relaxed">
                  Productos personalizados con dedicación para hacer tus celebraciones 
                  <span className="text-rose-600 font-medium italic">inolvidables</span>. 
                  Sublimación, decoración y detalles que enamoran.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link
                    href="/productos"
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold rounded-full shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    <FaShoppingBag className="w-5 h-5" />
                    Ver Colección
                    <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/contacto"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-md text-rose-700 font-bold rounded-full border border-rose-200 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-800 transition-all duration-300 shadow-sm"
                  >
                    <FaHeart className="w-5 h-5 text-rose-400" />
                    Cotizar Ahora
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </VideoHero>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECCIÓN BENEFICIOS - Estilo Porcelana
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-100/50 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-100/50 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-fadeInUp">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 border border-rose-100 shadow-[0_8px_20px_rgba(253,164,175,0.15)] mb-8 backdrop-blur-sm">
              <span className="text-2xl">✨</span>
              <span className="text-sm tracking-[0.2em] uppercase bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent font-bold">
                Hacemos tu cumple mágico
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium mb-6 leading-tight text-stone-800">
              Por Qué <span className="italic text-rose-500">Elegirnos</span>
            </h2>

            <p className="text-lg text-stone-500 leading-relaxed max-w-2xl mx-auto px-2 font-light">
              Creamos productos únicos con materiales de primera calidad y 
              <span className="text-rose-600 font-medium"> mucho amor</span> en cada detalle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BenefitCard
              icon="🎨"
              title="100% Personalizable"
              description="Cada producto se adapta a tus gustos. Tú decides colores, diseños y cada pequeño detalle."
              gradient="from-rose-300 to-pink-400"
              delay={0}
            />
            <BenefitCard
              icon="✨"
              title="Calidad Premium"
              description="Insumos de primera que garantizan durabilidad, colores vibrantes y terminaciones impecables."
              gradient="from-amber-200 to-orange-300"
              delay={100}
            />
            <BenefitCard
              icon="🚀"
              title="Entrega Puntual"
              description="Tiempos optimizados sin comprometer la excelencia. Tu evento es nuestra prioridad."
              gradient="from-sky-200 to-teal-300"
              delay={200}
            />
            <BenefitCard
              icon="💝"
              title="Hecho con Amor"
              description="Cada pieza es única y especial. Dedicación total y cariño en cada proyecto que creamos."
              gradient="from-fuchsia-300 to-rose-400"
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CATEGORÍAS - Grid Colorido Sedoso
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-stone-800 mb-4">
              Explora Nuestras <span className="italic text-rose-500">Categorías</span>
            </h2>
            <p className="text-stone-500 max-w-2xl mx-auto font-light">
              Desde sublimación hasta decoración de cumpleaños, tenemos todo para hacer tu evento especial.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <Link
                key={cat.slug}
                href={`/productos?categoria=${cat.slug}`}
                className="group relative p-6 rounded-[2rem] bg-white/70 border border-rose-100 hover:border-rose-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(253,164,175,0.3)] overflow-hidden"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl mb-5 shadow-md shadow-rose-100/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    {cat.icon}
                  </div>
                  <h3 className="text-stone-800 font-serif font-medium text-lg mb-2 group-hover:text-rose-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-stone-500 font-medium">
                    {cat.count} productos
                  </p>
                </div>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <FaArrowRight className="text-rose-400 w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PRODUCTOS DESTACADOS
          ═══════════════════════════════════════════════════════ */}
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
            <Link href="/productos?destacado=true" className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-rose-200 text-rose-600 font-bold text-sm shadow-sm hover:bg-rose-50 hover:border-rose-300 hover:shadow-md transition-all">
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
              <Link href="/productos" className="text-rose-500 font-bold hover:text-rose-600 underline underline-offset-4">
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

      {/* ═══════════════════════════════════════════════════════
          CTA - WhatsApp (Cálido y Acogedor)
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-100/50 via-pink-100/50 to-amber-100/50" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-40 h-40 bg-rose-200/40 rounded-full blur-[80px]" />
          <div className="absolute bottom-10 right-10 w-56 h-56 bg-amber-200/40 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-3xl mb-8 shadow-xl shadow-emerald-200/50 animate-bounce">
            <FaWhatsapp />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-stone-800 mb-6">
            ¿Tienes una idea en mente?
          </h2>
          <p className="text-xl text-stone-500 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Escríbenos por WhatsApp y creamos juntos el producto perfecto para ti. 
            Asesoramiento personalizado, cercano y sin cargo.
          </p>
          <a
            href="https://wa.me/5491141461312?text=Hola!%20Me%20interesa%20cotizar%20un%20producto%20personalizado%20🎨"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-lg rounded-full shadow-xl shadow-emerald-200/50 hover:shadow-2xl hover:shadow-emerald-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <FaWhatsapp className="w-6 h-6" />
            Consultar Ahora
          </a>
          <p className="mt-6 text-sm text-stone-400 font-medium">Respuesta en menos de 1 hora 💕</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MODAL DE PRODUCTO (Estilo Boutique)
          ═══════════════════════════════════════════════════════ */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-2xl rounded-[2rem] border border-rose-100 shadow-[0_40px_80px_-20px_rgba(253,164,175,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center transition-colors border border-rose-100"
            >
              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="grid md:grid-cols-2">
              <div className="relative aspect-square bg-rose-50/50">
                <Image
                  src={selectedProduct.imagen || '/img/producto-default.jpg'}
                  alt={selectedProduct.nombre}
                  fill
                  className="object-cover rounded-t-[2rem] md:rounded-l-[2rem] md:rounded-tr-none"
                />
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider mb-3 border border-rose-100">
                    {selectedProduct.categoria}
                  </span>
                  <h2 className="text-3xl font-serif font-medium text-stone-800 mb-2">{selectedProduct.nombre}</h2>
                  <p className="text-3xl font-serif font-bold text-rose-600">
                    {formatPrice(selectedProduct.precio, selectedProduct.moneda)}
                  </p>
                </div>

                <p className="text-stone-600 leading-relaxed font-light">
                  {selectedProduct.descripcion}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                    <span className="text-[10px] text-rose-500 uppercase tracking-wider font-bold block mb-1">Color</span>
                    <p className="text-lg font-medium text-stone-800">{selectedProduct.caracteristicas.color}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <span className="text-[10px] text-amber-600 uppercase tracking-wider font-bold block mb-1">Material</span>
                    <p className="text-lg font-medium text-stone-800">{selectedProduct.caracteristicas.material}</p>
                  </div>
                </div>

                {selectedProduct.caracteristicas.personalizable && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100">
                    <p className="text-rose-700 font-medium text-sm flex items-center gap-2">
                      <FaPalette className="text-rose-500" />
                      Este producto es 100% personalizable a tu gusto
                    </p>
                  </div>
                )}

                <a
                  href={`https://wa.me/5491141461312?text=${encodeURIComponent(`Hola! Me interesa: ${selectedProduct.nombre}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-lg hover:from-emerald-500 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200/50 inline-flex items-center justify-center gap-3"
                >
                  <FaWhatsapp className="w-6 h-6" />
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}