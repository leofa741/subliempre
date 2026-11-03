'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { FaPalette, FaClock, FaSpinner, FaCheckCircle, FaTimesCircle, FaArrowRight } from 'react-icons/fa';

const ESTADOS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  en_revision: { label: 'En revisión', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  consulta: { label: 'Consulta', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  vista_previa_enviada: { label: 'Preview enviado', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  aprobado: { label: 'Aprobado', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  en_produccion: { label: 'En producción', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  completado: { label: 'Completado', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  rechazado: { label: 'Rechazado', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' }
};

export default function GestionDisenosPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [disenos, setDisenos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    const allowedRoles = ['admin', 'superadmin', 'vendedor'];
    if (session?.user?.role && !allowedRoles.includes(session.user.role)) {
      toast.error('No tienes permisos');
      router.push('/');
      return;
    }
    if (status === 'authenticated') fetchDisenos();
  }, [status, session, router]);

  const fetchDisenos = async () => {
    try {
      const url = filtro === 'todos' ? '/api/gestion/diseno-personalizado/admin' : `/api/gestion/diseno-personalizado/admin?estado=${filtro}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${session?.user?.token}` }
      });
      const data = await res.json();
      if (data.success) setDisenos(data.disenos);
    } catch (error) {
      toast.error('Error cargando diseños');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') fetchDisenos();
  }, [filtro]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <svg className="animate-spin w-10 h-10 text-rose-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8 pb-24 overflow-x-hidden">
      <div className="max-w-7xl mx-auto mt-50 sm:mt-52 space-y-6">
        
        <div>
          <Link href="/gestion" className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors mb-2 text-sm">
            ← Volver al panel
          </Link>
          <h1 className="text-2xl sm:text-4xl font-serif font-medium text-stone-800">🎨 Diseños Personalizados</h1>
          <p className="text-stone-500 font-light text-sm sm:text-base mt-1">Gestiona las solicitudes de tus clientas</p>
        </div>

        {/* Filtros */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-rose-100 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {['todos', 'pendiente', 'en_revision', 'consulta', 'vista_previa_enviada', 'aprobado', 'en_produccion', 'completado'].map(est => (
              <button
                key={est}
                onClick={() => setFiltro(est)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  filtro === est
                    ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md'
                    : 'bg-white border border-rose-200 text-stone-600 hover:border-rose-300'
                }`}
              >
                {est === 'todos' ? 'Todos' : ESTADOS_CONFIG[est]?.label || est}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {disenos.length === 0 ? (
          <div className="bg-white/60 rounded-[2rem] p-12 text-center border border-rose-100">
            <FaPalette className="text-5xl text-rose-300 mx-auto mb-4" />
            <p className="text-stone-600 font-medium">No hay diseños con este filtro</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disenos.map(diseno => {
              const estadoConfig = ESTADOS_CONFIG[diseno.estado] || ESTADOS_CONFIG.pendiente;
              return (
                <Link
                  key={diseno._id}
                  href={`/gestion/diseno-personalizado/${diseno._id}`}
                  className="group bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="h-32 bg-gradient-to-br from-rose-100 to-pink-100 relative overflow-hidden">
                    {diseno.imagenesReferencia?.[0] ? (
                      <img src={diseno.imagenesReferencia[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-rose-300">
                        <FaPalette className="text-4xl" />
                      </div>
                    )}
                    <div className={`absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${estadoConfig.bg} ${estadoConfig.color} ${estadoConfig.border}`}>
                      {estadoConfig.label}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-stone-500 mb-1">{diseno.nombreCliente}</p>
                    <h3 className="font-bold text-stone-800 line-clamp-1 group-hover:text-rose-600 transition-colors">{diseno.titulo}</h3>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="text-stone-400">{new Date(diseno.createdAt).toLocaleDateString('es-AR')}</span>
                      <span className="text-rose-500 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Gestionar <FaArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}