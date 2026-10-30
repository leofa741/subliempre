'use client';

import { useState, useEffect, JSX } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { pdf } from '@react-pdf/renderer';
import { 
  FaArrowLeft, FaTrash, FaSave, FaCalendarAlt, FaStickyNote, 
  FaCheckCircle, FaClock, FaSpinner, FaTimesCircle, FaBoxOpen, FaFilePdf 
} from 'react-icons/fa';

// ✅ Asegúrate de que esta ruta coincida con donde guardaste el componente PDF
import { PedidoPDF } from '@/app/components/pedidospdf/PedidoPDF';

interface ProductoPedido {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Pedido {
  _id: string;
  clienteNombre: string;
  clienteTelefono: string;
  productos: ProductoPedido[];
  estado: 'pendiente' | 'en_produccion' | 'listo' | 'entregado' | 'cancelado';
  total: number;
  seña: number;
  saldoPendiente: number;
  fechaEntregaEstimada: string;
  notas: string;
  createdAt: string;
}

export default function DetallePedidoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const pedidoId = params.id as string;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados locales para edición
  const [estado, setEstado] = useState<Pedido['estado']>('pendiente');
  const [nuevoPago, setNuevoPago] = useState<string>('');
  const [notas, setNotas] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');

  // ─────────────────────────────────────────────────────────────
  // 🔹 CARGA DEL PEDIDO
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchPedido = async () => {
      try {
        const res = await fetch(`/api/gestion/pedidos/${pedidoId}`, {
          headers: { 'Authorization': `Bearer ${session?.user?.token}` }
        });
        const data = await res.json();
        if (data.success) {
          setPedido(data.pedido);
          setEstado(data.pedido.estado);
          setNotas(data.pedido.notas || '');
          // Formatear fecha para input type="date" (YYYY-MM-DD)
          if (data.pedido.fechaEntregaEstimada) {
            setFechaEntrega(new Date(data.pedido.fechaEntregaEstimada).toISOString().split('T')[0]);
          }
        }
      } catch (error) {
        console.error('Error cargando pedido:', error);
        toast.error('No se pudo cargar el pedido', {
          style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && pedidoId) {
      fetchPedido();
    }
  }, [status, session, router, pedidoId]);

  // ─────────────────────────────────────────────────────────────
  // 🔹 ACCIONES
  // ─────────────────────────────────────────────────────────────
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Si hay un nuevo pago, lo sumamos a la seña actual
      const pagoNum = Number(nuevoPago) || 0;
      const nuevaSeña = (pedido?.seña || 0) + pagoNum;

      const res = await fetch(`/api/gestion/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`
        },
        body: JSON.stringify({
          estado,
          seña: nuevaSeña,
          notas,
          fechaEntregaEstimada: fechaEntrega
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('¡Pedido actualizado correctamente! ✨', {
          style: { background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }
        });
        setPedido(data.pedido); // Actualizar UI con nuevos datos
        setNuevoPago(''); // Limpiar input de pago
      } else {
        toast.error(data.message || 'Error al guardar', {
          style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
        });
      }
    } catch (error) {
      toast.error('Error de conexión', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás segura de eliminar este pedido permanentemente?')) return;
    
    try {
      const res = await fetch(`/api/gestion/pedidos/${pedidoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.user?.token}` }
      });
      if (res.ok) {
        toast.success('Pedido eliminado', {
          style: { background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }
        });
        router.push('/gestion/pedidos');
      }
    } catch (error) {
      toast.error('Error al eliminar', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
    }
  };

  // ✅ CORREGIDO: Usar la variable de estado 'pedido' (minúscula)
  const handleDownloadPDF = async () => {
    if (!pedido) return;
    try {
      // Generamos el blob del PDF
      const blob = await pdf(<PedidoPDF pedido={pedido} />).toBlob();
      
      // Creamos una URL temporal y forzamos la descarga
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // ✅ AQUÍ ESTABA EL ERROR: Pedido._id -> pedido._id
      link.download = `Pedido_CandyIlusiones_${pedido._id.slice(-6).toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Limpieza
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('¡PDF descargado con éxito! 📄', {
        style: { background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }
      });
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('No se pudo generar el PDF', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
    }
  };

  const formatPrice = (amount: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Helper para badge de estado
  const getStatusBadge = (estado: string) => {
    const styles: Record<string, { bg: string; text: string; border: string; icon: JSX.Element; label: string }> = {
      pendiente: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: <FaClock className="w-3 h-3" />, label: 'Pendiente' },
      en_produccion: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: <FaSpinner className="w-3 h-3 animate-spin" />, label: 'En Producción' },
      listo: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: <FaCheckCircle className="w-3 h-3" />, label: 'Listo para Retirar' },
      entregado: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200', icon: <FaCheckCircle className="w-3 h-3" />, label: 'Entregado' },
      cancelado: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <FaTimesCircle className="w-3 h-3" />, label: 'Cancelado' }
    };
    const style = styles[estado] || styles.pendiente;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
        {style.icon} {style.label}
      </span>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-10 h-10 text-rose-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-stone-500 font-medium animate-pulse">Cargando detalles del pedido...</span>
        </div>
      </div>
    );
  }

  if (!pedido) return null;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-50 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-3 rounded-2xl bg-white/80 border border-rose-200 text-stone-600 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm">
              <FaArrowLeft />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-800">Pedido #{pedido._id.slice(-6).toUpperCase()}</h1>
                {getStatusBadge(estado)}
              </div>
              <p className="text-stone-500 font-light">Creado el {formatDate(pedido.createdAt)}</p>
            </div>
          </div>
          
          {/* Botones de Acción */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadPDF} 
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <FaFilePdf className="text-lg" /> <span>Descargar PDF</span>
            </button>
            <button onClick={handleDelete} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white border border-red-200 text-red-600 font-bold shadow-sm hover:bg-red-50 hover:border-red-300 transition-all">
              <FaTrash /> <span>Eliminar</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ═══════════════════════════════════════════════════
              COLUMNA IZQUIERDA: DETALLES DEL PEDIDO (2/3)
              ═══════════════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card: Datos de la Clienta */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
              <h2 className="text-lg font-serif font-medium text-stone-800 mb-4">Datos de la Clienta</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Nombre</p>
                  <p className="text-lg font-medium text-stone-800">{pedido.clienteNombre}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Teléfono</p>
                  <a href={`https://wa.me/${pedido.clienteTelefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-2">
                    {pedido.clienteTelefono} <span className="text-xs bg-emerald-100 px-2 py-0.5 rounded-full">WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Card: Productos */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
              <h2 className="text-lg font-serif font-medium text-stone-800 mb-4 flex items-center gap-2">
                <FaBoxOpen className="text-rose-400" /> Productos Solicitados
              </h2>
              <div className="space-y-3">
                {pedido.productos.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-rose-50/30 border border-rose-100">
                    <div>
                      <p className="font-bold text-stone-800">{item.nombre}</p>
                      <p className="text-xs text-stone-500">{item.cantidad} x {formatPrice(item.precioUnitario)}</p>
                    </div>
                    <span className="font-bold text-stone-800">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card: Notas */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
              <h2 className="text-lg font-serif font-medium text-stone-800 mb-4 flex items-center gap-2">
                <FaStickyNote className="text-rose-400" /> Notas Internas
              </h2>
              <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={4}
                className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all resize-none"
                placeholder="Agrega observaciones sobre el pedido, personalizaciones o detalles de entrega..." />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              COLUMNA DERECHA: ACCIONES Y FINANZAS (Sticky)
              ═══════════════════════════════════════════════════ */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] p-6 border border-rose-100 shadow-[0_25px_50px_-12px_rgba(253,164,175,0.3)]">
                <h3 className="text-lg font-serif font-medium text-stone-800 mb-6 text-center">Gestión del Pedido</h3>
                
                {/* Cambiar Estado */}
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Estado Actual</label>
                  <select value={estado} onChange={e => setEstado(e.target.value as any)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all">
                    <option value="pendiente">🟡 Pendiente</option>
                    <option value="en_produccion">🔵 En Producción</option>
                    <option value="listo">🟢 Listo para Retirar</option>
                    <option value="entregado">⚪ Entregado</option>
                    <option value="cancelado">🔴 Cancelado</option>
                  </select>
                </div>

                {/* Fecha de Entrega */}
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Fecha de Entrega</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all" />
                  </div>
                </div>

                <div className="h-px bg-rose-100 my-6" />

                {/* Resumen Financiero */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Total del Pedido</span>
                    <span className="font-bold text-stone-800 text-lg">{formatPrice(pedido.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Ya Abonado (Seña)</span>
                    <span className="font-medium text-emerald-600">{formatPrice(pedido.seña)}</span>
                  </div>
                  <div className="h-px bg-rose-100" />
                  <div className="flex justify-between text-base">
                    <span className="font-bold text-stone-800">Saldo Pendiente</span>
                    <span className={`font-bold text-xl ${pedido.saldoPendiente > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {formatPrice(pedido.saldoPendiente)}
                    </span>
                  </div>
                </div>

                {/* Registrar Nuevo Pago */}
                {pedido.saldoPendiente > 0 && pedido.estado !== 'cancelado' && (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">Registrar Nuevo Pago ($)</label>
                    <input type="number" min="0" max={pedido.saldoPendiente} value={nuevoPago} onChange={e => setNuevoPago(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-emerald-300 text-stone-800 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                      placeholder="0" />
                    <p className="text-[10px] text-emerald-600 mt-2 text-center">
                      Este monto se sumará a la seña actual.
                    </p>
                  </div>
                )}

                {/* Botón Guardar */}
                <button onClick={handleSaveChanges} disabled={saving}
                  className="w-full group relative inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-500 overflow-hidden bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                  {!saving && <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />}
                  {saving ? (
                    <>
                      <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="relative z-10" />
                      <span className="relative z-10">Guardar Cambios</span>
                    </>
                  )}
                </button>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}