/* eslint-disable */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    email: '',
    phone: '',
    img: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Cargar datos del perfil
  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        const user = data.user;
        setFormData({
          name: user.name || '',
          lastName: user.lastName || '',
          address: user.address || '',
          city: user.city || '',
          zipCode: user.zipCode || '',
          email: user.email || '',
          phone: user.phone || '',
          img: user.img || '',
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al obtener el perfil:', error);
        toast.error('Error al cargar los datos del perfil', { 
          style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' } 
        });
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setFormData((prevData) => ({
        ...prevData,
        img: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('zipCode', formData.zipCode);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      if (imageFile) formDataToSend.append('img', imageFile);

      const response = await fetch('/api/user', {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el perfil');
      }

      toast.success('¡Perfil actualizado con éxito! 🎨', { 
        style: { background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' } 
      });
      setTimeout(() => router.push('/profile'), 1500);
    } catch (err: unknown) {
      setSubmitting(false);
      const errorMessage = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Ocurrió un error inesperado.';
      toast.error(errorMessage, { 
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' } 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          <span className="text-stone-500 text-sm font-medium">Cargando tu perfil...</span>
        </div>
      </div>
    );
  }

  // Clase reutilizable para inputs premium
  const inputClasses =
    "w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 " +
    "focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all duration-300";

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 overflow-hidden selection:bg-rose-200 selection:text-rose-900">
      
      {/* ✨ Background ambiental con orbes sedosos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-200/40 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-200/40 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto mt-40 px-4 py-12 sm:py-20">
        
        {/* Header elegante */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-serif font-medium text-stone-800 mb-3">
            Editar Perfil
          </h1>
          <p className="text-stone-500 font-light">
            Actualiza tu información para que podamos brindarte la mejor experiencia
          </p>
        </div>

        {/* Card principal con glassmorphism cremoso */}
        <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-10 border border-rose-100 shadow-[0_25px_50px_-12px_rgba(253,164,175,0.25)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Sección de Imagen de Perfil */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl bg-rose-50/50 border border-rose-100">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                  <img 
                    src={formData.img || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formData.name + '+' + formData.lastName) + '&background=FCE7F3&color=BE185D'} 
                    alt="Vista previa" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                </div>
                <label 
                  htmlFor="img" 
                  className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-110 transition-transform"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input type="file" id="img" name="img" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-sm font-bold text-stone-800 mb-1">Foto de Perfil</h3>
                <p className="text-xs text-stone-500 mb-4">JPG, PNG o WEBP. Recomendado: imagen cuadrada.</p>
                <label 
                  htmlFor="img" 
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 hover:border-rose-300 cursor-pointer transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Cambiar foto
                </label>
              </div>
            </div>

            {/* Grid de Campos de Texto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Nombre</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} placeholder="Tu nombre" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Apellido</label>
                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className={inputClasses} placeholder="Tu apellido" />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Correo Electrónico</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={inputClasses} placeholder="tu@email.com" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Teléfono</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} placeholder="+54 9 11 ..." />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Dirección</label>
                <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className={inputClasses} placeholder="Calle, número, piso..." />
              </div>
              <div>
                <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Ciudad</label>
                <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className={inputClasses} placeholder="Tu ciudad" />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Código Postal</label>
                <input type="text" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} className={inputClasses} placeholder="C.P." />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-rose-100">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 group relative inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-500 overflow-hidden ${
                  submitting 
                    ? 'bg-stone-200 cursor-not-allowed text-stone-400' 
                    : 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {!submitting && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                )}
                {submitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Guardar Cambios</span>
                    <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="flex-1 group inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white border-2 border-rose-200 text-stone-600 font-bold text-sm tracking-wide hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 transition-all duration-300"
              >
                <span>Cancelar</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastStyle={{ 
          borderRadius: '1rem', 
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 500
        }}
      />
    </div>
  );
}