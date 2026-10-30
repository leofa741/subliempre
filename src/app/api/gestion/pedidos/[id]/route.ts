import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongoose';
import PedidoModel from '@/app/models/Pedido';
import { verifyAdmin } from '@/app/lib/auth';

// ✅ GET: Obtener un pedido específico
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const pedido = await PedidoModel.findById(params.id);
    if (!pedido) return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });

    return NextResponse.json({ success: true, pedido }, { status: 200 });
  } catch (error) {
    console.error('❌ Error obteniendo pedido:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// ✅ PUT: Actualizar estado, pagos o notas
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const body = await req.json();
    
    // Construimos el objeto de actualización solo con los campos que vienen
    const updateData: any = {};
    if (body.estado !== undefined) updateData.estado = body.estado;
    if (body.seña !== undefined) updateData.seña = Number(body.seña);
    if (body.notas !== undefined) updateData.notas = body.notas;
    if (body.fechaEntregaEstimada !== undefined) updateData.fechaEntregaEstimada = body.fechaEntregaEstimada;

    // El middleware 'pre save' del modelo recalculará automáticamente el saldoPendiente
    const updatedPedido = await PedidoModel.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedPedido) return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });

    return NextResponse.json({ success: true, pedido: updatedPedido }, { status: 200 });
  } catch (error) {
    console.error('❌ Error actualizando pedido:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// ✅ DELETE: Eliminar pedido
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const deleted = await PedidoModel.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Pedido eliminado' }, { status: 200 });
  } catch (error) {
    console.error('❌ Error eliminando pedido:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}