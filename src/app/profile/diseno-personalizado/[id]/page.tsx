'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPaperPlane, FaCheckCircle, FaTimesCircle, FaImage } from 'react-icons/fa';

const ESTADOS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; description: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', description: 'Recibimos tu idea, la revisaremos pronto.' },
  en_revision: { label: 'En revisión', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', description: 'Estamos analizando tu solicitud.' },
  consulta: { label: 'Te consultamos', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', description: 'Necesitamos más información. ¡Mira el chat!' },
  vista_previa_enviada: { label: 'Vista previa lista', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', description: 'Aprobá o pedí cambios abajo.' },
  aprobado: { label: 'Aprobado', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', description: '¡Perfecto! Pasamos a producción.' },
  en_produccion: { label: 'En producción', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200', description: 'Ya estamos fabricando tu producto.' },
  completado: { label: 'Completado', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', description: '¡Tu producto está listo!' },
  rechazado: { label: 'No se pudo realizar', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', description: 'Lamentablemente no pudimos realizarlo.' }
};

export default function DetalleDisenoPage() {
  const router = useRouter();
  const params = useParams();
  // 🔒 Extraemos 'status' para verificar el estado de la sesión
  const { data: session, status } = useSession();
  const disenoId = params.id as string;

  const [diseno, setDiseno] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 🔒 SEGURIDAD: Redirigir al login si no está autenticado
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // 🔒 Cargar datos solo cuando la sesión esté confirmada como autenticada
  useEffect(() => {
    if (status === 'authenticated') {
      fetchDiseno();
    }
  }, [disenoId, status]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [diseno?.mensajes]);

  const fetchDiseno = async () => {
    try {
      const res = await fetch(`/api/gestion/diseno-personalizado/${disenoId}`, {
        headers: { 'Authorization': `Bearer ${session?.user?.token}` }
      });
      
      // 🔒 Seguridad extra: si el token expiró, redirigir al login
      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setDiseno(data.diseno);
      } else {
        toast.error('No se pudo cargar el diseño');
        router.push('/profile/diseno-personalizado');
      }
    } catch (error) {
      console.error('Error cargando diseño:', error);
      toast.error('Error cargando diseño');
    } finally {
      setLoading(false);
    }
  };

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !session?.user?.token) return;
    
    setEnviando(true);
    try {
      const res = await fetch(`/api/gestion/diseno-personalizado/${disenoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`
        },
        body: JSON.stringify({ mensaje: nuevoMensaje })
      });
      
      if (res.ok) {
        setNuevoMensaje('');
        fetchDiseno();
      } else if (res.status === 401) {
        router.push('/login');
      } else {
        toast.error('Error enviando mensaje');
      }
    } catch (error) {
      toast.error('Error enviando mensaje');
    } finally {
      setEnviando(false);
    }
  };

  const responderVistaPrevia = async (accion: 'aprobar' | 'rechazar') => {
    if (!session?.user?.token) return;

    try {
      const res = await fetch(`/api/gestion/diseno-personalizado/${disenoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`
        },
        body: JSON.stringify({
          accion,
          mensaje: accion === 'aprobar' 
            ? '¡Me encanta! Apruebo la vista previa.' 
            : 'Me gustaría hacer algunos cambios.'
        })
      });
      
      if (res.ok) {
        toast.success(accion === 'aprobar' ? '✅ ¡Aprobado!' : '📝 Pediste cambios');
        fetchDiseno();
      } else if (res.status === 401) {
        router.push('/login');
      } else {
        toast.error('Error al procesar la respuesta');
      }
    } catch (error) {
      toast.error('Error');
    }
  };

  // 🔒 Pantalla de carga mientras NextAuth verifica la sesión o se cargan los datos
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-10 h-10 text-rose-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span className="text-stone-500 font-medium">Cargando detalles del diseño...</span>
        </div>
      </div>
    );
  }

  if (!diseno) return null;

  const estadoConfig = ESTADOS_CONFIG[diseno.estado] || ESTADOS_CONFIG.pendiente;
  const puedeResponder = diseno.estado === 'vista_previa_enviada';

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8 pb-24 overflow-x-hidden">
      <div className="max-w-5xl mx-auto mt-50 sm:mt-52 space-y-6">
        
        {/* Header */}
        <div>
          <button onClick={() => router.push('/profile/diseno-personalizado')} className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors mb-2 text-sm font-medium">
            <FaArrowLeft /> Volver a mis diseños
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-800">{diseno.titulo}</h1>
              <p className="text-stone-500 text-sm mt-1">Creado el {new Date(diseno.createdAt).toLocaleDateString('es-AR')}</p>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase border ${estadoConfig.bg} ${estadoConfig.color} ${estadoConfig.border}`}>
              {estadoConfig.label}
            </div>
          </div>
          <p className="text-stone-600 text-sm mt-2 italic">{estadoConfig.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna izquierda: Detalles */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Info del producto */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-rose-100 shadow-sm">
              <h2 className="font-serif font-medium text-stone-800 text-lg mb-4">Detalles de tu idea</h2>
              <div className="space-y-3 text-sm">
                <div><span className="text-stone-500">Tipo:</span> <span className="font-medium text-stone-800 capitalize">{diseno.tipoProducto.replace('_', ' ')}</span></div>
                <div><span className="text-stone-500">Descripción:</span> <p className="text-stone-800 mt-1">{diseno.descripcion}</p></div>
                {diseno.colores && <div><span className="text-stone-500">Colores:</span> <span className="font-medium text-stone-800">{diseno.colores}</span></div>}
                {diseno.textoDeseado && <div><span className="text-stone-500">Texto:</span> <span className="font-medium text-stone-800 italic">"{diseno.textoDeseado}"</span></div>}
                <div><span className="text-stone-500">Cantidad:</span> <span className="font-medium text-stone-800">{diseno.cantidad}</span></div>
                {diseno.fechaLimite && <div><span className="text-stone-500">Fecha límite:</span> <span className="font-medium text-stone-800">{new Date(diseno.fechaLimite).toLocaleDateString('es-AR')}</span></div>}
                {diseno.presupuestoEstimado && <div><span className="text-stone-500">Presupuesto:</span> <span className="font-medium text-stone-800">${diseno.presupuestoEstimado.toLocaleString('es-AR')}</span></div>}
              </div>

              {diseno.imagenesReferencia?.length > 0 && (
                <div className="mt-5">
                  <p className="text-stone-500 text-sm mb-2">Imágenes de referencia:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {diseno.imagenesReferencia.map((url: string, i: number) => (
                      <img key={i} src={url} alt={`Ref ${i + 1}`} className="w-full h-32 object-cover rounded-xl border border-rose-200" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chat */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-rose-100 shadow-sm">
              <h2 className="font-serif font-medium text-stone-800 text-lg mb-4">💬 Conversación</h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {diseno.mensajes?.map((msg: any, i: number) => (
                  <div key={i} className={`flex ${msg.autor === 'cliente' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                      msg.autor === 'cliente'
                        ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white'
                        : 'bg-stone-100 text-stone-800'
                    }`}>
                      <p className="text-[10px] font-bold uppercase opacity-70 mb-1">
                        {msg.autor === 'cliente' ? 'Tú' : msg.nombreAutor}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{msg.contenido}</p>
                      {msg.imagen && (
                        <img src={msg.imagen} alt="Vista previa" className="mt-2 rounded-lg max-w-full border border-white/20" />
                      )}
                      <p className={`text-[10px] mt-1.5 text-right ${msg.autor === 'cliente' ? 'text-white/70' : 'text-stone-400'}`}>
                        {new Date(msg.createdAt).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Botones de aprobación si hay vista previa */}
              {puedeResponder && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <p className="text-sm font-bold text-indigo-800 mb-3">📸 Hay una vista previa esperándote</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => responderVistaPrevia('aprobar')}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors"
                    >
                      <FaCheckCircle /> Me encanta
                    </button>
                    <button
                      onClick={() => responderVistaPrevia('rechazar')}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-amber-300 text-amber-700 font-bold text-sm hover:bg-amber-50 transition-colors"
                    >
                      <FaTimesCircle /> Pedir cambios
                    </button>
                  </div>
                </div>
              )}

              {/* Input de mensaje */}
              {diseno.estado !== 'completado' && diseno.estado !== 'rechazado' && (
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={e => setNuevoMensaje(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && enviarMensaje()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-3 rounded-xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                  />
                  <button
                    onClick={enviarMensaje}
                    disabled={enviando || !nuevoMensaje.trim()}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center"
                  >
                    {enviando ? (
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    ) : (
                      <FaPaperPlane />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: Resumen */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white/90 backdrop-blur-2xl rounded-[2rem] p-6 border border-rose-100 shadow-lg">
              <h3 className="font-serif font-medium text-stone-800 text-lg mb-4">Resumen</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Estado actual:</span>
                  <span className={`font-bold ${estadoConfig.color}`}>{estadoConfig.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Mensajes:</span>
                  <span className="font-bold text-stone-800">{diseno.mensajes?.length || 0}</span>
                </div>
                {diseno.precioFinal && (
                  <div className="pt-3 border-t border-rose-100">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Precio final:</span>
                      <span className="font-bold text-rose-600 text-lg">${diseno.precioFinal.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}