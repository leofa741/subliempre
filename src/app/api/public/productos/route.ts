import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongoose';
import ProductoModel from '@/app/models/Producto';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const categoria = searchParams.get('categoria');
    
    const skip = (page - 1) * limit;
    const query: any = { activo: true };
    
    // Filtrar por categoría si se solicita
    if (categoria && categoria !== 'todas') {
      query.categoria = categoria;
    }

    // Ejecutamos la consulta y el conteo total en paralelo para mayor velocidad
    const [productos, total] = await Promise.all([
      ProductoModel.find(query)
        .select('nombre descripcion categoria precioFinalManual imagen destacado nuevo')
        .sort({ destacado: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProductoModel.countDocuments(query)
    ]);

    // ✅ CORRECCIÓN DEL NaN: Mapeamos 'precioFinalManual' a 'precioFinal' para el frontend
    const productosFormateados = productos.map((p: any) => ({
      ...p.toObject(),
      precioFinal: p.precioFinalManual || 0
    }));

    return NextResponse.json({ 
      success: true, 
      productos: productosFormateados,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Error obteniendo productos públicos:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}