'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { 
    FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, 
    FaArrowLeft, FaCheck, FaSpinner, FaUndo, FaExclamationTriangle, FaMagic, FaStickyNote
} from 'react-icons/fa';

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

interface ClienteForm {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  notas: string;
}

interface FieldErrors {
  telefono?: string;
  email?: string;
}

export default function EditarClientePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ClienteForm>({
    nombre: '', apellido: '', telefono: '', email: '',
    direccion: '', ciudad: '', notas: ''
  });
  const [originalForm, setOriginalForm] = useState<ClienteForm | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Verificación de seguridad
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
    }
  }, [status, session, router]);

  // Cargar datos del cliente
  useEffect(() => {
    if (status !== 'authenticated' || !id) return;
    
    const fetchCliente = async () => {
      try {
        const res = await fetch(`/api/gestion/clientes/${id}`, {
          headers: { 'Authorization': `Bearer ${session?.user?.token}` }
        });
        
        if (!res.ok) { 
          toast.error('Clienta no encontrada'); 
          router.push('/gestion/clientes'); 
          return; 
        }
        
        const data = await res.json();
        const cliente: Cliente = data.cliente;
        
        const formData: ClienteForm = {
          nombre: cliente.nombre || '',
          apellido: cliente.apellido || '',
          telefono: cliente.telefono || '',
          email: cliente.email || '',
          direccion: cliente.direccion || '',
          ciudad: cliente.ciudad || '',
          notas: cliente.notas || ''
        };
        
        setForm(formData);
        setOriginalForm(formData);
      } catch (err) { 
        toast.error('Error al cargar los datos de la clienta'); 
        router.push('/gestion/clientes');
      } finally { 
        setLoading(false); 
      }
    };
    
    fetchCliente();
  }, [status, id, router, session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleReset = () => {
    if (originalForm) {
      setForm(originalForm);
      setFieldErrors({});
      toast.info('Cambios descartados', {
        style: { background: '#FFFBEB', color: '#92400E', border: '1px solid #FCD34D' }
      });
    }
  };

  const validateForm = (): boolean => {
    if (!form.nombre.trim()) { toast.error('El nombre es obligatorio.'); return false; }
    if (!form.telefono.trim()) { toast.error('El teléfono es obligatorio.'); return false; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('El correo electrónico no es válido.'); return false;
    }
    return true;
  };

  const mapBackendErrorToField = (errorMessage: string): FieldErrors => {
    const errors: FieldErrors = {};
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('teléfono') || lowerError.includes('telefono')) {
      errors.telefono = errorMessage;
    }
    if (lowerError.includes('email') || lowerError.includes('correo')) {
      errors.email = errorMessage;
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !id) return;
    
    setFieldErrors({});
    setSaving(true);
    
    try {
      const clienteData = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
        ciudad: form.ciudad.trim() || undefined,
        notas: form.notas.trim() || undefined,
      };
      
      const res = await fetch(`/api/gestion/clientes/${id}`, {
        method: 'PUT', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`
        },
        body: JSON.stringify(clienteData),
      });
      
      const data = await res.json();
      
      if (res.ok) { 
        toast.success('¡Clienta actualizada con éxito! ✨', {
          style: { background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }
        }); 
        router.push('/gestion/clientes');
      } else { 
        const errorMessage = data.message || 'Error al actualizar la clienta';
        
        if (res.status === 409) {
          const errors = mapBackendErrorToField(errorMessage);
          setFieldErrors(errors);
          toast.error(errorMessage, {
            style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
          });
          
          const firstErrorField = Object.keys(errors)[0];
          if (firstErrorField) {
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              (element as HTMLInputElement).focus();
            }
          }
        } else {
          toast.error(errorMessage, {
            style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
          });
        }
      }
    } catch (err: any) { 
      console.error(err); 
      toast.error('Error de conexión con el servidor', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
    } finally { 
      setSaving(false); 
    }
  };

  const hasChanges = JSON.stringify(form) !== JSON.stringify(originalForm);

  // ✅ CLASES SEPARADAS PARA EVITAR SUPERPOSICIÓN DE ICONOS
  const inputBaseClasses = `w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all`;
  const inputWithIconClasses = `w-full pl-12 pr-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all`;

  const getInputClassName = (fieldName: keyof FieldErrors, baseClasses: string) => {
    const hasError = fieldErrors[fieldName];
    if (hasError) {
      return `${baseClasses} border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200 bg-red-50/50`;
    }
    return baseClasses;
  };

  const FieldErrorMessage = ({ fieldName }: { fieldName: keyof FieldErrors }) => {
    const error = fieldErrors[fieldName];
    if (!error) return null;
    
    return (
      <div className="mt-2 flex items-start gap-2 text-red-600 text-xs animate-in fade-in slide-in-from-top-1 duration-300">
        <FaExclamationTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <span className="font-medium">{error}</span>
      </div>
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
          <span className="text-stone-500 font-medium animate-pulse">Cargando datos de la clienta...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8">
      
      {/* ✨ Background decorativo sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-rose-200/40 via-pink-200/40 to-amber-200/40 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/20 to-rose-200/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto mt-50">

        {/* 🏷️ Header Premium */}
        <header className="mb-8">
          <Link 
            href="/gestion/clientes" 
            className="group inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 transition-colors mb-6"
          >
            <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Volver al listado</span>
          </Link>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-rose-200 shadow-sm mb-4 backdrop-blur-sm">
            <FaMagic className="text-rose-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-stone-600">Edición de Clienta</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-stone-800 mb-2">
            Editar Datos de la Clienta
          </h1>
          <p className="text-stone-500 text-base font-light">
            Modificá la información de contacto y detalles. Los cambios se guardarán al instante.
          </p>
        </header>

        {/* 📋 Formulario Premium */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
          
          <div className="space-y-8">
            
            {/* 👤 Sección: Datos Personales */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center text-rose-500 text-xs font-bold">1</span>
                Datos Personales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
                    Nombre <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text" name="nombre" value={form.nombre} onChange={handleChange} required
                      className={inputWithIconClasses}
                      placeholder="Ej: María"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
                    Apellido <span className="text-stone-400 font-normal normal-case">(opcional)</span>
                  </label>
                  <input
                    type="text" name="apellido" value={form.apellido} onChange={handleChange}
                    className={inputBaseClasses}
                    placeholder="Ej: González"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
                    Teléfono <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text" name="telefono" value={form.telefono} onChange={handleChange} required
                      className={getInputClassName('telefono', inputWithIconClasses)}
                      placeholder="Ej: 11 1234 5678"
                    />
                  </div>
                  <FieldErrorMessage fieldName="telefono" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
                    Email <span className="text-stone-400 font-normal normal-case">(opcional)</span>
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email" name="email" value={form.email} onChange={handleChange}
                      className={getInputClassName('email', inputWithIconClasses)}
                      placeholder="Ej: maria@email.com"
                    />
                  </div>
                  <FieldErrorMessage fieldName="email" />
                </div>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent" />

            {/* 📍 Sección: Ubicación y Detalles */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center text-rose-500 text-xs font-bold">2</span>
                Ubicación y Detalles
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
                      Dirección <span className="text-stone-400 font-normal normal-case">(opcional)</span>
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text" name="direccion" value={form.direccion} onChange={handleChange}
                        className={inputWithIconClasses}
                        placeholder="Ej: Av. Corrientes 1234"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
                      Ciudad <span className="text-stone-400 font-normal normal-case">(opcional)</span>
                    </label>
                    <input
                      type="text" name="ciudad" value={form.ciudad} onChange={handleChange}
                      className={inputBaseClasses}
                      placeholder="Ej: Buenos Aires"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1 flex items-center gap-1.5">
                    <FaStickyNote className="text-rose-400" />
                    Notas <span className="text-stone-400 font-normal normal-case">(opcional)</span>
                  </label>
                  <textarea
                    name="notas" value={form.notas} onChange={handleChange} rows={3}
                    className={inputBaseClasses + " resize-none"}
                    placeholder="Ej: Alérgica al látex, prefiere envíos los sábados, referida por Lucía..."
                  />
                </div>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent" />

            {/* 🎯 Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                type="submit" 
                disabled={saving || !hasChanges}
                className={`group relative flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm tracking-wide overflow-hidden transition-all duration-300
                  ${!hasChanges 
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.01] active:scale-[0.99]'
                  }
                `}
                title={!hasChanges ? 'No hay cambios para guardar' : 'Guardar modificaciones'}
              >
                <span className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ${!hasChanges ? 'hidden' : ''}`} />
                
                {saving ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin relative z-10" />
                    <span className="relative z-10">Guardando...</span>
                  </>
                ) : (
                  <>
                    <FaCheck className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                    <span className="relative z-10">Guardar Cambios</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                disabled={saving || !hasChanges}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300
                  ${!hasChanges 
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800'
                  }
                `}
              >
                <FaUndo className="w-4 h-4" />
                Descartar
              </button>
              
              <Link
                href="/gestion/clientes"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm tracking-wide bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all duration-300"
              >
                Cancelar
              </Link>
            </div>
          </div>
        </form>

        {/* 📌 Footer informativo */}
        <footer className="mt-6 text-center">
          <p className="text-stone-400 text-[10px] tracking-[0.25em] uppercase font-medium">
            Los campos marcados con <span className="text-rose-500">*</span> son obligatorios • 
            <span className="ml-1 text-rose-400"> {hasChanges ? '• Cambios sin guardar' : '• Todo actualizado'}</span>
            {Object.keys(fieldErrors).length > 0 && (
              <span className="ml-1 text-red-500">• {Object.keys(fieldErrors).length} campo(s) con duplicados</span>
            )}
          </p>
        </footer>
      </div>
    </div>
  );
}