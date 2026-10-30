// src/app/gestion/logs/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import connectDB from "@/app/lib/mongoose";
import LogModel from "@/app/models/LogLogin";
import FilterForm from './app/gestion/logins/components/FilterForm';
// Nota: Asegúrate de que esta ruta de importación sea correcta en tu estructura de carpetas


export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

// 🎨 Sistema de diseño Premium Candy Ilusiones
const theme = {
    bg: 'bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30',
    bgCard: 'bg-white/80 backdrop-blur-xl',
    bgCardHover: 'hover:bg-rose-50/40',
    border: 'border-rose-100',
    textPrimary: 'text-stone-800',
    textSecondary: 'text-stone-500',
    textAccent: 'text-rose-600',
    gradient: 'from-rose-200/40 via-pink-200/40 to-amber-200/40',
    shadow: 'shadow-[0_8px_30px_rgb(253,164,175,0.15)]',
};

// Helper para badges de proveedor con estilo pastel
const getProviderBadge = (provider: string) => {
    const config: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
        google: { 
            label: "Google", 
            bg: "bg-rose-50", 
            text: "text-rose-700", 
            border: "border-rose-200", 
            dot: "bg-rose-400" 
        },
        credentials: { 
            label: "Email / Contraseña", 
            bg: "bg-blue-50", 
            text: "text-blue-700", 
            border: "border-blue-200", 
            dot: "bg-blue-400" 
        },
    };
    
    const style = config[provider] || { 
        label: provider, 
        bg: "bg-stone-100", 
        text: "text-stone-700", 
        border: "border-stone-200", 
        dot: "bg-stone-400" 
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border} transition-all`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {style.label}
        </span>
    );
};

export default async function LoginsPage({
    searchParams,
}: {
    searchParams: Promise<{ email?: string; provider?: string; page?: string }>;
}) {
    // ===============================
    // 🔒 VALIDACIÓN DE SESIÓN Y ROL
    // ===============================
    const session = await getServerSession(authOptions);

    if (!session) redirect('/login');

    const allowedRoles = ['superadmin', 'admin', 'vendedor']; // Agregado vendedor por si necesita ver logs
    if (!allowedRoles.includes(session.user.role)) {
        redirect('/');
    }

    // ===============================
    // ✅ LÓGICA DE DATOS
    // ===============================
    await connectDB();
    const params = await searchParams;

    const emailFilter = params.email || "";
    const providerFilter = params.provider || "";
    const currentPage = Math.max(1, parseInt(params.page || "1", 10));

    const query: any = {};
    if (emailFilter) query.email = { $regex: emailFilter, $options: "i" };
    if (providerFilter) query.provider = providerFilter;

    const totalLogs = await LogModel.countDocuments(query);
    const totalPages = Math.ceil(totalLogs / PAGE_SIZE) || 1;

    const logs = await LogModel.find(query)
        .sort({ timestamp: -1 })
        .limit(PAGE_SIZE)
        .skip((currentPage - 1) * PAGE_SIZE);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString("es-AR", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    };

    const buildUrl = (page: number) => {
        const urlParams = new URLSearchParams();
        if (emailFilter) urlParams.set("email", emailFilter);
        if (providerFilter) urlParams.set("provider", providerFilter);
        urlParams.set("page", page.toString());
        return `/gestion/logs?${urlParams.toString()}`;
    };

    const userName = session.user.name || 'Administradora';

    return (
        <div className={`min-h-screen ${theme.bg} relative overflow-hidden`}>

            {/* ✨ Background decorativo sutil */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <div className={`absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br ${theme.gradient} rounded-full blur-[100px]`} />
                <div className={`absolute bottom-0 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 to-rose-200/30 rounded-full blur-[100px]`} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto mt-50 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

                {/* 🏷️ Header Premium */}
                <header className="mb-10">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-rose-200 shadow-sm mb-4 backdrop-blur-sm">
                                <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="text-[10px] tracking-[0.25em] uppercase text-stone-600 font-bold">Auditoría de Seguridad</span>
                            </div>
                            
                            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-stone-800 mb-2">
                                Bitácora de Accesos
                            </h1>
                            
                            <p className={`${theme.textSecondary} text-base font-light`}>
                                Registros de inicio de sesión • Administrado por <span className={`${theme.textAccent} font-medium`}>{userName}</span>
                            </p>
                        </div>

                        {/* 📊 Resumen rápido */}
                        <div className="flex items-center gap-3">
                            <div className={`px-5 py-3 rounded-2xl bg-white/60 border ${theme.border} text-right shadow-sm`}>
                                <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Total registros</p>
                                <p className="text-2xl font-serif font-medium text-stone-800">{totalLogs.toLocaleString('es-AR')}</p>
                            </div>
                            <div className={`px-5 py-3 rounded-2xl bg-white/60 border ${theme.border} text-right shadow-sm`}>
                                <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Página</p>
                                <p className="text-2xl font-serif font-medium text-stone-800">{currentPage}<span className="text-stone-400 text-base">/{totalPages}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* 🔗 Breadcrumb elegante */}
                    <nav className="mt-6 flex items-center text-sm">
                        <a href="/gestion" className={`${theme.textSecondary} hover:${theme.textAccent} transition-colors flex items-center gap-1.5`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Gestión
                        </a>
                        <span className={`${theme.textSecondary} mx-2`}>/</span>
                        <span className="text-stone-800 font-medium">Bitácora</span>
                    </nav>
                </header>

                {/* 🔍 Filtros - Card Premium */}
                <section className={`mb-8 ${theme.bgCard} ${theme.border} rounded-[2rem] p-6 sm:p-8 ${theme.shadow}`}>
                    <div className="flex items-center gap-2 mb-6">
                        <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">Filtros de Búsqueda</h2>
                    </div>
                    <div className={`${theme.textSecondary}`}>
                        {/* El componente FilterForm debería usar inputs con la clase: 
                            "w-full px-4 py-3 rounded-xl bg-rose-50/50 border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200" 
                        */}
                        <FilterForm />
                    </div>
                </section>

                {/* 📋 Tabla de Logs - Diseño Premium */}
                {logs.length === 0 ? (
                    <div className={`text-center py-16 ${theme.bgCard} ${theme.border} rounded-[2rem] ${theme.shadow}`}>
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 border border-rose-100 mb-5">
                            <svg className="w-8 h-8 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p className={`${theme.textPrimary} text-lg font-medium`}>No se encontraron registros</p>
                        <p className="text-stone-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda para ver resultados.</p>
                    </div>
                ) : (
                    <div className={`${theme.bgCard} ${theme.border} rounded-[2rem] overflow-hidden ${theme.shadow}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="bg-rose-50/50 text-stone-500 text-xs uppercase tracking-wider font-bold border-b border-rose-100">
                                        <th className="text-left py-5 px-6">Usuario</th>
                                        <th className="text-left py-5 px-6">Método de Acceso</th>
                                        <th className="text-left py-5 px-6">Fecha y Hora</th>
                                        <th className="text-right py-5 px-6">Detalles</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-rose-100">
                                    {logs.map((log: any, index: number) => (
                                        <tr 
                                            key={log._id} 
                                            className={`group transition-all duration-300 ${theme.bgCardHover}`}
                                        >
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 border border-rose-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                        <span className="text-sm font-bold text-rose-600">
                                                            {log.email?.charAt(0).toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-medium text-stone-800 break-all">{log.email}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                {getProviderBadge(log.provider)}
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="text-sm">
                                                    <p className="font-medium text-stone-800">{formatDate(log.timestamp).split(',')[0]}</p>
                                                    <p className="text-stone-400 text-xs mt-0.5">{formatDate(log.timestamp).split(',')[1].trim()} hs</p>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <button 
                                                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-rose-500"
                                                    title="Ver detalles completos"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 📄 Paginación Premium */}
                {totalLogs > PAGE_SIZE && (
                    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <span className={`${theme.textSecondary} text-sm`}>
                            Mostrando <span className="text-stone-800 font-bold">{((currentPage - 1) * PAGE_SIZE) + 1}</span> -{" "}
                            <span className="text-stone-800 font-bold">{Math.min(currentPage * PAGE_SIZE, totalLogs)}</span> de{" "}
                            <span className="text-stone-800 font-bold">{totalLogs}</span> registros
                        </span>
                        
                        <div className="flex items-center gap-2">
                            {currentPage > 1 ? (
                                <a
                                    href={buildUrl(currentPage - 1)}
                                    className={`
                                        group flex items-center gap-1.5 px-5 py-3 rounded-xl
                                        bg-white border ${theme.border} text-sm font-medium text-stone-600
                                        hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 hover:shadow-md
                                        transition-all duration-300
                                    `}
                                >
                                    <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Anterior
                                </a>
                            ) : (
                                <span className="px-5 py-3 rounded-xl bg-stone-100/50 border border-stone-200 text-sm text-stone-400 cursor-not-allowed">
                                    Anterior
                                </span>
                            )}

                            {/* Números de página */}
                            <div className="hidden sm:flex items-center gap-1.5">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <a
                                            key={pageNum}
                                            href={buildUrl(pageNum)}
                                            className={`
                                                w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300
                                                ${currentPage === pageNum 
                                                    ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200/50 scale-105' 
                                                    : 'text-stone-500 hover:text-stone-800 hover:bg-white hover:border hover:border-rose-200'
                                                }
                                            `}
                                        >
                                            {pageNum}
                                        </a>
                                    );
                                })}
                            </div>

                            {currentPage < totalPages ? (
                                <a
                                    href={buildUrl(currentPage + 1)}
                                    className={`
                                        group flex items-center gap-1.5 px-5 py-3 rounded-xl
                                        bg-white border ${theme.border} text-sm font-medium text-stone-600
                                        hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 hover:shadow-md
                                        transition-all duration-300
                                    `}
                                >
                                    Siguiente
                                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            ) : (
                                <span className="px-5 py-3 rounded-xl bg-stone-100/50 border border-stone-200 text-sm text-stone-400 cursor-not-allowed">
                                    Siguiente
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* 📌 Footer informativo */}
                <footer className="mt-16 text-center">
                    <p className={`${theme.textSecondary} text-[10px] tracking-[0.25em] uppercase font-medium`}>
                        Bitácora de Seguridad • Logs en tiempo real • Candy Ilusiones © {new Date().getFullYear()}
                    </p>
                </footer>
            </div>
        </div>
    );
}