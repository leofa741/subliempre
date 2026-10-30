'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Loader from '@/app/components/loading/Loader';

// ─────────────────────────────────────────────────────────────
// 🔹 ICONOS
// ─────────────────────────────────────────────────────────────
const Icons = {
  Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  Package: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Spinner: () => <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
};

interface Insumo {
  _id: string;
  nombre: string;
  categoria: string;
  costo: number;
  cantidadPaquete: number;
  unidadMedida: string;
  stockActual: number;
}

export default function GestionInsumosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    costo: '',
    cantidadPaquete: '',
    unidadMedida: 'unidades',
    stockActual: ''
  });

  // ─────────────────────────────────────────────────────────────
  // 🔹 SEGURIDAD Y CARGA DE DATOS
  // ─────────────────────────────────────────────────────────────
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

    if (status === 'authenticated') {
      fetchInsumos();
    }
  }, [status, session, router]);

  const fetchInsumos = async () => {
    try {
      const res = await fetch('/api/gestion/insumos', {
        headers: { 'Authorization': `Bearer ${session?.user?.token}` }
      });
      
      if (res.status === 401 || res.status === 403) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setInsumos(data.insumos);
      }
    } catch (error) {
      console.error('Error cargando insumos:', error);
      toast.error('Error al cargar el inventario', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 🔹 HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (insumo: Insumo) => {
    setFormData({
      nombre: insumo.nombre,
      categoria: insumo.categoria,
      costo: insumo.costo.toString(),
      cantidadPaquete: insumo.cantidadPaquete.toString(),
      unidadMedida: insumo.unidadMedida,
      stockActual: insumo.stockActual.toString()
    });
    setEditingId(insumo._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, nombre: string) => {
    const result = await Swal.fire({
      title: '¿Estás segura?',
      text: `¿Deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#BE185D',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#FFFBF7',
      color: '#44403C'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/gestion/insumos?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.user?.token}` }
      });

      if (res.ok) {
        toast.success('Insumo eliminado correctamente', {
          style: { background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }
        });
        fetchInsumos();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      toast.error('Error de conexión al eliminar', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/gestion/insumos?id=${editingId}` : '/api/gestion/insumos';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`
        },
        body: JSON.stringify({
          ...formData,
          costo: Number(formData.costo),
          cantidadPaquete: Number(formData.cantidadPaquete),
          stockActual: Number(formData.stockActual) || 0
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(editingId ? '¡Insumo actualizado con éxito! 📦' : '¡Insumo registrado con éxito! 📦', {
          style: { background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }
        });
        setFormData({ nombre: '', categoria: '', costo: '', cantidadPaquete: '', unidadMedida: 'unidades', stockActual: '' });
        setEditingId(null);
        fetchInsumos();
      } else {
        toast.error(data.message || 'Error al guardar', {
          style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
        });
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor', {
        style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (amount: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);

  const calcularCostoUnitario = (costo: number, cantidad: number) => {
    return costo / cantidad;
  };

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <Loader message="Cargando inventario..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto mt-50 space-y-8">
        
        <div>

           <a href="/gestion" className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </a>



          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-stone-800 mb-2">
            Gestión de Insumos
          </h1>
          <p className="text-stone-500 font-light">
            Registra tus materiales para que el sistema calcule automáticamente el costo real de tus productos.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════
            FORMULARIO DE NUEVO / EDICIÓN DE INSUMO
            ═══════════════════════════════════════════════════ */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
          <h2 className="text-lg font-serif font-medium text-stone-800 mb-6 flex items-center gap-2">
            <Icons.Package /> {editingId ? 'Editar Material' : 'Agregar Nuevo Material'}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Nombre del Insumo</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                placeholder="Ej: Tinta de Sublimación Negra" />
            </div>

            {/* ✅ CAMBIO: Categoría flexible con Datalist */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Categoría</label>
              <input 
                list="categorias-insumos"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                placeholder="Ej: Tintas, Papeles, o escribe una nueva..."
              />
              <datalist id="categorias-insumos">
                <option value="Sublimación" />
                <option value="Envases y Tazas" />
                <option value="Papelería y Cajas" />
                <option value="Decoración" />
                <option value="Otros" />
              </datalist>
              <p className="text-[10px] text-stone-400 mt-1.5 ml-1 flex items-center gap-1">
                <span>💡</span> Selecciona una sugerencia o escribe tu propia categoría.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Unidad de Medida</label>
              <select name="unidadMedida" value={formData.unidadMedida} onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all">
                <option value="unidades">Unidades</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="litros">Litros (L)</option>
                <option value="kg">Kilogramos (kg)</option>
                <option value="gramos">Gramos (g)</option>
                <option value="mts">Metros (m)</option>
                <option value="hojas">Hojas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Costo del Paquete ($)</label>
              <input type="number" step="0.01" name="costo" value={formData.costo} onChange={handleChange} required
                className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                placeholder="0.00" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Cantidad en el Paquete</label>
              <input type="number" step="0.01" name="cantidadPaquete" value={formData.cantidadPaquete} onChange={handleChange} required
                className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                placeholder="Ej: 1000 (si son ml)" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Stock Actual (Opcional)</label>
              <input type="number" step="0.01" name="stockActual" value={formData.stockActual} onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                placeholder="0" />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 pt-2 flex gap-3">
              <button type="submit" disabled={submitting}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-500 overflow-hidden bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed">
                {!submitting && <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />}
                {submitting ? (
                  <><Icons.Spinner /> <span>Guardando...</span></>
                ) : (
                  <><Icons.Plus /> <span className="relative z-10">{editingId ? 'Actualizar Insumo' : 'Guardar Insumo'}</span></>
                )}
              </button>
              
              {editingId && (
                <button type="button" onClick={() => {
                  setFormData({ nombre: '', categoria: '', costo: '', cantidadPaquete: '', unidadMedida: 'unidades', stockActual: '' });
                  setEditingId(null);
                }} className="px-6 py-4 rounded-2xl font-bold text-sm tracking-wide text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ═══════════════════════════════════════════════════
            LISTA DE INSUMOS
            ═══════════════════════════════════════════════════ */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)] overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-rose-100 flex items-center justify-between">
            <h2 className="text-lg font-serif font-medium text-stone-800">Inventario de Materiales</h2>
            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
              {insumos.length} registrados
            </span>
          </div>

          {insumos.length === 0 ? (
            <div className="p-12 text-center text-stone-400">
              <Icons.Package />
              <p className="mt-4 font-medium">Aún no has registrado ningún insumo.</p>
              <p className="text-sm mt-1">Completa el formulario de arriba para comenzar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-rose-50/50 text-stone-500 text-xs uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4 text-right">Costo Paquete</th>
                    <th className="px-6 py-4 text-center">Contenido</th>
                    <th className="px-6 py-4 text-right">Costo Unitario</th>
                    <th className="px-6 py-4 text-center">Stock</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {insumos.map((insumo) => (
                    <tr key={insumo._id} className="hover:bg-rose-50/30 transition-colors group">
                      <td className="px-6 py-4 font-medium text-stone-800">{insumo.nombre}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold capitalize">
                          {insumo.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-stone-600">{formatPrice(insumo.costo)}</td>
                      <td className="px-6 py-4 text-center text-stone-600 text-sm">
                        {insumo.cantidadPaquete} {insumo.unidadMedida}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-rose-600">
                        {formatPrice(calcularCostoUnitario(insumo.costo, insumo.cantidadPaquete))} 
                        <span className="text-xs text-stone-400 font-normal"> /{insumo.unidadMedida}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                          insumo.stockActual > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {insumo.stockActual}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(insumo)} 
                            className="p-2 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-blue-500 transition-all"
                            title="Editar"
                          >
                            <Icons.Edit />
                          </button>
                          <button 
                            onClick={() => handleDelete(insumo._id, insumo.nombre)} 
                            className="p-2 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-red-500 transition-all"
                            title="Eliminar"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}