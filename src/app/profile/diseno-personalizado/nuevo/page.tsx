'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaUpload, FaTimes, FaPalette, FaImage, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';

const TIPOS_PRODUCTO = [
  { value: 'taza', label: '☕ Taza Sublimada', icon: '☕' },
  { value: 'remera', label: '👕 Remera Estampada', icon: '👕' },
  { value: 'llavero_3d', label: '🔑 Llavero Impresión 3D', icon: '🔑' },
  { value: 'figura_3d', label: '🗿 Figura Impresión 3D', icon: '🗿' },
  { value: 'sublimacion', label: '🎨 Otro producto sublimado', icon: '🎨' },
  { value: 'candy', label: '🍬 Candy / Dulces personalizados', icon: '🍬' },
  { value: 'decoracion', label: '🎉 Decoración de fiesta', icon: '🎉' },
  { value: 'otro', label: '✨ Otro', icon: '✨' }
];

export default function NuevoDisenoPage() {
  const router = useRouter();
  // 🔒 Extraemos 'status' para verificar el estado de la sesión
  const { data: session, status } = useSession();
  
  const [submitting, setSubmitting] = useState(false);
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    titulo: '',
    tipoProducto: '',
    descripcion: '',
    colores: '',
    textoDeseado: '',
    cantidad: 1,
    fechaLimite: '',
    presupuestoEstimado: ''
  });

  // 🔒 SEGURIDAD: Redirigir al login si no está autenticado
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imagenes.length > 5) {
      toast.error('Máximo 5 imágenes de referencia', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
      return;
    }

    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImagenes(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔒 Doble verificación de seguridad antes de enviar
    if (!session?.user?.token) {
      toast.error('Debes iniciar sesión para enviar un diseño', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
      router.push('/login');
      return;
    }

    if (!form.titulo || !form.tipoProducto || !form.descripcion) {
      toast.error('Completa los campos obligatorios', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Subir imágenes a Cloudinary
      const urlsImagenes: string[] = [];
      for (const img of imagenes) {
        const formData = new FormData();
        formData.append('image', img);
        const res = await fetch('/api/uploadImage', {
          method: 'POST',
          body: formData,
          headers: { 'Authorization': `Bearer ${session.user.token}` }
        });
        const data = await res.json();
        if (res.ok) urlsImagenes.push(data.url);
      }

      // 2. Crear la solicitud
      const res = await fetch('/api/gestion/diseno-personalizado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`
        },
        body: JSON.stringify({
          ...form,
          cantidad: Number(form.cantidad),
          presupuestoEstimado: form.presupuestoEstimado ? Number(form.presupuestoEstimado) : null,
          imagenesReferencia: urlsImagenes
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('🎨 ¡Solicitud enviada! Te responderemos pronto.', {
          style: { background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }
        });
        router.push('/profile/diseno-personalizado');
      } else {
        toast.error(data.message || 'Error al enviar', {
          style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
        });
      }
    } catch (error) {
      toast.error('Error de conexión', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 🔒 Pantalla de carga mientras NextAuth verifica la sesión
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-10 h-10 text-rose-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span className="text-stone-500 font-medium">Verificando sesión...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8 pb-24 overflow-x-hidden">
      <div className="max-w-3xl mx-auto mt-50 sm:mt-52 space-y-6">
        
        {/* Header */}
        <div>
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors mb-2">
            <FaArrowLeft className="w-4 h-4" /> Volver
          </button>
          <h1 className="text-2xl sm:text-4xl font-serif font-medium text-stone-800">
            🎨 Diseño Personalizado
          </h1>
          <p className="text-stone-500 font-light text-sm sm:text-base mt-1">
            Cuéntanos tu idea y la haremos realidad.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)] space-y-6">
          
          {/* Título */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
              Título de tu idea *
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={e => setForm({ ...form, titulo: e.target.value })}
              required
              className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
              placeholder="Ej: Taza con foto de mi hijo para su cumple"
            />
          </div>

          {/* Tipo de producto */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
              ¿Qué tipo de producto necesitas? *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TIPOS_PRODUCTO.map(tipo => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => setForm({ ...form, tipoProducto: tipo.value })}
                  className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    form.tipoProducto === tipo.value
                      ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white border-transparent shadow-md'
                      : 'bg-white border-rose-200 text-stone-700 hover:border-rose-300'
                  }`}
                >
                  <span className="text-xl block mb-1">{tipo.icon}</span>
                  {tipo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
              Describe tu idea con detalle *
            </label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              required
              rows={5}
              className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all resize-none"
              placeholder="Cuéntanos todo: qué quieres, para qué ocasión, estilo, etc."
            />
          </div>

          {/* Colores y Texto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1 flex items-center gap-1">
                <FaPalette className="w-3 h-3" /> Colores preferidos
              </label>
              <input
                type="text"
                value={form.colores}
                onChange={e => setForm({ ...form, colores: e.target.value })}
                className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                placeholder="Ej: Rosa y dorado"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
                Texto que debe llevar
              </label>
              <input
                type="text"
                value={form.textoDeseado}
                onChange={e => setForm({ ...form, textoDeseado: e.target.value })}
                className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                placeholder='Ej: "Feliz Cumple Mateo"'
              />
            </div>
          </div>

          {/* Cantidad y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={form.cantidad}
                onChange={e => setForm({ ...form, cantidad: Number(e.target.value) })}
                className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1 flex items-center gap-1">
                <FaCalendarAlt className="w-3 h-3" /> Fecha límite (opcional)
              </label>
              <input
                type="date"
                value={form.fechaLimite}
                onChange={e => setForm({ ...form, fechaLimite: e.target.value })}
                className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
              />
            </div>
          </div>

          {/* Presupuesto */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1 flex items-center gap-1">
              <FaDollarSign className="w-3 h-3" /> Presupuesto aproximado (opcional)
            </label>
            <input
              type="number"
              value={form.presupuestoEstimado}
              onChange={e => setForm({ ...form, presupuestoEstimado: e.target.value })}
              className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
              placeholder="Ej: 15000"
            />
            <p className="text-[10px] text-stone-400 mt-1.5 ml-1">
              💡 Ayúdanos a entender tu rango. Te cotizaremos algo acorde.
            </p>
          </div>

          {/* Imágenes de referencia */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1 flex items-center gap-1">
              <FaImage className="w-3 h-3" /> Imágenes de referencia (máx. 5)
            </label>
            <div className="relative">
              <input
                type="file"
                id="refImages"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                disabled={imagenes.length >= 5}
              />
              <label
                htmlFor="refImages"
                className={`flex items-center justify-center gap-2 w-full px-4 py-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  imagenes.length >= 5
                    ? 'border-stone-300 text-stone-400 cursor-not-allowed'
                    : 'border-rose-300 text-rose-600 hover:bg-rose-50/50'
                }`}
              >
                <FaUpload />
                <span className="text-sm font-medium">
                  {imagenes.length >= 5 ? 'Máximo alcanzado' : 'Subir imágenes de ejemplo'}
                </span>
              </label>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
                {previews.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img src={preview} alt={`Ref ${idx + 1}`} className="w-full h-24 object-cover rounded-xl border border-rose-200" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all overflow-hidden bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200/50 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Enviando tu idea...
              </>
            ) : (
              <>✨ Enviar mi idea personalizada</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}