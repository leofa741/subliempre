'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, FaPlus, FaTrash, FaUser, FaPhone, 
  FaCalendarAlt, FaStickyNote, FaCalculator, FaCheckCircle 
} from 'react-icons/fa';

interface Product {
  _id: string;
  nombre: string;
  precioFinal: number;
}

interface OrderItem {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export default function NuevoPedidoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estado del Cliente
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  // Estado del Pedido
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  
  // Estado Financiero
  const [seña, setSeña] = useState<number>(0);

  // ─────────────────────────────────────────────────────────────
  // 🔹 CARGA DE PRODUCTOS DISPONIBLES
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchProducts = async () => {
    try {
      const res = await fetch('/api/gestion/productos', {
        headers: { 'Authorization': `Bearer ${session?.user?.token}` }
      });
      
      // ✅ PROTECCIÓN: Si la API falla (404, 405, 500), no intentamos parsear JSON
      if (!res.ok) {
        throw new Error(`La API respondió con estado ${res.status}`);
      }
      
      const data = await res.json();
      if (data.success) {
        setAvailableProducts(data.productos.filter((p: Product) => p.precioFinal > 0));
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      toast.error('No se pudieron cargar los productos. Verifica la API.', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
    } finally {
      setLoadingProducts(false);
    }
  };

    if (status === 'authenticated') {
      fetchProducts();
    }
  }, [status, session, router]);

  // ─────────────────────────────────────────────────────────────
  // 🔹 CÁLCULOS EN TIEMPO REAL
  // ─────────────────────────────────────────────────────────────
  const totalPedido = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const saldoPendiente = Math.max(0, totalPedido - seña);

  // ─────────────────────────────────────────────────────────────
  // 🔹 HANDLERS DE PRODUCTOS
  // ─────────────────────────────────────────────────────────────
  const addProductToOrder = () => {
    if (!selectedProductId || itemQuantity < 1) return;
    
    const product = availableProducts.find(p => p._id === selectedProductId);
    if (!product) return;

    const existingItemIndex = orderItems.findIndex(item => item.productoId === selectedProductId);

    if (existingItemIndex >= 0) {
      // Si ya existe, sumamos la cantidad
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].cantidad += itemQuantity;
      updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].cantidad * updatedItems[existingItemIndex].precioUnitario;
      setOrderItems(updatedItems);
    } else {
      // Si es nuevo, lo agregamos
      setOrderItems(prev => [
        ...prev,
        {
          productoId: product._id,
          nombre: product.nombre,
          cantidad: itemQuantity,
          precioUnitario: product.precioFinal,
          subtotal: product.precioFinal * itemQuantity
        }
      ]);
    }
    
    // Resetear selector
    setSelectedProductId('');
    setItemQuantity(1);
  };

  const removeProduct = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const updatedItems = [...orderItems];
    updatedItems[index].cantidad = newQty;
    updatedItems[index].subtotal = newQty * updatedItems[index].precioUnitario;
    setOrderItems(updatedItems);
  };

  // ─────────────────────────────────────────────────────────────
  // 🔹 ENVÍO DEL FORMULARIO
  // ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderItems.length === 0) {
      toast.warning('Debes agregar al menos un producto al pedido', {
        style: { background: '#FFFBEB', color: '#92400E', border: '1px solid #FCD34D' }
      });
      return;
    }

    if (!clientName || !clientPhone || !deliveryDate) {
      toast.warning('Por favor completa los datos de la clienta y la fecha de entrega', {
        style: { background: '#FFFBEB', color: '#92400E', border: '1px solid #FCD34D' }
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        clienteNombre: clientName,
        clienteTelefono: clientPhone,
        productos: orderItems,
        estado: 'pendiente',
        total: totalPedido,
        seña: seña,
        fechaEntregaEstimada: deliveryDate,
        notas: notes
      };

      const res = await fetch('/api/gestion/pedidos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('¡Pedido creado exitosamente! 🎉', {
          style: { background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }
        });
        router.push('/gestion/pedidos');
      } else {
        toast.error(data.message || 'Error al crear el pedido', {
          style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
        });
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (amount: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);

  if (status === 'loading' || loadingProducts) {
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
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8">
      <div className="max-w-6xl mt-50 mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-3 rounded-2xl bg-white/80 border border-rose-200 text-stone-600 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm">
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-stone-800">Nuevo Pedido</h1>
            <p className="text-stone-500 font-light">Registra un nuevo trabajo, calcula el total y la seña.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ═══════════════════════════════════════════════════
              COLUMNA IZQUIERDA: DATOS Y PRODUCTOS (2/3)
              ═══════════════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card: Datos de la Clienta */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
              <h2 className="text-lg font-serif font-medium text-stone-800 mb-6 flex items-center gap-2">
                <FaUser className="text-rose-400" /> Datos de la Clienta
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Nombre Completo *</label>
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} required
                    className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                    placeholder="Ej: María González" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Teléfono / WhatsApp *</label>
                  <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} required
                    className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                    placeholder="Ej: 11 1234 5678" />
                </div>
              </div>
            </div>

            {/* Card: Agregar Productos */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
              <h2 className="text-lg font-serif font-medium text-stone-800 mb-6 flex items-center gap-2">
                <FaCalculator className="text-rose-400" /> Productos del Pedido
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200">
                  <option value="">Seleccionar producto...</option>
                  {availableProducts.map(prod => (
                    <option key={prod._id} value={prod._id}>
                      {prod.nombre} - {formatPrice(prod.precioFinal)}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-rose-200 px-3">
                  <span className="text-stone-400 text-sm">Cant:</span>
                  <input type="number" min="1" value={itemQuantity} onChange={e => setItemQuantity(Number(e.target.value))}
                    className="w-16 py-3 text-center text-stone-800 font-bold focus:outline-none" />
                </div>
                <button type="button" onClick={addProductToOrder} disabled={!selectedProductId}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <FaPlus /> Agregar
                </button>
              </div>

              {/* Lista de Productos Agregados */}
              <div className="space-y-3">
                {orderItems.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-rose-200 rounded-2xl">
                    <p className="text-stone-400 italic text-sm">Aún no has agregado productos a este pedido.</p>
                  </div>
                ) : (
                  orderItems.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white border border-rose-100 group hover:border-pink-200 transition-colors gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-stone-800">{item.nombre}</p>
                        <p className="text-xs text-stone-500">{formatPrice(item.precioUnitario)} c/u</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-rose-50 rounded-lg px-2 py-1 border border-rose-200">
                          <button type="button" onClick={() => updateItemQuantity(index, item.cantidad - 1)} disabled={item.cantidad <= 1}
                            className="w-6 h-6 flex items-center justify-center text-rose-500 hover:bg-rose-200 rounded transition-colors disabled:opacity-30">-</button>
                          <span className="text-sm font-bold text-stone-800 w-6 text-center">{item.cantidad}</span>
                          <button type="button" onClick={() => updateItemQuantity(index, item.cantidad + 1)}
                            className="w-6 h-6 flex items-center justify-center text-rose-500 hover:bg-rose-200 rounded transition-colors">+</button>
                        </div>
                        <span className="font-bold text-rose-600 w-24 text-right">{formatPrice(item.subtotal)}</span>
                        <button type="button" onClick={() => removeProduct(index)}
                          className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Card: Notas */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
              <h2 className="text-lg font-serif font-medium text-stone-800 mb-4 flex items-center gap-2">
                <FaStickyNote className="text-rose-400" /> Notas u Observaciones
              </h2>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all resize-none"
                placeholder="Ej: La clienta pidió que el lazo sea color rosa pastel en lugar de rojo..." />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              COLUMNA DERECHA: RESUMEN FINANCIERO (Sticky)
              ═══════════════════════════════════════════════════ */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] p-6 border border-rose-100 shadow-[0_25px_50px_-12px_rgba(253,164,175,0.3)]">
                <h3 className="text-lg font-serif font-medium text-stone-800 mb-6 text-center">Resumen del Pedido</h3>
                
                {/* Fecha de Entrega */}
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Fecha de Entrega Estimada *</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} required
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all" />
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Subtotal Productos</span>
                    <span className="font-medium text-stone-800">{formatPrice(totalPedido)}</span>
                  </div>
                  <div className="h-px bg-rose-100" />
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-stone-800">Total del Pedido</span>
                    <span className="text-rose-600 text-xl">{formatPrice(totalPedido)}</span>
                  </div>
                </div>

                {/* Input de Seña */}
                <div className="mb-6 p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">Seña / Adelanto ($)</label>
                  <input type="number" min="0" value={seña} onChange={e => setSeña(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-amber-300 text-stone-800 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
                    placeholder="0" />
                  <p className="text-[10px] text-amber-600 mt-2 text-center">
                    Deja en 0 si paga todo al retirar.
                  </p>
                </div>

                {/* Saldo Pendiente */}
                <div className={`p-4 rounded-2xl border mb-6 text-center transition-colors ${
                  saldoPendiente > 0 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${saldoPendiente > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    Saldo Pendiente de Pago
                  </p>
                  <p className={`text-3xl font-serif font-bold ${saldoPendiente > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {formatPrice(saldoPendiente)}
                  </p>
                  {saldoPendiente === 0 && totalPedido > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-emerald-600 text-xs font-bold">
                      <FaCheckCircle /> ¡Pedido totalmente abonado!
                    </div>
                  )}
                </div>

                {/* Botón Guardar */}
                <button type="submit" disabled={submitting || orderItems.length === 0}
                  className="w-full group relative inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-500 overflow-hidden bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                  {!submitting && <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />}
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Crear Pedido</span>
                      <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}