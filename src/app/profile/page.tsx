/* eslint-disable */
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface UserData {
  name: string;
  lastName: string;
  address?: string;
  city?: string;
  zipCode?: string;
  email: string;
  phone?: string;
  img?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetch('/api/profile')
        .then((res) => res.json())
        .then((data: { user: UserData }) => {
          setUserData(data.user);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error al obtener el perfil:', error);
          setLoading(false);
        });
    }
  }, [status, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          <span className="text-stone-500 text-sm font-medium">Cargando tu perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 overflow-hidden selection:bg-rose-200 selection:text-rose-900">
      
      {/* ✨ Background ambiental con orbes sedosos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-200/40 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-200/40 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto mt-40 px-4 py-12 sm:py-20">
        
        {/* Header elegante */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-serif font-medium text-stone-800 mb-3">
            Mi Perfil
          </h1>
          <p className="text-stone-500 font-light">
            Gestiona tu información y preferencias en Candy Ilusiones
          </p>
        </div>

        {/* Card principal con glassmorphism cremoso */}
        <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2rem] p-8 sm:p-10 border border-rose-100 shadow-[0_25px_50px_-12px_rgba(253,164,175,0.25)]">
          
          <div className="flex flex-col items-center space-y-8">
            
            {/* Avatar con anillo degradado suave */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-300 via-pink-300 to-amber-200 rounded-full opacity-70 blur-md group-hover:opacity-100 transition-opacity duration-500" />
              {userData?.img ? (
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={userData.img}
                    alt="Foto de perfil"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    priority
                  />
                </div>
              ) : (
                <div className="relative w-28 h-28 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <svg className="w-12 h-12 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Nombre */}
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-stone-800">
                {userData?.name || 'Nombre'} {userData?.lastName || ''}
              </h2>
              <p className="text-stone-500 text-sm mt-1 font-medium">
                Cliente desde {new Date().getFullYear()}
              </p>
            </div>

            {/* Datos en grid elegante */}
            <div className="w-full space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField label="Correo Electrónico" value={userData?.email || '—'} icon="mail" />
                <DataField label="Teléfono" value={userData?.phone || '—'} icon="phone" />
                <DataField label="Dirección" value={userData?.address || '—'} icon="location" />
                <DataField label="Ciudad" value={userData?.city || '—'} icon="city" />
                <DataField label="Código Postal" value={userData?.zipCode || '—'} icon="zip" fullWidth />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 w-full pt-6 border-t border-rose-100">
              <Link
                href="/profile/edit"
                className="flex-1 group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <svg className="w-4 h-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <span className="relative z-10">Editar Perfil</span>
              </Link>
              
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex-1 group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border-2 border-rose-200 text-rose-600 font-bold text-sm tracking-wide hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 transition-all duration-300"
              >
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MODAL DE CONFIRMACIÓN DE SALIDA (Premium)
          ═══════════════════════════════════════════════════════ */}
      {showLogoutModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowLogoutModal(false)}
        >
          <div 
            className="relative w-full max-w-sm bg-white/95 backdrop-blur-2xl rounded-[2rem] p-8 border border-rose-100 shadow-2xl shadow-rose-200/50 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-rose-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-medium text-stone-800 mb-2">¿Cerrar sesión?</h3>
              <p className="text-stone-500 text-sm mb-8 leading-relaxed">
                Estás a punto de salir de tu cuenta en Candy Ilusiones. ¿Estás segura?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3.5 rounded-xl border-2 border-rose-200 text-stone-600 font-bold text-sm hover:bg-rose-50 hover:border-rose-300 transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Sí, salir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE AUXILIAR: DataField (Para mostrar datos con estilo)
// ─────────────────────────────────────────────────────────────
function DataField({ label, value, icon, fullWidth = false }: { label: string; value: string; icon: string; fullWidth?: boolean }) {
  const getIcon = () => {
    switch (icon) {
      case 'mail':
        return <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />;
      case 'phone':
        return <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />;
      case 'location':
        return <><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></>;
      case 'city':
        return <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />;
      case 'zip':
        return <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />;
      default:
        return null;
    }
  };

  return (
    <div className={`group p-4 rounded-2xl bg-rose-50/50 border border-rose-100 hover:border-rose-200 hover:bg-rose-50 transition-all duration-300 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white border border-rose-100 flex items-center justify-center text-rose-400 group-hover:text-rose-500 group-hover:scale-110 transition-all duration-300 shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {getIcon()}
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">{label}</p>
          <p className="text-sm font-medium text-stone-800 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}