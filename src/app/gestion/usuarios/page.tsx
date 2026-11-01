'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { FaUsers, FaUserShield, FaUserTie, FaUser, FaSave, FaArrowLeft, FaLock } from 'react-icons/fa';

interface User {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  role: string;
  google: string;
}

export default function GestionUsuariosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user?.role !== 'admin' && session?.user?.role !== 'superadmin') {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'Solo los administradores pueden gestionar roles.',
        confirmButtonColor: '#BE185D'
      });
      router.push('/gestion');
      return;
    }

    fetchUsers();
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gestion/usuarios', {
        headers: { 'Authorization': `Bearer ${session?.user?.token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        throw new Error('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de carga',
        text: 'No se pudo cargar la lista de usuarios.',
        confirmButtonColor: '#BE185D'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string, currentRole: string) => {
    if (userId === session?.user?.id) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'No puedes cambiar tu propio rol por seguridad. Pídele a otro administrador que lo haga.',
        confirmButtonColor: '#BE185D',
        background: '#FFFBF7',
        color: '#44403C'
      });
      fetchUsers();
      return;
    }

    if (['admin', 'superadmin'].includes(newRole) && !['admin', 'superadmin'].includes(currentRole)) {
      const confirm = await Swal.fire({
        icon: 'warning',
        title: '¿Ascender a este usuario?',
        text: `Estás a punto de otorgar permisos de "${newRole}". Esta acción le dará acceso total al panel de administración.`,
        showCancelButton: true,
        confirmButtonColor: '#BE185D',
        cancelButtonColor: '#9CA3AF',
        confirmButtonText: 'Sí, otorgar permisos',
        cancelButtonText: 'Cancelar',
        background: '#FFFBF7',
        color: '#44403C'
      });

      if (!confirm.isConfirmed) {
        fetchUsers();
        return;
      }
    }

    setSavingId(userId);
    try {
      const res = await fetch(`/api/gestion/usuarios/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Rol actualizado!',
          text: data.message,
          timer: 2000,
          showConfirmButton: false,
          background: '#FFFBF7',
          color: '#44403C'
        });
        fetchUsers();
      } else {
        throw new Error(data.message || 'Error al actualizar');
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo actualizar el rol del usuario.',
        confirmButtonColor: '#BE185D',
        background: '#FFFBF7',
        color: '#44403C'
      });
    } finally {
      setSavingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-100 text-fuchsia-700 text-xs font-bold uppercase border border-fuchsia-200"><FaUserShield className="w-3 h-3" /> Superadmin</span>;
      case 'admin':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase border border-rose-200"><FaUserTie className="w-3 h-3" /> Admin</span>;
      case 'vendedor':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase border border-amber-200"><FaUserTie className="w-3 h-3" /> Vendedor</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase border border-stone-200"><FaUser className="w-3 h-3" /> Cliente</span>;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-10 h-10 text-rose-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-stone-500 font-medium animate-pulse">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  return (
    // 🛡️ BLINDADO: overflow-x-hidden y pb-24 para evitar scroll horizontal y dar espacio al final
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8 pb-24 overflow-x-hidden">
      <div className="max-w-6xl mx-auto mt-8 sm:mt-12 space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <a href="/gestion" className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors mb-2">
              <FaArrowLeft className="w-4 h-4" /> Volver al Panel
            </a>
            <h1 className="text-2xl sm:text-4xl font-serif font-medium text-stone-800">
              Gestión de Roles
            </h1>
            <p className="text-stone-500 font-light text-sm sm:text-base mt-1">
              Asigna permisos de administrador o vendedor a los usuarios registrados.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 border border-rose-200 shadow-sm">
            <FaUsers className="text-rose-400" />
            <span className="text-sm font-bold text-stone-600">{users.length} Usuarios</span>
          </div>
        </div>

        {/* 🛡️ Aviso de Seguridad */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <FaLock className="text-amber-600 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800 mb-1">Política de Seguridad</p>
            <p className="text-xs text-amber-700">
              Por motivos de seguridad, <strong>no puedes modificar tu propio rol</strong>. Si necesitas cambiar tus permisos, solicita que otro administrador lo haga. 
              Además, solo los <strong>Superadministradores</strong> pueden otorgar el rol de Superadministrador.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            VISTA MÓVIL: LISTA VERTICAL DE TARJETAS (BLINDADA)
            ═══════════════════════════════════════════════════ */}
        <div className="md:hidden space-y-4">
          {users.length === 0 ? (
            <div className="p-12 text-center bg-white/60 rounded-2xl border border-rose-100">
              <FaUsers className="w-12 h-12 text-rose-300 mx-auto mb-4" />
              <p className="text-stone-500 font-medium">No hay usuarios registrados aún.</p>
            </div>
          ) : (
            users.map((user) => {
              const esUsuarioActual = user._id === session?.user?.id;
              
              return (
                <div key={user._id} className="w-full bg-white rounded-2xl p-4 border border-rose-100 shadow-sm active:scale-[0.99] transition-transform overflow-hidden">
                  {/* Cabecera: Avatar + Nombre */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border flex-shrink-0 ${
                      esUsuarioActual 
                        ? 'bg-gradient-to-br from-rose-200 to-pink-200 text-rose-700 border-rose-300' 
                        : 'bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600 border-rose-200'
                    }`}>
                      {user.name?.charAt(0) || 'U'}{user.lastName?.charAt(0) || ''}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-stone-800 text-base break-words leading-tight">
                          {user.name} {user.lastName}
                        </p>
                        {esUsuarioActual && (
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200 uppercase">
                            Tú
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 break-all mt-0.5">{user.email}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{user.google ? 'Registrado con Google' : 'Registro manual'}</p>
                    </div>
                  </div>

                  {/* Rol Actual */}
                  <div className="mb-4">
                    <p className="text-[10px] uppercase text-stone-400 font-bold mb-1.5 ml-1">Rol Actual</p>
                    <div className="inline-block">
                      {getRoleBadge(user.role)}
                    </div>
                  </div>

                  {/* Área de Acción */}
                  {esUsuarioActual ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 text-sm">
                      <FaLock className="w-4 h-4 flex-shrink-0 text-stone-400" />
                      <span className="font-medium">No puedes modificar tu propio rol por seguridad.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] uppercase text-stone-400 font-bold mb-1.5 ml-1">Asignar Nuevo Rol</p>
                        <select 
                          id={`role-select-${user._id}`}
                          defaultValue={user.role}
                          className="w-full px-4 py-3.5 rounded-xl bg-rose-50/50 border border-rose-200 text-stone-800 text-base focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all appearance-none"
                        >
                          <option value="user">Cliente (user)</option>
                          <option value="vendedor">Vendedor</option>
                          <option value="admin">Administrador</option>
                          {session?.user?.role === 'superadmin' && (
                            <option value="superadmin">Superadministrador</option>
                          )}
                        </select>
                      </div>
                      <button 
                        onClick={() => {
                          const select = document.getElementById(`role-select-${user._id}`) as HTMLSelectElement;
                          handleRoleChange(user._id, select.value, user.role);
                        }}
                        disabled={savingId === user._id}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingId === user._id ? (
                          <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <FaSave className="w-4 h-4" />
                        )}
                        Guardar Cambios
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
            VISTA ESCRITORIO: TABLA (Oculta en móvil)
            ═══════════════════════════════════════════════════ */}
        <div className="hidden md:block bg-white/80 backdrop-blur-xl rounded-[2rem] border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-rose-50/50 text-stone-500 text-xs uppercase tracking-wider font-bold border-b border-rose-100">
                  <th className="px-6 py-5">Usuario</th>
                  <th className="px-6 py-5">Email</th>
                  <th className="px-6 py-5 text-center">Rol Actual</th>
                  <th className="px-6 py-5">Asignar Nuevo Rol</th>
                  <th className="px-6 py-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100">
                {users.map((user) => {
                  const esUsuarioActual = user._id === session?.user?.id;
                  
                  return (
                    <tr 
                      key={user._id} 
                      className={`group transition-colors ${
                        esUsuarioActual 
                          ? 'bg-rose-50/40 border-l-4 border-l-rose-400' 
                          : 'hover:bg-rose-50/30'
                      }`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border flex-shrink-0 ${
                            esUsuarioActual 
                              ? 'bg-gradient-to-br from-rose-200 to-pink-200 text-rose-700 border-rose-300' 
                              : 'bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600 border-rose-200'
                          }`}>
                            {user.name?.charAt(0) || 'U'}{user.lastName?.charAt(0) || ''}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-stone-800 text-sm break-words">{user.name} {user.lastName}</p>
                              {esUsuarioActual && (
                                <span className="text-[9px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200 uppercase">
                                  Tú
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-400 mt-0.5">{user.google ? 'Registrado con Google' : 'Registro manual'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-stone-600 break-all">{user.email}</td>
                      <td className="px-6 py-5 text-center">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-5">
                        {esUsuarioActual ? (
                          <div className="flex items-center gap-2 text-stone-400 text-sm italic bg-stone-100 px-3 py-2 rounded-xl border border-stone-200 w-full sm:w-auto">
                            <FaLock className="w-3 h-3" />
                            <span>Bloqueado</span>
                          </div>
                        ) : (
                          <select 
                            id={`role-select-desktop-${user._id}`}
                            defaultValue={user.role}
                            className="w-full sm:w-48 px-3 py-2.5 rounded-xl bg-white border border-rose-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                          >
                            <option value="user">Cliente (user)</option>
                            <option value="vendedor">Vendedor</option>
                            <option value="admin">Administrador</option>
                            {session?.user?.role === 'superadmin' && (
                              <option value="superadmin">Superadministrador</option>
                            )}
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {esUsuarioActual ? (
                          <span className="text-xs text-stone-400 italic">—</span>
                        ) : (
                          <button 
                            onClick={() => {
                              const select = document.getElementById(`role-select-desktop-${user._id}`) as HTMLSelectElement;
                              handleRoleChange(user._id, select.value, user.role);
                            }}
                            disabled={savingId === user._id}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {savingId === user._id ? (
                              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <FaSave className="w-4 h-4" />
                            )}
                            Guardar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && (
            <div className="p-12 text-center">
              <FaUsers className="w-12 h-12 text-rose-300 mx-auto mb-4" />
              <p className="text-stone-500 font-medium">No hay usuarios registrados aún.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}