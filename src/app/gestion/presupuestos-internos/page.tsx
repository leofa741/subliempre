'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { FaPlus, FaSearch, FaFileInvoiceDollar, FaTrash, FaEdit, FaSpinner, FaEye } from 'react-icons/fa';

interface InsumoPresupuesto {
  id: string; nombre: string; unidadMedida: string; costoUnitario: number; cantidad: number; subtotal: number; esPersonalizado: boolean;
}
interface PresupuestoInterno {
  _id: string; nombreProyecto: string; notasInternas: string; insumos: InsumoPresupuesto[]; tiempoManoDeObraMinutos: number; valorHoraManoDeObra: number; margenGananciaPorcentaje: number; precioFinalEstimado: number; costoTotal: number; createdAt: string;
}

export default function PresupuestosInternosPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [presupuestos, setPresupuestos] = useState<PresupuestoInterno[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated') fetchPresupuestos();
  }, [status, router]);

  const fetchPresupuestos = async () => {
    try {
      const res = await fetch('/api/gestion/presupuestos-internos', { headers: { 'Authorization': `Bearer ${session?.user?.token}` } });
      const data = await res.json();
      if (data.success) setPresupuestos(data.presupuestos);
    } catch (error) {
      toast.error('Error al cargar los presupuestos', { style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' } });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás segura de eliminar este presupuesto interno?')) return;
    try {
      const res = await fetch(`/api/gestion/presupuestos-internos?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${session?.user?.token}` } });
      if (res.ok) { toast.success('Presupuesto eliminado', { style: { background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' } }); fetchPresupuestos(); }
    } catch (error) { toast.error('Error de conexión', { style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' } }); }
  };

  const formatPrice = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  const filteredPresupuestos = presupuestos.filter(p => p.nombreProyecto.toLowerCase().includes(searchTerm.toLowerCase()));

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <div className="flex flex-col items-center gap-4"><FaSpinner className="animate-spin w-10 h-10 text-rose-400" /><span className="text-stone-500 font-medium animate-pulse">Cargando presupuestos...</span></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8 pb-24 overflow-x-hidden">
      {/* ✅ CORREGIDO: mt-8 en lugar de mt-50 */}
      <div className="max-w-7xl mx-auto mt-50 sm:mt-52 space-y-6 sm:space-y-8">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <a href="/gestion" className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Volver al Panel
            </a>
            <h1 className="text-2xl sm:text-4xl font-serif font-medium text-stone-800">Presupuestos Internos</h1>
            <p className="text-stone-500 font-light text-sm sm:text-base mt-1">Gestiona, visualiza y descarga las cotizaciones de proyectos personalizados.</p>
          </div>
          <button onClick={() => router.push('/gestion/presupuestos-internos/nuevo')} className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 active:scale-[0.98] transition-all">
            <FaPlus className="group-hover:rotate-90 transition-transform duration-300" /> <span>Nuevo Presupuesto</span>
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-rose-100 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input type="text" placeholder="Buscar por nombre del proyecto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-10 py-3 rounded-xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all text-base" />
            {searchTerm && (<button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500 transition-colors text-xl font-bold">×</button>)}
          </div>
        </div>

        {/* Vista Móvil */}
        <div className="md:hidden space-y-4">
          {filteredPresupuestos.length === 0 ? (
            <div className="bg-white/60 rounded-2xl p-8 text-center text-stone-400 border border-rose-100">
              <FaFileInvoiceDollar className="text-4xl mx-auto mb-3 text-rose-300" />
              <p className="font-medium text-stone-600">No se encontraron presupuestos</p>
            </div>
          ) : (
            filteredPresupuestos.map((presupuesto) => (
              <div key={presupuesto._id} className="w-full bg-white rounded-2xl p-4 border border-rose-100 shadow-sm active:scale-[0.99] transition-transform">
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-stone-800 text-base break-words">{presupuesto.nombreProyecto}</h3>
                    <p className="text-xs text-stone-500 mt-1">{formatDate(presupuesto.createdAt)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="bg-rose-50/50 p-2.5 rounded-xl"><p className="text-[10px] uppercase text-stone-400 font-bold mb-0.5">Costo Total</p><p className="font-semibold text-stone-700">{formatPrice(presupuesto.costoTotal)}</p></div>
                  <div className="bg-emerald-50/50 p-2.5 rounded-xl"><p className="text-[10px] uppercase text-stone-400 font-bold mb-0.5">Precio Estimado</p><p className="font-semibold text-emerald-700">{formatPrice(presupuesto.precioFinalEstimado)}</p></div>
                </div>
                
                {/* ✅ BOTONES SEPARADOS: Ver (PDF) y Editar */}
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => router.push(`/gestion/presupuestos-internos/${presupuesto._id}/ver`)} className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-blue-50 text-blue-600 font-semibold text-xs hover:bg-blue-100 transition-colors">
                    <FaEye className="w-4 h-4" /> <span>Ver / PDF</span>
                  </button>
                  <button onClick={() => router.push(`/gestion/presupuestos-internos/${presupuesto._id}`)} className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-semibold text-xs hover:bg-emerald-100 transition-colors">
                    <FaEdit className="w-4 h-4" /> <span>Editar</span>
                  </button>
                  <button onClick={() => handleDelete(presupuesto._id)} className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-xs hover:bg-red-100 transition-colors">
                    <FaTrash className="w-4 h-4" /> <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Vista Escritorio */}
        <div className="hidden md:block bg-white/80 backdrop-blur-xl rounded-[2rem] border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)] overflow-hidden">
          {filteredPresupuestos.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 mx-auto bg-rose-50 rounded-full flex items-center justify-center mb-4"><FaFileInvoiceDollar className="text-3xl text-rose-300" /></div>
              <p className="text-stone-600 font-medium text-lg">No se encontraron presupuestos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-rose-50/50 text-stone-500 text-xs uppercase tracking-wider font-bold border-b border-rose-100">
                    <th className="px-6 py-5">Proyecto</th>
                    <th className="px-6 py-5 text-right">Costo Total</th>
                    <th className="px-6 py-5 text-right">Precio Estimado</th>
                    <th className="px-6 py-5 text-center">Fecha</th>
                    <th className="px-6 py-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {filteredPresupuestos.map((presupuesto) => (
                    <tr key={presupuesto._id} className="group hover:bg-rose-50/30 transition-colors">
                      <td className="px-6 py-5"><p className="font-bold text-stone-800 text-base">{presupuesto.nombreProyecto}</p><p className="text-xs text-stone-500 mt-1">{presupuesto.insumos.length} insumos registrados</p></td>
                      <td className="px-6 py-5 text-right font-medium text-stone-700">{formatPrice(presupuesto.costoTotal)}</td>
                      <td className="px-6 py-5 text-right font-bold text-emerald-600">{formatPrice(presupuesto.precioFinalEstimado)}</td>
                      <td className="px-6 py-5 text-center text-sm text-stone-600">{formatDate(presupuesto.createdAt)}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* ✅ RUTA DE VER (PDF) */}
                          <button onClick={() => router.push(`/gestion/presupuestos-internos/${presupuesto._id}/ver`)} className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-blue-500 transition-all" title="Ver y Descargar PDF"><FaEye className="w-5 h-5" /></button>
                          {/* ✅ RUTA DE EDITAR */}
                          <button onClick={() => router.push(`/gestion/presupuestos-internos/${presupuesto._id}`)} className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-emerald-500 transition-all" title="Editar"><FaEdit className="w-5 h-5" /></button>
                          <button onClick={() => handleDelete(presupuesto._id)} className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-red-500 transition-all" title="Eliminar"><FaTrash className="w-5 h-5" /></button>
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