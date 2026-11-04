'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { pdf } from '@react-pdf/renderer';
import { FaArrowLeft, FaFilePdf, FaSpinner, FaClock, FaMoneyBillWave, FaChartPie, FaEdit } from 'react-icons/fa';
import { PresupuestoInternoPDF } from '@/app/components/pedidospdf/PresupuestoInternoPDF';

interface InsumoItem { id: string; nombre: string; unidadMedida: string; costoUnitario: number; cantidad: number; subtotal: number; esPersonalizado: boolean; }
interface Presupuesto { _id: string; nombreProyecto: string; notasInternas: string; insumos: InsumoItem[]; tiempoManoDeObraMinutos: number; valorHoraManoDeObra: number; margenGananciaPorcentaje: number; precioFinalEstimado: number; costoTotal: number; createdAt: string; }

export default function VerPresupuestoPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/gestion/presupuestos-internos?id=${params.id}`, { headers: { 'Authorization': `Bearer ${session?.user?.token}` } });
        const data = await res.json();
        if (data.success) setPresupuesto(data.presupuesto);
      } catch (error) { toast.error('Error cargando el presupuesto'); } finally { setLoading(false); }
    };
    if (session) fetchData();
  }, [params.id, session]);

  const handleDownloadPDF = async () => {
    if (!presupuesto) return;
    setDownloading(true);
    try {
      const datosParaPDF = {
        nombreProyecto: presupuesto.nombreProyecto,
        notasInternas: presupuesto.notasInternas,
        insumos: presupuesto.insumos,
        costoTotal: presupuesto.costoTotal,
        precioFinal: presupuesto.precioFinalEstimado,
        fecha: new Date(presupuesto.createdAt).toLocaleDateString('es-AR')
      };
      const blob = await pdf(<PresupuestoInternoPDF datos={datosParaPDF} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Presupuesto_${presupuesto.nombreProyecto.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('¡PDF descargado con éxito! 📄', { style: { background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' } });
    } catch (error) { toast.error('No se pudo generar el PDF'); } finally { setDownloading(false); }
  };

  const formatPrice = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <div className="flex flex-col items-center gap-4"><FaSpinner className="animate-spin w-10 h-10 text-rose-400" /><span className="text-stone-500 font-medium">Cargando detalles...</span></div>
      </div>
    );
  }

  if (!presupuesto) return null;

  const costoManoObra = (presupuesto.tiempoManoDeObraMinutos / 60) * presupuesto.valorHoraManoDeObra;
  const costoInsumos = presupuesto.insumos.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8 pb-24 overflow-x-hidden">
      <div className="max-w-6xl mx-auto mt-50 sm:mt-52">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/gestion/presupuestos-internos')} className="p-3 rounded-2xl bg-white/80 border border-rose-200 text-stone-600 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm">
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-800">{presupuesto.nombreProyecto}</h1>
              <p className="text-stone-500 font-light text-sm">Creado el {new Date(presupuesto.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          {/* ✅ BOTÓN PRINCIPAL DE DESCARGA */}
          <button 
            onClick={handleDownloadPDF} 
            disabled={downloading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-lg shadow-rose-200/50 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {downloading ? <FaSpinner className="animate-spin" /> : <FaFilePdf className="text-lg" />}
            {downloading ? 'Generando PDF...' : 'Descargar PDF'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Detalles */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabla de Insumos */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
              <h2 className="text-lg font-serif font-medium text-stone-800 mb-6 flex items-center gap-2"><FaMoneyBillWave className="text-rose-400" /> Desglose de Materiales</h2>
              <div className="space-y-3">
                {presupuesto.insumos.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-rose-50/30 border border-rose-100">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-stone-800">{item.nombre}</p>
                        {item.esPersonalizado && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200">Manual</span>}
                      </div>
                      <p className="text-xs text-stone-500 mt-1">{item.cantidad} {item.unidadMedida} × {formatPrice(item.costoUnitario)}</p>
                    </div>
                    <span className="font-bold text-rose-600 text-lg">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mano de Obra y Notas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-rose-100 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-2"><FaClock className="text-rose-400" /> Mano de Obra</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-stone-600">Tiempo:</span><span className="font-medium text-stone-800">{presupuesto.tiempoManoDeObraMinutos} min</span></div>
                  <div className="flex justify-between"><span className="text-stone-600">Valor hora:</span><span className="font-medium text-stone-800">{formatPrice(presupuesto.valorHoraManoDeObra)}</span></div>
                  <div className="h-px bg-rose-100 my-2" />
                  <div className="flex justify-between font-bold"><span className="text-stone-800">Total MO:</span><span className="text-rose-600">{formatPrice(costoManoObra)}</span></div>
                </div>
              </div>
              
              {presupuesto.notasInternas && (
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-rose-100 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-3">📝 Notas Internas</h3>
                  <p className="text-sm text-stone-700 italic bg-rose-50/50 p-3 rounded-xl border border-rose-100">{presupuesto.notasInternas}</p>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Resumen Financiero */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white/90 backdrop-blur-2xl rounded-[2rem] p-6 border border-rose-100 shadow-[0_25px_50px_-12px_rgba(253,164,175,0.3)]">
              <h3 className="text-lg font-serif font-medium text-stone-800 mb-6 text-center flex items-center justify-center gap-2"><FaChartPie className="text-rose-400" /> Resumen de Costos</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm"><span className="text-stone-500">Costo de Insumos</span><span className="font-medium text-stone-800">{formatPrice(costoInsumos)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-stone-500">Mano de Obra</span><span className="font-medium text-stone-800">{formatPrice(costoManoObra)}</span></div>
                <div className="h-px bg-rose-100" />
                <div className="flex justify-between text-base font-bold"><span className="text-stone-800">Costo Total Producción</span><span className="text-rose-600">{formatPrice(presupuesto.costoTotal)}</span></div>
                
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-rose-500">Margen ({presupuesto.margenGananciaPorcentaje}%)</span>
                  <span className="font-bold text-rose-700">{formatPrice(presupuesto.precioFinalEstimado - presupuesto.costoTotal)}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white text-center shadow-lg shadow-rose-200/50">
                <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">Precio Final a Cotizar</p>
                <p className="text-3xl font-serif font-bold">{formatPrice(presupuesto.precioFinalEstimado)}</p>
              </div>

              <button onClick={() => router.push(`/gestion/presupuestos-internos/${presupuesto._id}`)} className="w-full mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm tracking-wide bg-white border-2 border-rose-200 text-stone-600 hover:bg-rose-50 transition-all">
                <FaEdit className="w-4 h-4" /> Editar Presupuesto
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}