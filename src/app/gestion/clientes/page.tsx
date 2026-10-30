'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  FaUsers, FaPlus, FaSearch, FaEdit, FaPhoneAlt,
  FaEnvelope, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaBan,
  FaArrowLeft
} from 'react-icons/fa';
import Link from 'next/link';

interface Cliente {
  _id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  notas?: string;
  activo: boolean;
}

export default function ClientesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const clientesPorPagina = 10;

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
    fetchClientes();
  }, [status, session, router, paginaActual]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/gestion/clientes?busqueda=${busqueda}&pagina=${paginaActual}&limite=${clientesPorPagina}`, {
        headers: { 'Authorization': `Bearer ${session?.user?.token}` },
        cache: 'no-store'
      });

      if (!res.ok) throw new Error('Error al cargar clientas');
      const data = await res.json();

      if (data.success) {
        setClientes(data.clientes);
        setTotalPaginas(data.paginas);
      }
    } catch (err) {
      console.error(err);
      toast.error('No se pudieron cargar las clientas', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda con debounce
  useEffect(() => {
    setPaginaActual(1);
    const timer = setTimeout(() => {
      if (status === 'authenticated') fetchClientes();
    }, 500);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const handleDesactivar = async (cliente: Cliente) => {
    const result = await Swal.fire({
      title: '¿Desactivar clienta?',
      text: `¿Seguro que deseas desactivar a "${cliente.nombre} ${cliente.apellido}"? No se eliminará su historial.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#BE185D',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      background: '#FFFBF7',
      color: '#44403C'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/gestion/clientes/${cliente._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.user?.token}` }
      });

      if (res.ok) {
        toast.success('Clienta desactivada correctamente', {
          style: { background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }
        });
        fetchClientes();
      } else {
        throw new Error('Error al desactivar');
      }
    } catch (error) {
      toast.error('Error de conexión', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
    }
  };

  const getInitials = (nombre: string, apellido: string) =>
    `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase() || 'CL';

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-10 h-10 text-rose-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-stone-500 font-medium animate-pulse">Cargando clientas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto mt-50 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>

            <Link
              href="/gestion"
              className="group inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 transition-colors mb-6"
            >
              <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Volver al panel</span>
            </Link>

            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-stone-800 mb-2">
              Gestión de Clientes
            </h1>
            <p className="text-stone-500 font-light">
              Administrá tu base de datos de clientas y sus datos de contacto.
            </p>
          </div>
          <button
            onClick={() => router.push('/gestion/clientes/nuevo')}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <FaPlus className="w-4 h-4" />
            <span>Nueva Clienta</span>
          </button>
        </div>

        {/* Barra de Búsqueda */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-rose-100 shadow-sm">
          <div className="relative max-w-xl">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, apellido, teléfono o email..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500 transition-colors text-xl"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Listado de Clientes */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <svg className="animate-spin w-8 h-8 text-rose-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-stone-500">Cargando clientas...</p>
            </div>
          ) : clientes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 mb-4">
                <FaUsers className="w-8 h-8 text-rose-300" />
              </div>
              <p className="text-stone-600 font-medium text-lg">
                {busqueda ? 'No se encontraron clientas que coincidan.' : 'No hay clientas registradas aún.'}
              </p>
              {!busqueda && (
                <button
                  onClick={() => router.push('/gestion/clientes/nuevo')}
                  className="inline-flex items-center gap-2 mt-4 text-rose-600 hover:text-rose-700 font-medium transition-colors"
                >
                  <FaPlus className="w-4 h-4" /> Registrar la primera
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-rose-100">
                {clientes.map((cliente) => (
                  <article key={cliente._id} className="group p-5 hover:bg-rose-50/30 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                      {/* Información */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 border border-rose-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-base font-bold text-rose-600">{getInitials(cliente.nombre, cliente.apellido)}</span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-stone-800 font-semibold truncate text-lg">
                                {cliente.nombre} {cliente.apellido}
                              </h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-stone-500">
                              {cliente.telefono && (
                                <span className="inline-flex items-center gap-1.5">
                                  <FaPhoneAlt className="w-3 h-3 text-rose-400" /> {cliente.telefono}
                                </span>
                              )}
                              {cliente.email && (
                                <span className="inline-flex items-center gap-1.5">
                                  <FaEnvelope className="w-3 h-3 text-rose-400" /> {cliente.email}
                                </span>
                              )}
                            </div>

                            {(cliente.direccion || cliente.ciudad) && (
                              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-stone-500">
                                <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0 text-rose-400" />
                                <span className="truncate">
                                  {[cliente.direccion, cliente.ciudad].filter(Boolean).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-wrap items-center justify-end gap-2 lg:border-l lg:border-rose-100 lg:pl-4">
                        <button
                          onClick={() => router.push(`/gestion/clientes/editar/${cliente._id}`)}
                          className="group/action inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-stone-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Editar clienta"
                        >
                          <FaEdit className="w-3.5 h-3.5 group-hover/action:scale-110 transition-transform" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => handleDesactivar(cliente)}
                          className="group/action inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-stone-500 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Desactivar clienta"
                        >
                          <FaBan className="w-3.5 h-3.5 group-hover/action:scale-110 transition-transform" />
                          <span>Desactivar</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-rose-100">
                  <p className="text-stone-500 text-sm">
                    Página <span className="text-stone-800 font-bold">{paginaActual}</span> de <span className="text-stone-800 font-bold">{totalPaginas}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                      disabled={paginaActual === 1}
                      className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-rose-200 text-stone-600 hover:bg-rose-50 hover:border-rose-300"
                    >
                      <FaChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                      Anterior
                    </button>

                    <button
                      onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                      disabled={paginaActual === totalPaginas}
                      className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-rose-200 text-stone-600 hover:bg-rose-50 hover:border-rose-300"
                    >
                      Siguiente
                      <FaChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}



