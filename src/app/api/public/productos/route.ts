import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongoose';
import Producto from '@/app/models/Producto';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // 1. Leer parámetros de la URL
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const categoria = searchParams.get('categoria');
    const destacadoParam = searchParams.get('destacado');

    // 2. Construir la consulta dinámicamente
    const query: any = { activo: true };
    
    if (categoria && categoria !== 'todas') {
      query.categoria = categoria;
    }
    
    if (destacadoParam === 'true') {
      query.destacado = true;
    }

    // 3. Obtener el total de productos que coinciden con la consulta (para la paginación)
    const totalProductos = await Producto.countDocuments(query);
    const totalPages = Math.ceil(totalProductos / limit) || 1;

    // 4. Obtener los productos con skip y limit
    const productos = await Producto.find(query)
      .select('nombre descripcion categoria precioFinalManual precioSugerido imagen destacado nuevo caracteristicas')
      .sort({ destacado: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // 5. Mapear para asegurar que el frontend reciba los campos exactos
    const productosMapeados = productos.map((p: any) => ({
      _id: p._id.toString(),
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      categoria: p.categoria,
      precio: p.precioFinalManual || p.precioSugerido || 0,
      precioFinal: p.precioFinalManual || p.precioSugerido || 0,
      moneda: 'ARS',
      imagen: p.imagen || '',
      slug: p.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      destacado: Boolean(p.destacado),
      nuevo: Boolean(p.nuevo),
      caracteristicas: p.caracteristicas || { color: 'Variado', material: 'Premium', personalizable: true }
    }));

    console.log(`✅ API Pública: ${productosMapeados.length} productos cargados. Página ${page} de ${totalPages}`);

    // 6. Devolver los productos Y la información de paginación
    return NextResponse.json({ 
      success: true, 
      productos: productosMapeados,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalProductos: totalProductos,
        limit: limit
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error obteniendo productos públicos:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}