'use client';

import { useState, useEffect } from 'react';
import { FaShoppingBag, FaWhatsapp, FaPlus, FaMinus, FaTimes, FaStar, FaMagic, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Product {
  _id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precioFinal: number;
  imagen: string;
  destacado: boolean;
  nuevo: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Estados para filtros y paginación
  const [filterCategory, setFilterCategory] = useState('todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const WHATSAPP_NUMBER = '5491141461312';

  // ─────────────────────────────────────────────────────────────
  // 🔹 CARGA DE PRODUCTOS (OPTIMIZADA PARA TIEMPO REAL)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // ✅ 1. cache: 'no-store' obliga al navegador a pedir datos frescos a la base de datos
        const res = await fetch(`/api/public/productos?page=${currentPage}&limit=12&categoria=${filterCategory}`, {
          cache: 'no-store'
        });
        const data = await res.json();
        if (data.success) {
          setProducts(data.productos);
        setTotalPages(data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error('Error cargando catálogo:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();

    // ✅ 2. Detector de visibilidad: Si el cliente tiene la página abierta y tú cambias un precio,
    // al hacer clic nuevamente en la pestaña del navegador, los precios se actualizan al instante.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Limpieza del evento al desmontar el componente
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentPage, filterCategory]);

  // ─────────────────────────────────────────────────────────────
  // 🔹 LÓGICA DEL CARRITO
  // ─────────────────────────────────────────────────────────────
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => 
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.precioFinal * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSendWhatsApp = () => {
    if (cart.length === 0) return;

    let message = `¡Hola Candy Ilusiones! 🎨✨\nMe gustaría hacer el siguiente pedido:\n\n`;
    cart.forEach(item => {
      message += `▪️ ${item.quantity}x ${item.nombre} - ${formatPrice(item.precioFinal * item.quantity)}\n`;
    });
    message += `\n💰 *Total estimado: ${formatPrice(cartTotal)}*\n\n`;
    message += `¿Podrías confirmarme disponibilidad y el proceso de pago? ¡Gracias! 💜`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  // ✅ PROTECCIÓN CONTRA NaN
  const formatPrice = (amount: number) => {
    if (!amount || isNaN(amount)) return '$ 0';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);
  };

  const handleCategoryChange = (cat: string) => {
    setFilterCategory(cat);
    setCurrentPage(1); // Reiniciar a la página 1 al cambiar de categoría
  };

  // Extraer categorías únicas de los productos (fallback si la API no las devuelve todas)
  const categories = ['todas', ...Array.from(new Set(products.map(p => p.categoria)))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-10 h-10 text-rose-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-stone-500 font-medium animate-pulse">Cargando catálogo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 pb-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-200/40 via-pink-200/40 to-amber-200/40 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="text-center mt-40 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-rose-200 shadow-sm mb-4 backdrop-blur-sm">
            <FaMagic className="text-rose-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-stone-600">Catálogo Online</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-medium text-stone-800 mb-4">
            Creá tu Pedido <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">Ideal</span>
          </h1>
          <p className="text-stone-500 text-lg font-light max-w-2xl mx-auto">
            Explorá nuestros productos personalizados. Agregá lo que te guste al carrito y envianos tu pedido directamente por WhatsApp.
          </p>
        </div>

        {/* Filtros de Categoría */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-all duration-300 ${
                filterCategory === cat
                  ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200/50'
                  : 'bg-white/80 text-stone-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grilla de Productos */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-500 text-lg">No hay productos en esta categoría por el momento.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="group relative bg-white/80 backdrop-blur-xl rounded-[2rem] border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)] hover:shadow-xl hover:shadow-rose-200/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="relative aspect-square overflow-hidden bg-rose-50/50">
                    {product.imagen ? (
                      <img src={product.imagen} alt={product.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-rose-200 text-6xl">🎁</div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.destacado && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase border border-amber-200">
                          <FaStar className="w-3 h-3" /> Destacado
                        </span>
                      )}
                      {product.nuevo && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase border border-rose-200">
                          Nuevo
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1">{product.categoria}</p>
                    <h3 className="font-serif font-medium text-stone-800 text-lg mb-2 leading-tight">{product.nombre}</h3>
                    <p className="text-stone-500 text-sm mb-4 line-clamp-2 flex-1">{product.descripcion}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-rose-100">
                      <span className="text-xl font-bold text-stone-800">{formatPrice(product.precioFinal)}</span>
                      <button 
                        onClick={() => addToCart(product)}
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-200/50 hover:scale-110 active:scale-95 transition-all"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ═══════════════════════════════════════════════════
                CONTROLES DE PAGINACIÓN
                ═══════════════════════════════════════════════════ */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl bg-white/80 border border-rose-200 text-stone-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-50 transition-all"
                >
                  <FaChevronLeft />
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200/50'
                          : 'bg-white/80 border border-rose-200 text-stone-600 hover:bg-rose-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-xl bg-white/80 border border-rose-200 text-stone-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-50 transition-all"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Botón Flotante del Carrito */}
      {cartCount > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-6 py-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-2xl shadow-rose-500/40 hover:scale-105 active:scale-95 transition-all"
        >
          <div className="relative">
            <FaShoppingBag className="text-xl" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 text-amber-900 text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
              {cartCount}
            </span>
          </div>
          <span>Ver Pedido ({formatPrice(cartTotal)})</span>
        </button>
      )}

      {/* Drawer / Modal del Carrito */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl h-full shadow-2xl flex flex-col animate-slideInRight">
            <div className="p-6 border-b border-rose-100 flex items-center justify-between bg-white/50">
              <h2 className="text-xl font-serif font-medium text-stone-800 flex items-center gap-2">
                <FaShoppingBag className="text-rose-400" /> Tu Pedido
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-full hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <FaShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item._id} className="flex gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                    <div className="w-16 h-16 rounded-xl bg-white border border-rose-200 overflow-hidden flex-shrink-0">
                      {item.imagen ? (
                        <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-rose-200">🎁</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-stone-800 text-sm truncate">{item.nombre}</h4>
                      <p className="text-rose-600 font-bold text-sm mt-1">{formatPrice(item.precioFinal)}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button onClick={() => updateQuantity(item._id, -1)} className="w-7 h-7 rounded-lg bg-white border border-rose-200 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-colors">
                          <FaMinus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold text-stone-800 w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, 1)} className="w-7 h-7 rounded-lg bg-white border border-rose-200 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-colors">
                          <FaPlus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-rose-100 bg-white/50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-medium">Total Estimado</span>
                  <span className="text-2xl font-serif font-bold text-stone-800">{formatPrice(cartTotal)}</span>
                </div>
                <p className="text-xs text-stone-400 text-center">
                  * El precio final puede variar según personalizaciones específicas.
                </p>
                <button 
                  onClick={handleSendWhatsApp}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <FaWhatsapp className="w-6 h-6" />
                  Enviar Pedido por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}