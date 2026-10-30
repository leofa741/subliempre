'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { 
  FaBoxOpen, FaPlus, FaEdit, FaTrash, FaExclamationTriangle, 
  FaCheckCircle, FaArrowRight, FaSearch, FaFilter, FaStar
} from 'react-icons/fa';

interface Product {
  _id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precioFinalManual: number; 
  costoTotalProduccion: number;
  margenGananciaPorcentaje: number;
  estaEnPerdida: boolean;
  imagen: string;
  destacado: boolean;
  nuevo: boolean;
  createdAt: string;
}

export default function DashboardProductosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const allowedRoles = ['admin', 'superadmin', 'vendedor'];
    if (session?.user?.role && !allowedRoles.includes(session.user.role)) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para acceder a esta sección.',
        confirmButtonColor: '#BE185D',
        confirmButtonText: 'Entendido'
      });
      router.push('/');
      return;
    }

    fetchProducts();
  }, [status, session, router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/gestion/productos', {
        headers: { 'Authorization': `Bearer ${session?.user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.productos || []);
      } else {
        throw new Error('Error al obtener los datos');
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de carga',
        text: 'No se pudo cargar el listado de productos. Inténtalo de nuevo.',
        confirmButtonColor: '#BE185D'
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Alternar estado "Destacado"
  const handleToggleDestacado = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/gestion/productos?id=${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}` 
        },
        body: JSON.stringify({ destacado: !currentStatus })
      });

      if (res.ok) {
        // Actualizamos el estado local inmediatamente para que se vea el cambio sin recargar
        setProducts(prev => prev.map(p => 
          p._id === id ? { ...p, destacado: !currentStatus } : p
        ));
        
        Swal.fire({
          icon: 'success',
          title: currentStatus ? 'Quitado de destacados' : '¡Producto destacado!',
          text: currentStatus ? 'Ya no aparecerá en la sección de favoritos.' : 'Ahora aparecerá en la página de inicio.',
          timer: 2000,
          showConfirmButton: false,
          background: '#FFFBF7',
          color: '#44403C'
        });
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado del producto.',
        confirmButtonColor: '#BE185D',
        background: '#FFFBF7',
        color: '#44403C'
      });
    } finally {
      setTogglingId(null);
    }
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
      const res = await fetch(`/api/gestion/productos?id=${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.user?.token}` }
      });
      
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El producto ha sido eliminado correctamente.',
          confirmButtonColor: '#047857',
          background: '#FFFBF7',
          color: '#44403C',
          timer: 2000,
          showConfirmButton: false
        });
        fetchProducts();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el producto. Inténtalo de nuevo.',
        confirmButtonColor: '#BE185D',
        background: '#FFFBF7',
        color: '#44403C'
      });
    }
  };

  const formatPrice = (amount: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);

  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || prod.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalProductos = products.length;
  const productosEnPerdida = products.filter(p => p.estaEnPerdida).length;
  const margenPromedio = products.length > 0 
    ? Math.round(products.reduce((acc, p) => acc + p.margenGananciaPorcentaje, 0) / products.length) 
    : 0;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-10 h-10 text-rose-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-stone-500 font-medium animate-pulse">Cargando catálogo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FFFBF7] to-amber-50/30 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto mt-50 pt-8 space-y-8">
        
        <div className="flex flex-col lg:flex-row lg:items-center mt-10 lg:mt-0 justify-between gap-6">
          <div>
            <a href="/gestion" className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Panel
            </a>
            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-stone-800 mb-2">
              Catálogo de Productos
            </h1>
            <p className="text-stone-500 font-light">
              Gestiona tus productos, revisa márgenes y optimiza precios.
            </p>
          </div>
          <button
            onClick={() => router.push('/gestion/productos/nuevo')}
            className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Crear Producto</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-rose-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Productos</span>
              <FaBoxOpen className="text-rose-300" />
            </div>
            <p className="text-3xl font-serif font-bold text-stone-800">{totalProductos}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-rose-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Margen Promedio</span>
              <FaCheckCircle className="text-emerald-300" />
            </div>
            <p className="text-3xl font-serif font-bold text-emerald-600">{margenPromedio}%</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-rose-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Alertas de Precio</span>
              <FaExclamationTriangle className={productosEnPerdida > 0 ? 'text-amber-400' : 'text-stone-300'} />
            </div>
            <p className={`text-3xl font-serif font-bold ${productosEnPerdida > 0 ? 'text-amber-600' : 'text-stone-400'}`}>
              {productosEnPerdida}
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-rose-100 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Buscar producto por nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-rose-50/50 border border-rose-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
            />
          </div>
          <div className="relative sm:w-64">
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-rose-50/50 border border-rose-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all appearance-none cursor-pointer"
            >
              <option value="all">Todas las categorías</option>
              <option value="sublimacion">Sublimación</option>
              <option value="remeras">Remeras</option>
              <option value="cumpleaños">Decoración</option>
              <option value="tazas">Tazas</option>
              <option value="accesorios">Accesorios</option>
            </select>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-rose-100 shadow-[0_8px_30px_rgb(253,164,175,0.15)] overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 mx-auto bg-rose-50 rounded-full flex items-center justify-center mb-4">
                <FaSearch className="text-3xl text-rose-300" />
              </div>
              <p className="text-stone-600 font-medium text-lg">No se encontraron productos</p>
              <p className="text-stone-400 text-sm mt-1">Intenta ajustar los filtros o crea un nuevo producto.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-rose-50/50 text-stone-500 text-xs uppercase tracking-wider font-bold border-b border-rose-100">
                    <th className="px-6 py-5">Producto</th>
                    <th className="px-6 py-5">Categoría</th>
                    <th className="px-6 py-5 text-right">Costo</th>
                    <th className="px-6 py-5 text-right">Precio</th>
                    <th className="px-6 py-5 text-center">Margen</th>
                    <th className="px-6 py-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod._id} className="group hover:bg-rose-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-rose-100 overflow-hidden flex-shrink-0 border border-rose-200">
                            {prod.imagen ? (
                              <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-rose-300">
                                <FaBoxOpen className="text-xl" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-stone-800 text-base">{prod.nombre}</p>
                            <p className="text-xs text-stone-500 truncate max-w-[200px]">{prod.descripcion}</p>
                            <div className="flex gap-2 mt-1">
                              {prod.destacado && <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1"><FaStar className="w-2.5 h-2.5" /> DESTACADO</span>}
                              {prod.nuevo && <span className="text-[9px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">NUEVO</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider">
                          {prod.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right text-stone-500 font-medium">
                        {formatPrice(prod.costoTotalProduccion)}
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-stone-800 text-lg">
                        {formatPrice(prod.precioFinalManual)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {prod.estaEnPerdida ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase border border-red-200 mb-1">
                              <FaExclamationTriangle className="w-3 h-3" /> Pérdida
                            </span>
                            <span className="text-xs text-red-500 font-medium">
                              {formatPrice(prod.precioFinalManual - prod.costoTotalProduccion)}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase border border-emerald-200 mb-1">
                              <FaCheckCircle className="w-3 h-3" /> {prod.margenGananciaPorcentaje}%
                            </span>
                            <span className="text-xs text-emerald-600 font-medium">
                              +{formatPrice(prod.precioFinalManual - prod.costoTotalProduccion)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          
                          {/* ✅ BOTÓN PARA DESTACAR / QUITAR DESTACADO */}
                          <button 
                            onClick={() => handleToggleDestacado(prod._id, prod.destacado)}
                            disabled={togglingId === prod._id}
                            className={`p-2.5 rounded-xl hover:bg-white hover:shadow-md transition-all ${
                              prod.destacado 
                                ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50' 
                                : 'text-stone-300 hover:text-amber-400 hover:bg-amber-50'
                            }`}
                            title={prod.destacado ? "Quitar de destacados" : "Marcar como destacado"}
                          >
                            <FaStar className={`w-5 h-5 ${togglingId === prod._id ? 'animate-pulse' : ''}`} />
                          </button>

                          <button 
                            onClick={() => router.push(`/gestion/productos/editar/${prod._id}`)} 
                            className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-blue-500 transition-all" 
                            title="Editar"
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(prod._id, prod.nombre)} 
                            className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-red-500 transition-all" 
                            title="Eliminar"
                          >
                            <FaTrash className="w-5 h-5" />
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