import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongoose';
import PedidoModel from '@/app/models/Pedido';
import { verifyAdmin } from '@/app/lib/auth';

// ✅ GET: Obtener lista de pedidos (con filtro opcional por estado)
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const estadoFilter = searchParams.get('estado');

    const query: any = {};
    if (estadoFilter && estadoFilter !== 'todos') {
      query.estado = estadoFilter;
    }

    const pedidos = await PedidoModel.find(query)
      .sort({ createdAt: -1 }) // Más recientes primero
      .limit(50) // Límite para rendimiento inicial
      .select('-__v');

    return NextResponse.json({ success: true, pedidos }, { status: 200 });
  } catch (error) {
    console.error('❌ Error obteniendo pedidos:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// ✅ POST: Crear un nuevo pedido
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    const {
      clienteNombre,
      clienteTelefono,
      productos,
      estado,
      total,
      seña,
      fechaEntregaEstimada,
      notas
    } = body;

    if (!clienteNombre || !productos || productos.length === 0 || !total) {
      return NextResponse.json(
        { message: 'Nombre del cliente, productos y total son obligatorios' },
        { status: 400 }
      );
    }

    // El middleware del modelo calculará automáticamente el saldoPendiente
    const nuevoPedido = await PedidoModel.create({
      clienteNombre: clienteNombre.trim(),
      clienteTelefono: clienteTelefono.trim(),
      productos,
      estado: estado || 'pendiente',
      total: Number(total),
      seña: Number(seña) || 0,
      fechaEntregaEstimada: new Date(fechaEntregaEstimada),
      notas: notas?.trim() || '',
      creadoPor: admin.id
    });

    return NextResponse.json(
      { success: true, message: 'Pedido creado exitosamente', pedido: nuevoPedido },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Error creando pedido:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}