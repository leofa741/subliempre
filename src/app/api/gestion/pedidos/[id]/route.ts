
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongoose';
import PedidoModel from '@/app/models/Pedido';
import { verifyAdmin } from '@/app/lib/auth';

// ✅ GET: Obtener un solo pedido por su ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const pedido = await PedidoModel.findById(params.id);

    if (!pedido) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, pedido }, { status: 200 });
  } catch (error) {
    console.error('❌ Error obteniendo pedido:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// ✅ PUT: Actualizar un pedido existente (Estado, Pagos, Notas)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const body = await req.json();
    const { estado, seña, notas, fechaEntregaEstimada } = body;

    // 1. Buscar el pedido actual para obtener el total y recalcular el saldo pendiente
    const pedidoActual = await PedidoModel.findById(params.id);
    if (!pedidoActual) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }

    // 2. Determinar la nueva seña (la que viene en el request o la que ya tenía)
    const nuevaSeña = seña !== undefined ? Number(seña) : pedidoActual.seña;
    const total = pedidoActual.total;
    
    // ✅ CORRECCIÓN CLAVE: Recalcular el saldo pendiente explícitamente
    // para que la base de datos y el frontend reciban el valor correcto.
    const nuevoSaldoPendiente = Math.max(0, total - nuevaSeña);

    // 3. Construir el objeto de actualización
    const updateData: any = {};
    if (estado !== undefined) updateData.estado = estado;
    if (seña !== undefined) updateData.seña = nuevaSeña;
    if (notas !== undefined) updateData.notas = notas;
    if (fechaEntregaEstimada !== undefined) updateData.fechaEntregaEstimada = new Date(fechaEntregaEstimada);
    
    // Siempre actualizamos el saldo pendiente para mantener la consistencia
    updateData.saldoPendiente = nuevoSaldoPendiente;

    // 4. Guardar los cambios
    const pedidoActualizado = await PedidoModel.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!pedidoActualizado) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Pedido actualizado exitosamente', 
      pedido: pedidoActualizado 
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error actualizando pedido:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// ✅ DELETE: Eliminar un pedido
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const pedidoEliminado = await PedidoModel.findByIdAndDelete(params.id);

    if (!pedidoEliminado) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Pedido eliminado exitosamente' }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error eliminando pedido:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}