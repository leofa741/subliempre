import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/app/lib/mongoose';
import PresupuestoInternoModel from '@/app/models/PresupuestoInterno';

// ✅ GET: Listar todos O obtener uno solo por ID
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Si viene un ID, devolver un solo documento
    if (id) {
      const presupuesto = await PresupuestoInternoModel.findById(id).lean();
      if (!presupuesto) {
        return NextResponse.json({ message: 'Presupuesto no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, presupuesto }, { status: 200 });
    }

    // Si no viene ID, devolver la lista
    const isAdmin = ['admin', 'superadmin', 'vendedor'].includes(token.role as string);
    const query = isAdmin ? {} : { creadoPor: token.id };
    const presupuestos = await PresupuestoInternoModel.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, presupuestos }, { status: 200 });
  } catch (error) {
    console.error('❌ Error obteniendo presupuestos:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// ✅ POST: Crear nuevo
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { nombreProyecto, notasInternas, insumos, tiempoManoDeObraMinutos, valorHoraManoDeObra, margenGananciaPorcentaje, precioFinalEstimado, costoTotal } = body;

    if (!nombreProyecto?.trim() || !insumos || !Array.isArray(insumos) || insumos.length === 0) {
      return NextResponse.json({ message: 'Nombre y al menos un insumo son obligatorios.' }, { status: 400 });
    }

    const nuevoPresupuesto = await PresupuestoInternoModel.create({
      nombreProyecto: nombreProyecto.trim(),
      notasInternas: notasInternas?.trim() || '',
      insumos,
      tiempoManoDeObraMinutos: Number(tiempoManoDeObraMinutos) || 0,
      valorHoraManoDeObra: Number(valorHoraManoDeObra) || 0,
      margenGananciaPorcentaje: Number(margenGananciaPorcentaje) || 0,
      precioFinalEstimado: Number(precioFinalEstimado) || 0,
      costoTotal: Number(costoTotal) || 0,
      creadoPor: token.id
    });

    return NextResponse.json({ success: true, message: 'Guardado exitosamente', presupuesto: nuevoPresupuesto }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creando presupuesto:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// ✅ PUT: Actualizar existente
// ✅ PUT: Actualizar un presupuesto interno existente
export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ message: 'ID requerido' }, { status: 400 });

    const body = await req.json();
    const { nombreProyecto, notasInternas, insumos, tiempoManoDeObraMinutos, valorHoraManoDeObra, margenGananciaPorcentaje, precioFinalEstimado, costoTotal } = body;

    // ✅ CORRECCIÓN: Mapeamos para asegurar que TODOS los campos requeridos estén presentes
    // y que 'id' sea siempre un String (ya sea el de MongoDB o el 'custom-xxx')
    const insumosLimpios = insumos.map((p: any) => ({
      id: p.id || `temp-${Date.now()}`, // Garantiza que siempre haya un string
      nombre: String(p.nombre || ''),
      unidadMedida: String(p.unidadMedida || 'unidades'),
      costoUnitario: Number(p.costoUnitario || 0),
      cantidad: Number(p.cantidad || 1),
      subtotal: Number(p.subtotal || 0),
      esPersonalizado: Boolean(p.esPersonalizado)
    }));

    const presupuestoActualizado = await PresupuestoInternoModel.findByIdAndUpdate(
      id,
      { 
        $set: { 
          nombreProyecto, 
          notasInternas, 
          insumos: insumosLimpios, // Enviamos el array limpio y completo
          tiempoManoDeObraMinutos: Number(tiempoManoDeObraMinutos) || 0, 
          valorHoraManoDeObra: Number(valorHoraManoDeObra) || 0, 
          margenGananciaPorcentaje: Number(margenGananciaPorcentaje) || 0, 
          precioFinalEstimado: Number(precioFinalEstimado) || 0, 
          costoTotal: Number(costoTotal) || 0 
        } 
      },
      { new: true, runValidators: true }
    );

    if (!presupuestoActualizado) {
      return NextResponse.json({ message: 'Presupuesto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Actualizado exitosamente', 
      presupuesto: presupuestoActualizado 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('❌ Error actualizando presupuesto:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// ✅ DELETE: Eliminar
export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ message: 'ID requerido' }, { status: 400 });

    await PresupuestoInternoModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Eliminado exitosamente' }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error eliminando presupuesto:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}