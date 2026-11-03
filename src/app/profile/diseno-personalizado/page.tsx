'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaPlus, FaPalette, FaClock, FaCheckCircle, FaSpinner, FaTimesCircle, FaArrowRight } from 'react-icons/fa';

interface Diseno {
  _id: string;
  titulo: string;
  tipoProducto: string;
  estado: string;
  imagenesReferencia: string[];
  createdAt: string;
  mensajes: any[];
}

const ESTADOS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  pendiente: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: FaClock },
  en_revision: { label: 'En revisión', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: FaSpinner },
  consulta: { label: 'Te consultamos', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: FaPalette },
  vista_previa_enviada: { label: 'Vista previa lista', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: FaCheckCircle },
  aprobado: { label: 'Aprobado', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: FaCheckCircle },
  en_produccion: { label: 'En producción', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200', icon: FaSpinner },
  completado: { label: 'Completado', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: FaCheckCircle },
  rechazado: { label: 'No se pudo realizar', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: FaTimesCircle }
};

const TIPOS_LABEL: Record<string, string> = {
  taza: '☕ Taza',
  remera: '👕 Remera',
  llavero_3d: '🔑 Llavero 3D',
  figura_3d: '🗿 Figura 3D',
  sublimacion: '🎨 Sublimación',
  candy: '🍬 Candy',
  decoracion: '🎉 Decoración',
  otro: '✨ Otro'
};

export default function MisDisenosPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [disenos, setDisenos] = useState<Diseno[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔒 SEGURIDAD: Manejo robusto de la sesión
  useEffect(() => {
    // 1. Esperar a que NextAuth termine de verificar la sesión
    if (status === 'loading') return;

    // 2. Si no está autenticado, redirigir inmediatamente al login
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // 3. Si está autenticado, cargar los diseños
    if (status === 'authenticated') {
      fetchDisenos();
    }
  }, [status, router]);

  const fetchDisenos = async () => {
    try {
      const res = await fetch('/api/gestion/diseno-personalizado', {
        headers: { 'Authorization': `Bearer ${session?.user?.token}` }
      });
      
      // 🔒 Seguridad extra: si el token expiró, redirigir al login
      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setDisenos(data.disenos);
      }
    } catch (error) {
      console.error('Error al cargar diseños:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔒 Mostrar loader mientras carga la sesión O los datos
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-10 h-10 text-rose-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span className="text-stone-500 font-medium">Cargando tus diseños...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8 pb-24 overflow-x-hidden">
      <div className="max-w-6xl mx-auto mt-50 sm:mt-52 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/profile" className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors mb-2 text-sm font-medium">
              ← Volver a mi perfil
            </Link>
            <h1 className="text-2xl sm:text-4xl font-serif font-medium text-stone-800">
              🎨 Mis Diseños Personalizados
            </h1>
            <p className="text-stone-500 font-light text-sm sm:text-base mt-1">
              Sigue el estado de tus ideas en tiempo real.
            </p>
          </div>
          <Link
            href="/profile/diseno-personalizado/nuevo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
          >
            <FaPlus /> Nueva idea
          </Link>
        </div>

        {/* Lista */}
        {disenos.length === 0 ? (
          <div className="bg-white/60 rounded-[2rem] p-12 text-center border border-rose-100">
            <div className="w-20 h-20 mx-auto bg-rose-50 rounded-full flex items-center justify-center mb-4">
              <FaPalette className="text-3xl text-rose-300" />
            </div>
            <p className="text-stone-600 font-medium text-lg">Aún no tienes diseños personalizados</p>
            <p className="text-stone-400 text-sm mt-1 mb-6">¿Tienes una idea en mente? ¡Nosotros la hacemos realidad!</p>
            <Link
              href="/profile/diseno-personalizado/nuevo"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold"
            >
              Crear mi primer diseño <FaArrowRight />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disenos.map(diseno => {
              const estadoConfig = ESTADOS_CONFIG[diseno.estado] || ESTADOS_CONFIG.pendiente;
              const Icon = estadoConfig.icon;
              
              return (
                <Link
                  key={diseno._id}
                  href={`/profile/diseno-personalizado/${diseno._id}`}
                  className="group bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-lg hover:border-rose-200 transition-all overflow-hidden"
                >
                  {/* Imagen de portada o placeholder */}
                  <div className="h-40 bg-gradient-to-br from-rose-100 to-pink-100 relative overflow-hidden">
                    {diseno.imagenesReferencia?.[0] ? (
                      <img src={diseno.imagenesReferencia[0]} alt={diseno.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-rose-300">
                        <FaPalette className="text-5xl" />
                      </div>
                    )}
                    {/* Badge de estado */}
                    <div className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${estadoConfig.bg} ${estadoConfig.color} ${estadoConfig.border}`}>
                      <Icon className="w-3 h-3" /> {estadoConfig.label}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">
                      {TIPOS_LABEL[diseno.tipoProducto] || diseno.tipoProducto}
                    </p>
                    <h3 className="font-bold text-stone-800 text-base mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors">
                      {diseno.titulo}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>{new Date(diseno.createdAt).toLocaleDateString('es-AR')}</span>
                      <span className="inline-flex items-center gap-1 text-rose-500 font-medium group-hover:gap-2 transition-all">
                        Ver <FaArrowRight className="w-2.5 h-2.5" />
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