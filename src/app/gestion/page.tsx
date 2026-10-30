// src/app/gestion/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    FaBoxOpen,
    FaUsers,
    FaClipboardList,
    FaArrowRight,
    FaBoxes
} from 'react-icons/fa';
import Loader from '@/app/components/loading/Loader'; // Ajusta la ruta si es necesario

// Módulos disponibles (Actualizados para Candy Ilusiones)
const modules = [
    {
        id: 'productos',
        title: 'Catálogo y Costos',
        description: 'Administra tus productos, insumos y calcula márgenes de ganancia en tiempo real.',
        icon: <FaBoxOpen className="text-2xl text-rose-500" />,
        iconBg: 'from-rose-100 to-pink-100',
        href: '/gestion/productos',
    },
        {
        id: 'insumos',
        title: 'Gestión de Insumos',
        description: 'Administra tus insumos y calcula márgenes de ganancia en tiempo real.',
        icon: <FaBoxes className="text-2xl text-rose-500" />,
        iconBg: 'from-rose-100 to-pink-100',
        href: '/gestion/insumos',
    },
    {
        id: 'clientes',
        title: 'Base de Clientes',
        description: 'Gestiona tus clientas, historial de pedidos, señas y condiciones de pago.',
        icon: <FaUsers className="text-2xl text-purple-500" />,
        iconBg: 'from-purple-100 to-fuchsia-100',
        href: '/gestion/clientes'
    },
      {
        id: 'pedidos',
        title: 'Gestión de Pedidos',
        description: 'Controla el estado de producción y los cobros de cada trabajo.',
        icon: <FaClipboardList className="text-2xl text-rose-500" />,
        iconBg: 'from-rose-100 to-pink-100',
        href: '/gestion/pedidos'
    },
    {
        id: 'logs',
        title: 'Auditoría de Seguridad',
        description: 'Revisa el historial de inicios de sesión y accesos al sistema.',
        icon: <FaClipboardList className="text-2xl text-cyan-500" />,
        iconBg: 'from-cyan-100 to-sky-100',
        href: '/gestion/logs',
    },
];

export default function GestionPage() {
    const { status, data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    // ✅ Estado para controlar si ya se validó el rol
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    // 🔒 Validación estricta de autenticación y rol
    useEffect(() => {
        const validateAccess = async () => {
            if (status === 'loading') return;

            // Si no está autenticado
            if (status === 'unauthenticated') {
                router.push('/login');
                setIsAuthorized(false);
                return;
            }

            // Verificar token y rol
            const token = session?.user?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
            if (!token) {
                router.push('/login');
                setIsAuthorized(false);
                return;
            }

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const allowedRoles = ['superadmin', 'admin', 'vendedor'];

                if (!allowedRoles.includes(payload.role)) {
                    router.push('/');
                    setIsAuthorized(false);
                    return;
                }

                setIsAuthorized(true);
            } catch (err) {
                console.error('Token inválido', err);
                router.push('/login');
                setIsAuthorized(false);
            }
        };

        validateAccess();
    }, [status, session, router, pathname]);

    // ✅ Mientras se valida, mostrar el Loader personalizado
    if (status === 'loading' || isAuthorized === null) {
        return <Loader message="Preparando tu panel de gestión..." />;
    }

    // ✅ Si no está autorizado, no mostrar nada (ya se redirigió)
    if (!isAuthorized) {
        return null;
    }

    // ✅ Render principal
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 overflow-hidden">
            
            {/* ✨ Background decorativo sutil */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-200/40 via-pink-200/40 to-amber-200/40 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 to-purple-200/30 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto mt-50 px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                
                {/* 🏷️ Header Premium */}
                <header className="mb-12 text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-rose-200 shadow-sm mb-4 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                        <span className="text-[10px] tracking-[0.25em] uppercase text-stone-600 font-bold">Panel de Administración</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-stone-800 mb-3">
                        Gestión Operativa
                    </h1>
                    <p className="text-stone-500 text-lg font-light max-w-2xl">
                        Bienvenida, <span className="text-rose-600 font-medium">{session?.user?.name || 'Administradora'}</span>. 
                        Accede a todos los módulos de tu emprendimiento en un solo lugar.
                    </p>
                </header>

                {/* 📦 Grid de Módulos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {modules.map((module) => (
                        <Link
                            key={module.id}
                            href={module.href}
                            className="group block"
                        >
                            <div className="relative h-full bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)] hover:bg-rose-50/50 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-200/40 hover:-translate-y-1 transition-all duration-300">
                                
                                {/* Icono con fondo degradado */}
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300 shadow-sm`}>
                                    {module.icon}
                                </div>

                                {/* Contenido */}
                                <h2 className="text-xl font-serif font-medium text-stone-800 mb-3 group-hover:text-rose-600 transition-colors">
                                    {module.title}
                                </h2>
                                <p className="text-stone-500 text-sm leading-relaxed mb-6">
                                    {module.description}
                                </p>

                                {/* Indicador de acción */}
                                <div className="flex items-center gap-2 text-rose-500 font-bold text-sm opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                    <span>Acceder al módulo</span>
                                    <FaArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* 📌 Footer informativo */}
                <footer className="mt-16 text-center">
                    <p className="text-stone-400 text-[10px] tracking-[0.25em] uppercase font-medium">
                        Candy Ilusiones • Sistema de Gestión Integral • {new Date().getFullYear()}
                    </p>
                </footer>
            </div>
        </div>
    );
}