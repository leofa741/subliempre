'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { FaArrowLeft, FaTimes, FaPlus, FaSpinner } from 'react-icons/fa';

interface InsumoDB {
  _id: string;
  nombre: string;
  costo: number;
  cantidadPaquete: number;
  unidadMedida: string;
}

interface InsumoItem {
  id: string;
  nombre: string;
  unidadMedida: string;
  costoUnitario: number;
  cantidad: number;
  subtotal: number;
  esPersonalizado: boolean;
}

export default function EditarPresupuestoInternoPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const presupuestoId = params.id as string;

  const [loadingPage, setLoadingPage] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [insumosDisponibles, setInsumosDisponibles] = useState<InsumoDB[]>([]);

  // Estados del Proyecto
  const [nombreProyecto, setNombreProyecto] = useState('');
  const [notasInternas, setNotasInternas] = useState('');

  // Estados de Insumos
  const [insumosSeleccionados, setInsumosSeleccionados] = useState<InsumoItem[]>([]);
  const [modoAgregado, setModoAgregado] = useState<'catalogo' | 'manual'>('catalogo');
  
  // Catálogo
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInsumoId, setSelectedInsumoId] = useState('');
  const [cantidadInsumo, setCantidadInsumo] = useState<number | ''>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Manual
  const [insumoManual, setInsumoManual] = useState({ nombre: '', cantidad: 1, costoUnitario: 0, unidadMedida: 'unidades' });

  // Costos
  const [tiempoMinutos, setTiempoMinutos] = useState<number | ''>(30);
  const [valorHora, setValorHora] = useState<number | ''>(5000);
  const [margenGanancia, setMargenGanancia] = useState<number | ''>(50);
  const [precioManual, setPrecioManual] = useState<number | ''>('');

  // Cargar datos iniciales
  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/gestion/insumos', { headers: { 'Authorization': `Bearer ${session?.user?.token}` } }).then(r => r.json()),
        fetch(`/api/gestion/presupuestos-internos?id=${presupuestoId}`, { headers: { 'Authorization': `Bearer ${session?.user?.token}` } }).then(r => r.json())
      ]).then(([insumosData, presupuestoData]) => {
        if (insumosData.success) setInsumosDisponibles(insumosData.insumos);
        if (presupuestoData.success) {
          const p = presupuestoData.presupuesto;
          setNombreProyecto(p.nombreProyecto);
          setNotasInternas(p.notasInternas || '');
          setInsumosSeleccionados(p.insumos);
          setTiempoMinutos(p.tiempoManoDeObraMinutos);
          setValorHora(p.valorHoraManoDeObra);
          setMargenGanancia(p.margenGananciaPorcentaje);
          setPrecioManual(p.precioFinalEstimado);
        }
        setLoadingPage(false);
      }).catch(() => {
        toast.error('Error cargando datos');
        setLoadingPage(false);
      });
    }
  }, [status, session, router, presupuestoId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculos = useMemo(() => {
    const costoInsumos = insumosSeleccionados.reduce((sum, item) => sum + item.subtotal, 0);
    const tiempoHoras = (Number(tiempoMinutos) || 0) / 60;
    const costoManoObra = tiempoHoras * (Number(valorHora) || 0);
    const costoTotalProduccion = costoInsumos + costoManoObra;
    const margenDecimal = (Number(margenGanancia) || 0) / 100;
    const precioSugerido = costoTotalProduccion + (costoTotalProduccion * margenDecimal);
    const precioFinal = Number(precioManual) || precioSugerido;
    return { costoInsumos, costoManoObra, costoTotalProduccion, precioSugerido, precioFinal };
  }, [insumosSeleccionados, tiempoMinutos, valorHora, margenGanancia, precioManual]);

  const filteredInsumos = insumosDisponibles.filter(i => i.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelectInsumo = (insumo: InsumoDB) => {
    setSelectedInsumoId(insumo._id);
    setSearchTerm(insumo.nombre);
    setIsDropdownOpen(false);
  };

  const agregarInsumoCatalogo = () => {
    if (!selectedInsumoId || !cantidadInsumo) return;
    const insumo = insumosDisponibles.find(i => i._id === selectedInsumoId);
    if (!insumo) return;
    const costoUnitario = insumo.costo / insumo.cantidadPaquete;
    setInsumosSeleccionados(prev => [...prev, {
      id: insumo._id, nombre: insumo.nombre, unidadMedida: insumo.unidadMedida,
      costoUnitario, cantidad: Number(cantidadInsumo), subtotal: costoUnitario * Number(cantidadInsumo), esPersonalizado: false
    }]);
    setSelectedInsumoId(''); setSearchTerm(''); setCantidadInsumo('');
  };

  const agregarInsumoManual = () => {
    if (!insumoManual.nombre || !insumoManual.cantidad || !insumoManual.costoUnitario) return;
    const subtotal = insumoManual.costoUnitario * insumoManual.cantidad;
    setInsumosSeleccionados(prev => [...prev, {
      id: `custom-${Date.now()}`, nombre: insumoManual.nombre, unidadMedida: insumoManual.unidadMedida,
      costoUnitario: insumoManual.costoUnitario, cantidad: insumoManual.cantidad, subtotal, esPersonalizado: true
    }]);
    setInsumoManual({ nombre: '', cantidad: 1, costoUnitario: 0, unidadMedida: 'unidades' });
  };

  const eliminarInsumo = (index: number) => setInsumosSeleccionados(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (insumosSeleccionados.length === 0) {
      toast.warning('Agrega al menos un insumo', { style: { background: '#FFFBEB', color: '#92400E', border: '1px solid #FCD34D' } });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        nombreProyecto, notasInternas, insumos: insumosSeleccionados,
        tiempoManoDeObraMinutos: Number(tiempoMinutos), valorHoraManoDeObra: Number(valorHora),
        margenGananciaPorcentaje: Number(margenGanancia), precioFinalEstimado: calculos.precioFinal, costoTotal: calculos.costoTotalProduccion
      };

      const res = await fetch(`/api/gestion/presupuestos-internos?id=${presupuestoId}`, {
        method: 'PUT', // ⚠️ NOTA: Deberás agregar el método PUT en tu route.ts de presupuestos-internos
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.user?.token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('¡Presupuesto actualizado con éxito! 📊', { style: { background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' } });
        router.push('/gestion/presupuestos-internos');
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      toast.error('Error de conexión', { style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' } });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);

  if (status === 'loading' || loadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="animate-spin w-10 h-10 text-rose-400" />
          <span className="text-stone-500 text-sm font-medium">Cargando presupuesto...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8 pb-24 overflow-x-hidden">
      <div className="max-w-6xl mx-auto mt-50 sm:mt-52">
        <div className="mb-8">
          <button onClick={() => router.push('/gestion/presupuestos-internos')} className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors mb-2">
            <FaArrowLeft className="w-4 h-4" /> Volver al listado
          </button>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-stone-800 mb-2">Editar Presupuesto Interno</h1>
          <p className="text-stone-500 font-light">Modifica los insumos, costos o precios de esta cotización.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Datos del Proyecto */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Nombre del Proyecto / Cliente</label>
                  <input type="text" value={nombreProyecto} onChange={e => setNombreProyecto(e.target.value)} required className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Notas Internas</label>
                  <textarea value={notasInternas} onChange={e => setNotasInternas(e.target.value)} rows={3} className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all resize-none" />
                </div>
              </div>
            </div>

            {/* Receta de Insumos */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
              <h2 className="text-lg font-serif font-medium text-stone-800 mb-6">🎨 Materiales y Costos</h2>
              <div className="flex p-1 bg-rose-50/50 rounded-xl mb-6 border border-rose-100">
                <button type="button" onClick={() => setModoAgregado('catalogo')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${modoAgregado === 'catalogo' ? 'bg-white text-rose-600 shadow-sm' : 'text-stone-500'}`}>📦 Catálogo</button>
                <button type="button" onClick={() => setModoAgregado('manual')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${modoAgregado === 'manual' ? 'bg-white text-rose-600 shadow-sm' : 'text-stone-500'}`}>✏️ Manual</button>
              </div>

              <div className="mb-6 p-4 rounded-2xl bg-rose-50/30 border border-rose-100">
                {modoAgregado === 'catalogo' ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1" ref={dropdownRef}>
                      <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setSelectedInsumoId(''); setIsDropdownOpen(true); }} onFocus={() => setIsDropdownOpen(true)} placeholder="Buscar insumo..." className="w-full px-4 py-3 rounded-xl bg-white border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200" />
                      {isDropdownOpen && searchTerm && (
                        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-rose-100 shadow-xl max-h-60 overflow-y-auto">
                          {filteredInsumos.map((insumo) => (
                            <button key={insumo._id} type="button" onClick={() => handleSelectInsumo(insumo)} className="w-full text-left px-4 py-3 hover:bg-rose-50 border-b border-rose-50 last:border-0">
                              <span className="font-medium text-stone-800">{insumo.nombre}</span>
                              <span className="text-xs text-stone-500 block">{formatPrice(insumo.costo)} / {insumo.cantidadPaquete} {insumo.unidadMedida}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input type="number" step="0.01" value={cantidadInsumo} onChange={e => setCantidadInsumo(e.target.value ? Number(e.target.value) : '')} className="w-full sm:w-32 px-4 py-3 rounded-xl bg-white border border-rose-200 text-stone-800" placeholder="Cant." />
                    <button type="button" onClick={agregarInsumoCatalogo} disabled={!selectedInsumoId || !cantidadInsumo} className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"><FaPlus /> Agregar</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-5"><input type="text" value={insumoManual.nombre} onChange={e => setInsumoManual({...insumoManual, nombre: e.target.value})} placeholder="Nombre del insumo" className="w-full px-4 py-3 rounded-xl bg-white border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200" /></div>
                    <div className="sm:col-span-2"><input type="number" step="0.01" value={insumoManual.cantidad} onChange={e => setInsumoManual({...insumoManual, cantidad: Number(e.target.value)})} placeholder="Cant." className="w-full px-4 py-3 rounded-xl bg-white border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200" /></div>
                    <div className="sm:col-span-2"><input type="text" value={insumoManual.unidadMedida} onChange={e => setInsumoManual({...insumoManual, unidadMedida: e.target.value})} placeholder="Unidad" className="w-full px-4 py-3 rounded-xl bg-white border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200" /></div>
                    <div className="sm:col-span-2"><input type="number" step="0.01" value={insumoManual.costoUnitario || ''} onChange={e => setInsumoManual({...insumoManual, costoUnitario: Number(e.target.value)})} placeholder="Costo Unit." className="w-full px-4 py-3 rounded-xl bg-white border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200" /></div>
                    <div className="sm:col-span-1"><button type="button" onClick={agregarInsumoManual} className="w-full h-full rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold shadow-md flex items-center justify-center"><FaPlus /></button></div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {insumosSeleccionados.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white border border-rose-100 group hover:border-pink-200 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-stone-800">{item.nombre}</p>
                        {item.esPersonalizado && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200">Manual</span>}
                      </div>
                      <p className="text-xs text-stone-500">{item.cantidad} {item.unidadMedida} × {formatPrice(item.costoUnitario)}/{item.unidadMedida}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-rose-600">{formatPrice(item.subtotal)}</span>
                      <button type="button" onClick={() => eliminarInsumo(index)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FaTimes /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mano de Obra */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
              <h2 className="text-lg font-serif font-medium text-stone-800 mb-6">⏱️ Tiempo y Mano de Obra</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Tiempo (minutos)</label>
                  <input type="number" value={tiempoMinutos} onChange={e => setTiempoMinutos(e.target.value ? Number(e.target.value) : '')} className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Valor hora ($)</label>
                  <input type="number" value={valorHora} onChange={e => setValorHora(e.target.value ? Number(e.target.value) : '')} className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Calculadora */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] p-6 border border-rose-100 shadow-[0_25px_50px_-12px_rgba(253,164,175,0.3)]">
                <h3 className="text-lg font-serif font-medium text-stone-800 mb-6 text-center">Resumen de Costos</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm"><span className="text-stone-500">Costo de Insumos</span><span className="font-medium text-stone-800">{formatPrice(calculos.costoInsumos)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-stone-500">Mano de Obra</span><span className="font-medium text-stone-800">{formatPrice(calculos.costoManoObra)}</span></div>
                  <div className="h-px bg-rose-100" />
                  <div className="flex justify-between text-base font-bold"><span className="text-stone-800">Costo Total</span><span className="text-rose-600">{formatPrice(calculos.costoTotalProduccion)}</span></div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Margen de Ganancia (%)</label>
                  <div className="relative">
                    <input type="number" value={margenGanancia} onChange={e => setMargenGanancia(e.target.value ? Number(e.target.value) : '')} className="w-full px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-stone-800 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-pink-200 pr-8" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">%</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 mb-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1">Precio Sugerido</p>
                  <p className="text-3xl font-serif font-bold text-rose-700">{formatPrice(calculos.precioSugerido)}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Precio Final a Cotizar ($)</label>
                  <input type="number" value={precioManual} onChange={e => setPrecioManual(e.target.value ? Number(e.target.value) : '')} className="w-full px-4 py-3 rounded-xl bg-white border border-rose-200 text-stone-800 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all" />
                </div>

                <div className="flex flex-col gap-3">
                  <button type="submit" disabled={submitting || !nombreProyecto} className="w-full group relative inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-500 overflow-hidden bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200/50 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? <><FaSpinner className="animate-spin" /> Guardando...</> : <><span className="relative z-10">Guardar Cambios</span></>}
                  </button>
                  <button type="button" onClick={() => router.push('/gestion/presupuestos-internos')} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm tracking-wide bg-white border-2 border-rose-200 text-stone-600 hover:bg-rose-50 transition-all">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}