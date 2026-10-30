import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongoose';
import PedidoModel from '@/app/models/Pedido';
import { verifyAdmin } from '@/app/lib/auth';
import nodemailer from 'nodemailer'; // ✅ Agregado para el email

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

// ✅ PUT: Actualizar un pedido existente (Estado, Pagos, Notas, Email)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const body = await req.json();
    
    // ✅ Agregamos clienteEmail a la desestructuración
    const { estado, seña, notas, fechaEntregaEstimada, clienteEmail } = body;

    // 1. Buscar el pedido actual para obtener el total y recalcular el saldo pendiente
    const pedidoActual = await PedidoModel.findById(params.id);
    if (!pedidoActual) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }

    // 2. Determinar la nueva seña (la que viene en el request o la que ya tenía)
    const nuevaSeña = seña !== undefined ? Number(seña) : pedidoActual.seña;
    const total = pedidoActual.total;
    
    // ✅ TU LÓGICA CLAVE (Intacta): Recalcular el saldo pendiente explícitamente
    const nuevoSaldoPendiente = Math.max(0, total - nuevaSeña);

    // 3. Construir el objeto de actualización
    const updateData: any = {};
    if (estado !== undefined) updateData.estado = estado;
    if (seña !== undefined) updateData.seña = nuevaSeña;
    if (notas !== undefined) updateData.notas = notas;
    if (fechaEntregaEstimada !== undefined) updateData.fechaEntregaEstimada = new Date(fechaEntregaEstimada);
    if (clienteEmail !== undefined) updateData.clienteEmail = clienteEmail; // ✅ Guardamos el email
    
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

    // 🚨 ALERTA SIMPLE: Si el estado cambia a "listo" y tenemos un email, enviamos la notificación
    if (estado === 'listo' && pedidoActual.estado !== 'listo' && clienteEmail) {
      try {
        const transporter = nodemailer.createTransport({
          service: process.env.MAILER_SERVICE || 'gmail',
          auth: {
            user: process.env.MAILER_EMAIL,
            pass: process.env.MAILER_PASSWORD || process.env.MAILER_SECRET_KEY,
          },
        });

        await transporter.sendMail({
          from: `"Candy Ilusiones" <${process.env.MAILER_EMAIL}>`,
          to: clienteEmail,
          subject: `🎉 ¡Tu pedido está listo, ${pedidoActualizado.clienteNombre}!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #FECDD3; border-radius: 16px; background-color: #FFFBF7;">
              <h2 style="color: #BE185D; text-align: center;">¡Hola ${pedidoActualizado.clienteNombre}! 💜</h2>
              <p style="color: #44403C; font-size: 16px; line-height: 1.5;">
                Tenemos excelentes noticias: <strong>tu pedido ya está listo</strong> y esperando por ti.
              </p>
              <div style="background-color: #FFF1F2; padding: 15px; border-radius: 12px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; color: #BE185D; font-weight: bold;">Saldo pendiente: $${nuevoSaldoPendiente.toLocaleString('es-AR')}</p>
              </div>
              <p style="color: #44403C; font-size: 14px;">
                Por favor, responde a este mensaje o escríbenos por WhatsApp para coordinar el retiro.
              </p>
              <p style="color: #BE185D; font-weight: bold; text-align: center; margin-top: 30px;">
                ¡Gracias por elegirnos! ✨<br>
                <span style="font-size: 12px; color: #78716C;">Candy Ilusiones</span>
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('❌ Error enviando email de alerta:', emailError);
        // No fallamos la petición si solo el email falla, para no bloquear al usuario
      }
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