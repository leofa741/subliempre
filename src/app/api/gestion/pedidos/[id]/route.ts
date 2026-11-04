import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongoose';
import PedidoModel from '@/app/models/Pedido';
import { verifyAdmin } from '@/app/lib/auth';
import nodemailer from 'nodemailer';

// ✅ GET: Obtener un solo pedido por su ID
export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    const { id } = await params;
    await connectDB();
    const pedido = await PedidoModel.findById(id);

    if (!pedido) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, pedido }, { status: 200 });
  } catch (error) {
    console.error('❌ Error obteniendo pedido:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
// ✅ PUT: Actualizar un pedido existente (Estado, Pagos, Notas, Email Y PRODUCTOS)
export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    const { id } = await params;
    await connectDB();
    const body = await req.json();
    
    const { estado, seña, notas, fechaEntregaEstimada, clienteEmail, productos, total } = body;

    const pedidoActual = await PedidoModel.findById(id);
    if (!pedidoActual) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }

    const nuevaSeña = seña !== undefined ? Number(seña) : pedidoActual.seña;
    const nuevoTotal = total !== undefined ? Number(total) : pedidoActual.total;
    const nuevoSaldoPendiente = Math.max(0, nuevoTotal - nuevaSeña);

    const updateData: any = {};
    if (estado !== undefined) updateData.estado = estado;
    if (seña !== undefined) updateData.seña = nuevaSeña;
    if (notas !== undefined) updateData.notas = notas;
    if (fechaEntregaEstimada !== undefined) updateData.fechaEntregaEstimada = new Date(fechaEntregaEstimada);
    if (clienteEmail !== undefined) updateData.clienteEmail = clienteEmail;
    
    // ✅ CORRECCIÓN CLAVE: Limpiar productos temporales antes de guardar en MongoDB
    if (productos && Array.isArray(productos)) {
      const productosLimpios = productos.map((p: any) => {
        const { productoId, ...rest } = p;
        
        // Si el ID es temporal (empieza con 'temp_'), lo omitimos del objeto.
        // Así Mongoose no intentará convertirlo a ObjectId y fallará.
        if (productoId && productoId.toString().startsWith('temp_')) {
          return rest; 
        }
        return p;
      });
      
      updateData.productos = productosLimpios;
      updateData.total = nuevoTotal;
    }
    
    updateData.saldoPendiente = nuevoSaldoPendiente;

    const pedidoActualizado = await PedidoModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!pedidoActualizado) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }

    // ... (Aquí continúa tu lógica de envío de email que ya tenías) ...
    console.log('📧 --- DEBUG DE ENVÍO DE EMAIL ---');
    // ... resto del código del email ...

    return NextResponse.json({ 
      success: true, 
      message: 'Documento actualizado exitosamente', 
      pedido: pedidoActualizado 
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error actualizando pedido:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// ✅ DELETE: Eliminar un pedido
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    const { id } = await params;
    await connectDB();
    const pedidoEliminado = await PedidoModel.findByIdAndDelete(id);

    if (!pedidoEliminado) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Pedido eliminado exitosamente' }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error eliminando pedido:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}