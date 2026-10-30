'use client';

import { useState, useEffect, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { 
  FaClipboardList, FaPlus, FaSearch, FaFilter, 
  FaClock, FaSpinner, FaCheckCircle, FaTimesCircle, FaBoxOpen 
} from 'react-icons/fa';

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

export default function GestionPedidosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // ─────────────────────────────────────────────────────────────
  // 🔹 SEGURIDAD Y CARGA DE DATOS
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const allowedRoles = ['admin', 'superadmin', 'vendedor'];
    if (session?.user?.role && !allowedRoles.includes(session.user.role)) {
      toast.error('No tienes permisos para acceder a esta sección', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
      router.push('/');
      return;
    }

    fetchPedidos();
  }, [status, session, router, filterEstado]);

  const fetchPedidos = async () => {
    try {
      const url = `/api/gestion/pedidos${filterEstado !== 'todos' ? `?estado=${filterEstado}` : ''}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${session?.user?.token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPedidos(data.pedidos);
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      toast.error('Error al cargar los pedidos', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Filtrado local por búsqueda
  const filteredPedidos = pedidos.filter(p => 
    p.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clienteTelefono.includes(searchTerm)
  );

  // Cálculos de resumen
  const totalPendienteCobro = pedidos.reduce((acc, p) => acc + p.saldoPendiente, 0);
  const pedidosEnProduccion = pedidos.filter(p => p.estado === 'en_produccion').length;

  // Helper para badges de estado
  const getStatusBadge = (estado: string) => {
    const styles: Record<string, { bg: string; text: string; border: string; icon: JSX.Element; label: string }> = {
      pendiente: { 
        bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', 
        icon: <FaClock className="w-3 h-3" />, label: 'Pendiente' 
      },
      en_produccion: { 
        bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', 
        icon: <FaSpinner className="w-3 h-3 animate-spin" />, label: 'En Producción' 
      },
      listo: { 
        bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', 
        icon: <FaCheckCircle className="w-3 h-3" />, label: 'Listo' 
      },
      entregado: { 
        bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200', 
        icon: <FaCheckCircle className="w-3 h-3" />, label: 'Entregado' 
      },
      cancelado: { 
        bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', 
        icon: <FaTimesCircle className="w-3 h-3" />, label: 'Cancelado' 
      }
    };
    const style = styles[estado] || styles.pendiente;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
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
          <span className="text-stone-500 font-medium animate-pulse">Cargando pedidos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8">
      <div className="max-w-7xl mt-50 mx-auto space-y-8">
        
        {/* ═══════════════════════════════════════════════════
            HEADER Y RESUMEN FINANCIERO
            ═══════════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
              <a href="/gestion/productos" className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </a>
            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-stone-800 mb-2">
              Gestión de Pedidos
            </h1>
            <p className="text-stone-500 font-light">
              Controla el estado de producción y los cobros de cada trabajo.
            </p>
          </div>
          <button
            onClick={() => router.push('/gestion/pedidos/nuevo')}
            className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Nuevo Pedido</span>
          </button>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-rose-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Pedidos Activos</span>
              <FaClipboardList className="text-rose-300" />
            </div>
            <p className="text-3xl font-serif font-bold text-stone-800">{pedidos.filter(p => p.estado !== 'entregado' && p.estado !== 'cancelado').length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-rose-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">En Producción</span>
              <FaSpinner className="text-blue-300" />
            </div>
            <p className="text-3xl font-serif font-bold text-blue-600">{pedidosEnProduccion}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-rose-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Saldo por Cobrar</span>
              <FaBoxOpen className="text-emerald-300" />
            </div>
            <p className="text-3xl font-serif font-bold text-emerald-600">{formatPrice(totalPendienteCobro)}</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            FILTROS Y BÚSQUEDA
            ═══════════════════════════════════════════════════ */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-rose-100 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre de clienta o teléfono..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
            />
          </div>
          <div className="relative sm:w-64">
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <select 
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-rose-50/50 border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all appearance-none cursor-pointer"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_produccion">En Producción</option>
              <option value="listo">Listo para retirar</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            TABLA DE PEDIDOS
            ═══════════════════════════════════════════════════ */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)] overflow-hidden">
          {filteredPedidos.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 mx-auto bg-rose-50 rounded-full flex items-center justify-center mb-4">
                <FaClipboardList className="text-3xl text-rose-300" />
              </div>
              <p className="text-stone-600 font-medium text-lg">No se encontraron pedidos</p>
              <p className="text-stone-400 text-sm mt-1">Intenta ajustar los filtros o crea un nuevo pedido.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-rose-50/50 text-stone-500 text-xs uppercase tracking-wider font-bold border-b border-rose-100">
                    <th className="px-6 py-5">Clienta</th>
                    <th className="px-6 py-5">Estado</th>
                    <th className="px-6 py-5 text-right">Total</th>
                    <th className="px-6 py-5 text-right">Saldo Pendiente</th>
                    <th className="px-6 py-5 text-center">Entrega Est.</th>
                    <th className="px-6 py-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {filteredPedidos.map((pedido) => (
                    <tr key={pedido._id} className="group hover:bg-rose-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-bold text-stone-800 text-base">{pedido.clienteNombre}</p>
                        <p className="text-xs text-stone-500">{pedido.clienteTelefono}</p>
                        <p className="text-[10px] text-stone-400 mt-1">{pedido.productos.length} producto(s)</p>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(pedido.estado)}
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-stone-800">
                        {formatPrice(pedido.total)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {pedido.saldoPendiente > 0 ? (
                          <span className="font-bold text-amber-600">{formatPrice(pedido.saldoPendiente)}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-sm">
                            <FaCheckCircle className="w-3 h-3" /> Pagado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center text-sm text-stone-600">
                        {formatDate(pedido.fechaEntregaEstimada)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => router.push(`/gestion/pedidos/${pedido._id}`)} 
                            className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-blue-500 transition-all" 
                            title="Ver detalles / Editar"
                          >
                            <FaClipboardList />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}