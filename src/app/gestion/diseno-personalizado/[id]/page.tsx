'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { FaArrowLeft, FaPaperPlane, FaImage, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const ESTADOS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  en_revision: { label: 'En revisión', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  consulta: { label: 'Consulta', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  vista_previa_enviada: { label: 'Vista previa enviada', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  aprobado: { label: 'Aprobado por cliente', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  en_produccion: { label: 'En producción', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  completado: { label: 'Completado', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  rechazado: { label: 'Rechazado', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' }
};

export default function GestionDisenoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const disenoId = params.id as string;

  const [diseno, setDiseno] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados del chat y acciones
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [imagenMensaje, setImagenMensaje] = useState(''); // URL de la vista previa (ej: de Cloudinary)
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [enviando, setEnviando] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDiseno();
  }, [disenoId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [diseno?.mensajes]);

  const fetchDiseno = async () => {
    try {
      const res = await fetch(`/api/gestion/diseno-personalizado/${disenoId}`, {
        headers: { 'Authorization': `Bearer ${session?.user?.token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDiseno(data.diseno);
        setEstadoSeleccionado(data.diseno.estado);
      } else {
        toast.error('No se pudo cargar el diseño');
        router.push('/gestion/diseno-personalizado');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarRespuesta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() && estadoSeleccionado === diseno.estado && !imagenMensaje.trim()) return;

    setEnviando(true);
    try {
      const res = await fetch(`/api/gestion/diseno-personalizado/${disenoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`
        },
        body: JSON.stringify({
          estado: estadoSeleccionado,
          mensaje: nuevoMensaje.trim(),
          imagenMensaje: imagenMensaje.trim() || null
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Respuesta enviada y estado actualizado');
        setNuevoMensaje('');
        setImagenMensaje('');
        fetchDiseno();
      } else {
        toast.error(data.message || 'Error al responder');
      }
    } catch (error) {
      toast.error('Error de conexión al responder');
    } finally {
      setEnviando(false);
    }
  };

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

  if (!diseno) return null;

  const estadoConfig = ESTADOS_CONFIG[diseno.estado] || ESTADOS_CONFIG.pendiente;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8 pb-24 overflow-x-hidden">
      <div className="max-w-7xl mx-auto mt-50 sm:mt-52 space-y-6">
        
        {/* Header */}
        <div>
          <Link href="/gestion/diseno-personalizado" className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors mb-2 text-sm font-medium">
            <FaArrowLeft /> Volver a la lista
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-800">{diseno.titulo}</h1>
              <p className="text-stone-500 text-sm mt-1">
                Solicitado por <span className="font-semibold text-stone-700">{diseno.nombreCliente}</span> · {new Date(diseno.createdAt).toLocaleDateString('es-AR')}
              </p>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase border ${estadoConfig.bg} ${estadoConfig.color} ${estadoConfig.border}`}>
              {estadoConfig.label}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Detalles de la solicitud */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-rose-100 shadow-sm">
              <h2 className="font-serif font-medium text-stone-800 text-lg mb-4">📋 Detalles del Pedido</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-stone-500 block text-xs uppercase font-bold mb-1">Producto</span>
                  <span className="font-medium text-stone-800 capitalize">{diseno.tipoProducto.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-xs uppercase font-bold mb-1">Descripción</span>
                  <p className="text-stone-800 bg-rose-50/50 p-3 rounded-xl border border-rose-100">{diseno.descripcion}</p>
                </div>
                {diseno.colores && (
                  <div>
                    <span className="text-stone-500 block text-xs uppercase font-bold mb-1">Colores</span>
                    <span className="font-medium text-stone-800">{diseno.colores}</span>
                  </div>
                )}
                {diseno.textoDeseado && (
                  <div>
                    <span className="text-stone-500 block text-xs uppercase font-bold mb-1">Texto a incluir</span>
                    <span className="font-medium text-stone-800 italic">"{diseno.textoDeseado}"</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-stone-500 block text-xs uppercase font-bold mb-1">Cantidad</span>
                    <span className="font-medium text-stone-800">{diseno.cantidad}</span>
                  </div>
                  {diseno.fechaLimite && (
                    <div>
                      <span className="text-stone-500 block text-xs uppercase font-bold mb-1">Fecha límite</span>
                      <span className="font-medium text-stone-800">{new Date(diseno.fechaLimite).toLocaleDateString('es-AR')}</span>
                    </div>
                  )}
                </div>
                {diseno.presupuestoEstimado && (
                  <div>
                    <span className="text-stone-500 block text-xs uppercase font-bold mb-1">Presupuesto del cliente</span>
                    <span className="font-medium text-emerald-600">${diseno.presupuestoEstimado.toLocaleString('es-AR')}</span>
                  </div>
                )}
              </div>

              {/* Imágenes de referencia */}
              {diseno.imagenesReferencia?.length > 0 && (
                <div className="mt-6">
                  <span className="text-stone-500 block text-xs uppercase font-bold mb-2">Imágenes de referencia</span>
                  <div className="grid grid-cols-2 gap-2">
                    {diseno.imagenesReferencia.map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block group">
                        <img src={url} alt={`Ref ${i + 1}`} className="w-full h-28 object-cover rounded-xl border border-rose-200 group-hover:border-rose-400 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Datos de contacto */}
              <div className="mt-6 pt-6 border-t border-rose-100">
                <span className="text-stone-500 block text-xs uppercase font-bold mb-2">Contacto del cliente</span>
                <p className="text-sm text-stone-800">📧 {diseno.emailCliente}</p>
                {diseno.telefonoCliente && <p className="text-sm text-stone-800 mt-1">📱 {diseno.telefonoCliente}</p>}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Chat y Gestión de Estado */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Selector de Estado */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-rose-100 shadow-sm">
              <h2 className="font-serif font-medium text-stone-800 text-lg mb-4">⚙️ Gestionar Estado</h2>
              <select
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-rose-50/50 border border-rose-200 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
              >
                {Object.entries(ESTADOS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <p className="text-xs text-stone-500 mt-2">
                💡 Tip: Si cambias a "Vista previa enviada", puedes adjuntar la URL de la imagen del diseño en el chat de abajo.
              </p>
            </div>

            {/* Chat */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-rose-100 shadow-sm flex flex-col h-[600px]">
              <h2 className="font-serif font-medium text-stone-800 text-lg mb-4">💬 Conversación con el cliente</h2>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                {diseno.mensajes?.map((msg: any, i: number) => (
                  <div key={i} className={`flex ${msg.autor === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      msg.autor === 'admin'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                        : 'bg-stone-100 text-stone-800'
                    }`}>
                      <p className="text-[10px] font-bold uppercase opacity-70 mb-1">
                        {msg.autor === 'admin' ? 'Tú (Admin)' : msg.nombreAutor}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{msg.contenido}</p>
                      {msg.imagen && (
                        <a href={msg.imagen} target="_blank" rel="noopener noreferrer" className="block mt-2">
                          <img src={msg.imagen} alt="Vista previa" className="rounded-lg max-w-full border border-white/20 hover:opacity-90 transition-opacity" />
                        </a>
                      )}
                      <p className={`text-[10px] mt-1.5 text-right ${msg.autor === 'admin' ? 'text-white/70' : 'text-stone-400'}`}>
                        {new Date(msg.createdAt).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Formulario de respuesta */}
              <form onSubmit={handleEnviarRespuesta} className="border-t border-rose-100 pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    URL de imagen de vista previa (opcional)
                  </label>
                  <div className="relative">
                    <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <input
                      type="url"
                      value={imagenMensaje}
                      onChange={(e) => setImagenMensaje(e.target.value)}
                      placeholder="https://res.cloudinary.com/... (Pega aquí el link de la imagen del diseño)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder="Escribe tu respuesta o instrucciones para el cliente..."
                    className="flex-1 px-4 py-3 rounded-xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={enviando || (!nuevoMensaje.trim() && estadoSeleccionado === diseno.estado && !imagenMensaje.trim())}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    {enviando ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                    <span className="hidden sm:inline">Enviar</span>
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}