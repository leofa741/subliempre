'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { FaImage, FaUpload, FaTimes } from 'react-icons/fa';

// ─────────────────────────────────────────────────────────────
// 🔹 ICONOS PREMIUM
// ─────────────────────────────────────────────────────────────
const Icons = {
    Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Warning: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Check: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Sparkles: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
    Spinner: () => <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
};

interface InsumoDB {
    _id: string;
    nombre: string;
    categoria: string;
    costo: number;
    cantidadPaquete: number;
    unidadMedida: string;
}

interface InsumoSeleccionado {
    insumoId: string;
    nombre: string;
    unidadMedida: string;
    costoUnitario: number;
    cantidad: number;
    subtotal: number;
}

export default function NuevoProductoPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    
    const [loadingPage, setLoadingPage] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [insumosDisponibles, setInsumosDisponibles] = useState<InsumoDB[]>([]);

    // Estado del Producto
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoria, setCategoria] = useState('');

    // Estado de la Receta (Insumos)
    const [insumosSeleccionados, setInsumosSeleccionados] = useState<InsumoSeleccionado[]>([]);
    const [selectedInsumoId, setSelectedInsumoId] = useState('');
    const [cantidadInsumo, setCantidadInsumo] = useState<number | ''>('');

    // 🔍 Estado del Buscador Premium de Insumos
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Estado de Costos y Precios
    const [tiempoMinutos, setTiempoMinutos] = useState<number | ''>(15);
    const [valorHora, setValorHora] = useState<number | ''>(5000);
    const [margenGanancia, setMargenGanancia] = useState<number | ''>(50);
    const [precioManual, setPrecioManual] = useState<number | ''>('');

    // Estado para Imagen
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);

    // ─────────────────────────────────────────────────────────────
    // 🔹 CARGA DE INSUMOS
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') { router.push('/login'); return; }

        const fetchInsumos = async () => {
            try {
                const res = await fetch('/api/gestion/insumos', {
                    headers: { 'Authorization': `Bearer ${session?.user?.token}` }
                });
                const data = await res.json();
                if (data.success) setInsumosDisponibles(data.insumos);
            } catch (error) {
                console.error('Error cargando insumos:', error);
            } finally {
                setLoadingPage(false);
            }
        };

        if (status === 'authenticated') fetchInsumos();
    }, [status, session, router]);

    // 🔹 Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ─────────────────────────────────────────────────────────────
    // 🔹 CÁLCULOS EN TIEMPO REAL
    // ─────────────────────────────────────────────────────────────
    const calculos = useMemo(() => {
        const costoInsumos = insumosSeleccionados.reduce((sum, item) => sum + item.subtotal, 0);
        const tiempoHoras = (Number(tiempoMinutos) || 0) / 60;
        const costoManoObra = tiempoHoras * (Number(valorHora) || 0);
        const costoTotalProduccion = costoInsumos + costoManoObra;

        const margenDecimal = (Number(margenGanancia) || 0) / 100;
        const precioSugerido = costoTotalProduccion + (costoTotalProduccion * margenDecimal);

        const precioFinal = Number(precioManual) || precioSugerido;
        const estaEnPerdida = precioFinal > 0 && precioFinal < costoTotalProduccion;
        const gananciaReal = precioFinal - costoTotalProduccion;

        return { costoInsumos, costoManoObra, costoTotalProduccion, precioSugerido, precioFinal, estaEnPerdida, gananciaReal };
    }, [insumosSeleccionados, tiempoMinutos, valorHora, margenGanancia, precioManual]);

    // ─────────────────────────────────────────────────────────────
    // 🔹 HANDLERS
    // ─────────────────────────────────────────────────────────────
    const filteredInsumos = insumosDisponibles.filter(insumo => 
        insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectInsumo = (insumo: InsumoDB) => {
        setSelectedInsumoId(insumo._id);
        setSearchTerm(insumo.nombre);
        setIsDropdownOpen(false);
    };

    const agregarInsumo = () => {
        if (!selectedInsumoId || !cantidadInsumo) return;
        const insumo = insumosDisponibles.find(i => i._id === selectedInsumoId);
        if (!insumo) return;

        const costoUnitario = insumo.costo / insumo.cantidadPaquete;
        const subtotal = costoUnitario * Number(cantidadInsumo);

        setInsumosSeleccionados(prev => [
            ...prev,
            { insumoId: insumo._id, nombre: insumo.nombre, unidadMedida: insumo.unidadMedida, costoUnitario, cantidad: Number(cantidadInsumo), subtotal }
        ]);
        setSelectedInsumoId('');
        setSearchTerm(''); // Limpiar buscador
        setCantidadInsumo('');
    };

    const eliminarInsumo = (index: number) => {
        setInsumosSeleccionados(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('La imagen no debe superar los 5MB', { style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' } });
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (calculos.estaEnPerdida) {
            const confirmacion = window.confirm('⚠️ El precio final está por debajo del costo de producción. ¿Estás segura de que deseas guardarlo de todos modos?');
            if (!confirmacion) return;
        }

        setSubmitting(true);
        try {
            let imageUrl = '';
            
            // 1. Subida de imagen con manejo de errores robusto
            if (imageFile) {
                setUploadingImage(true);
                
                // Verificación extra para móviles: a veces el tamaño se reporta mal
                if (imageFile.size > 5 * 1024 * 1024) {
                    throw new Error('La imagen es demasiado pesada (>5MB). Por favor, comprímela o elige otra.');
                }

                const formDataImg = new FormData();
                formDataImg.append('image', imageFile);
                
                const uploadRes = await fetch('/api/uploadImage', {
                    method: 'POST',
                    body: formDataImg,
                    headers: { 'Authorization': `Bearer ${session?.user?.token}` }
                });
                
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) {
                    throw new Error(uploadData.error || `Error al subir imagen (Código: ${uploadRes.status})`);
                }
                imageUrl = uploadData.url;
                setUploadingImage(false);
            }

            // 2. Envío de datos del producto
            const payload = {
                nombre,
                descripcion,
                categoria,
                insumos: insumosSeleccionados.map(i => ({ insumoId: i.insumoId, cantidadUsada: i.cantidad })),
                tiempoManoDeObraMinutos: Number(tiempoMinutos),
                valorHoraManoDeObra: Number(valorHora),
                margenGananciaPorcentaje: Number(margenGanancia),
                precioFinalManual: calculos.precioFinal,
                imagen: imageUrl,
            };

            const res = await fetch('/api/gestion/productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user?.token}`
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('¡Producto creado con éxito! 🎨', { 
                    style: { background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' } 
                });
                router.push('/gestion/productos');
            } else {
                // Lanzamos el error para que lo capture el catch general
                throw new Error(data.message || `Error del servidor (Código: ${res.status})`);
            }
        } catch (error: any) {
            // 3. Manejo de errores detallado (CRUCIAL para móviles)
            console.error('🔴 Error detallado al guardar producto:', error);
            
            let errorMsg = 'Error de conexión. Verifica tu señal de internet.';
            
            if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
                errorMsg = 'Sin conexión a internet o la señal es muy débil. Intenta con Wi-Fi.';
            } else if (error.message?.includes('504') || error.message?.includes('timeout')) {
                errorMsg = 'La conexión tardó demasiado. Intenta con una imagen más ligera o usa Wi-Fi.';
            } else if (error.message?.includes('413')) {
                errorMsg = 'La imagen es demasiado pesada para la red móvil. Usa una de menos de 2MB.';
            } else if (error.message) {
                errorMsg = error.message; // Muestra el error real que venga del backend
            }

            toast.error(errorMsg, { 
                style: { background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3' },
                autoClose: 6000 // 6 segundos para que alcance a leerlo en el celular
            });
        } finally {
            setSubmitting(false);
            setUploadingImage(false);
        }
    };

    const formatPrice = (amount: number) =>
        new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);

    if (status === 'loading' || loadingPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
                <div className="flex flex-col items-center gap-4">
                    <Icons.Spinner />
                    <span className="text-stone-500 text-sm font-medium">Preparando calculadora...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8">
            {/* ✅ CORREGIDO: mt-8 sm:mt-12 en lugar de mt-50 para evitar espacio vacío gigante */}
            <div className="max-w-6xl mx-auto mt-52 sm:mt-52">
                <div className="mb-8">
                    <a href="/gestion/productos" className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </a>

                    <h1 className="text-3xl sm:text-4xl font-serif font-medium text-stone-800 mb-2">Nuevo Producto</h1>
                    <p className="text-stone-500 font-light">Calcula el costo real de tus materiales y tiempo para fijar el precio perfecto.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Card: Datos Básicos */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
                            <h2 className="text-lg font-serif font-medium text-stone-800 mb-6 flex items-center gap-2"><Icons.Sparkles /> Información del Producto</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Nombre del Producto</label>
                                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all" placeholder="Ej: Taza Sublimada Personalizada" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Descripción</label>
                                    <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} required rows={3} className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all resize-none" placeholder="Detalles del producto..." />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Categoría</label>
                                    <input 
                                        list="categorias-sugeridas"
                                        value={categoria} 
                                        onChange={e => setCategoria(e.target.value)} 
                                        required
                                        className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                                        placeholder="Ej: Tazas, Remeras, o escribe una nueva..."
                                    />
                                    <datalist id="categorias-sugeridas">
                                        <option value="Sublimación" />
                                        <option value="Remeras Personalizadas" />
                                        <option value="Decoración Cumpleaños" />
                                        <option value="Tazas & Mugs" />
                                        <option value="Accesorios" />
                                    </datalist>
                                    <p className="text-[10px] text-stone-400 mt-1.5 ml-1 flex items-center gap-1">
                                        <span>💡</span> Selecciona una de la lista o escribe una nueva categoría.
                                    </p>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Imagen del Producto</label>
                                    <div className="relative">
                                        <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        <label htmlFor="imageUpload" className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-dashed border-rose-300 text-rose-600 cursor-pointer hover:bg-rose-100/50 transition-all">
                                            <FaUpload /> <span className="text-sm font-medium">{imageFile ? 'Cambiar imagen' : 'Subir imagen'}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            {imagePreview && (
                                <div className="mt-4 relative inline-block">
                                    <img src={imagePreview} alt="Vista previa" className="w-32 h-32 object-cover rounded-2xl border-2 border-rose-200 shadow-sm" />
                                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md">
                                        <FaTimes className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Card: Receta de Insumos */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
                            <h2 className="text-lg font-serif font-medium text-stone-800 mb-6 flex items-center gap-2">🎨 Receta de Materiales</h2>
                            
                            {/* 🔍 BUSCADOR PREMIUM DE INSUMOS */}
                            <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                                <div className="relative flex-1" ref={dropdownRef}>
                                    <div className="relative">
                                        <svg className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setSelectedInsumoId('');
                                                setIsDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            placeholder="Buscar insumo por nombre..."
                                            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                                        />
                                        {searchTerm && (
                                            <button
                                                type="button"
                                                onClick={() => { setSearchTerm(''); setSelectedInsumoId(''); }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* Dropdown de resultados */}
                                    {isDropdownOpen && (
                                        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-rose-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-64 overflow-y-auto">
                                            {filteredInsumos.length === 0 ? (
                                                <div className="p-4 text-center text-stone-400 text-sm">No se encontraron insumos</div>
                                            ) : (
                                                filteredInsumos.map((insumo) => (
                                                    <button
                                                        key={insumo._id}
                                                        type="button"
                                                        onClick={() => handleSelectInsumo(insumo)}
                                                        className="w-full text-left px-4 py-3 hover:bg-rose-50 transition-colors border-b border-rose-50 last:border-0 flex flex-col gap-1 group"
                                                    >
                                                        <span className="font-medium text-stone-800 group-hover:text-rose-700">{insumo.nombre}</span>
                                                        <span className="text-xs text-stone-500">
                                                            {formatPrice(insumo.costo)} / {insumo.cantidadPaquete} {insumo.unidadMedida}
                                                        </span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                <input 
                                    type="number" 
                                    step="0.01" 
                                    value={cantidadInsumo} 
                                    onChange={e => setCantidadInsumo(e.target.value ? Number(e.target.value) : '')} 
                                    className="w-full sm:w-32 px-4 py-3 rounded-xl bg-white border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200 placeholder-stone-400" 
                                    placeholder="Cant." 
                                />
                                <button 
                                    type="button" 
                                    onClick={agregarInsumo} 
                                    disabled={!selectedInsumoId || !cantidadInsumo} 
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Icons.Plus /> Agregar
                                </button>
                            </div>

                            <div className="space-y-3">
                                {insumosSeleccionados.length === 0 ? (
                                    <p className="text-center text-stone-400 py-6 italic text-sm">Aún no has agregado materiales a este producto.</p>
                                ) : (
                                    insumosSeleccionados.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white border border-rose-100 group hover:border-pink-200 transition-colors">
                                            <div>
                                                <p className="font-medium text-stone-800">{item.nombre}</p>
                                                <p className="text-xs text-stone-500">{item.cantidad} {item.unidadMedida} × {formatPrice(item.costoUnitario)}/{item.unidadMedida}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-rose-600">{formatPrice(item.subtotal)}</span>
                                                <button type="button" onClick={() => eliminarInsumo(index)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Icons.Trash /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Card: Mano de Obra */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)]">
                            <h2 className="text-lg font-serif font-medium text-stone-800 mb-6 flex items-center gap-2">⏱️ Tiempo y Mano de Obra</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Tiempo de elaboración (minutos)</label>
                                    <input type="number" value={tiempoMinutos} onChange={e => setTiempoMinutos(e.target.value ? Number(e.target.value) : '')} className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">Valor de tu hora ($)</label>
                                    <input type="number" value={valorHora} onChange={e => setValorHora(e.target.value ? Number(e.target.value) : '')} className="w-full px-4 py-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: CALCULADORA EN VIVO */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] p-6 border border-rose-100 shadow-[0_25px_50px_-12px_rgba(253,164,175,0.3)]">
                                <h3 className="text-lg font-serif font-medium text-stone-800 mb-6 text-center">Calculadora de Precio</h3>
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
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Precio Final de Venta ($)</label>
                                    <input type="number" value={precioManual} onChange={e => setPrecioManual(e.target.value ? Number(e.target.value) : '')} placeholder="Dejar vacío para usar el sugerido" className={`w-full px-4 py-3 rounded-xl border text-stone-800 font-bold text-lg focus:outline-none focus:ring-2 transition-all ${calculos.estaEnPerdida ? 'bg-red-50 border-red-300 focus:ring-red-200 text-red-700' : 'bg-white border-rose-200 focus:ring-pink-200'}`} />
                                </div>
                                {calculos.estaEnPerdida && (
                                    <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 animate-pulse">
                                        <div className="flex items-start gap-3">
                                            <div className="text-amber-500 mt-0.5"><Icons.Warning /></div>
                                            <div>
                                                <p className="text-sm font-bold text-amber-800 mb-1">¡Cuidado! Estás vendiendo a pérdida</p>
                                                <p className="text-xs text-amber-700 leading-relaxed">Tu precio ({formatPrice(calculos.precioFinal)}) es menor al costo de producción ({formatPrice(calculos.costoTotalProduccion)}). Perderías <span className="font-bold">{formatPrice(Math.abs(calculos.gananciaReal))}</span> por unidad.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!calculos.estaEnPerdida && calculos.precioFinal > 0 && (
                                    <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                                        <div className="flex items-start gap-3">
                                            <div className="text-emerald-500 mt-0.5"><Icons.Check /></div>
                                            <div>
                                                <p className="text-sm font-bold text-emerald-800 mb-1">Precio Saludable</p>
                                                <p className="text-xs text-emerald-700 leading-relaxed">Tu ganancia neta por unidad será de <span className="font-bold">{formatPrice(calculos.gananciaReal)}</span>.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button type="submit" disabled={submitting || uploadingImage || !nombre} className="w-full group relative inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-500 overflow-hidden bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                                    {!submitting && !uploadingImage && <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />}
                                    {(submitting || uploadingImage) ? (
                                        <><Icons.Spinner /> <span>{uploadingImage ? 'Subiendo imagen...' : 'Guardando...'}</span></>
                                    ) : (
                                        <><span className="relative z-10">Guardar Producto</span><svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}