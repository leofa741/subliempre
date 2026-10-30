import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongoose';
import InsumoModel from '@/app/models/Insumo';
import { verifyAdmin } from '@/app/lib/auth';
import Producto from '@/app/models/Producto';

// ✅ GET: Obtener lista de insumos
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const insumos = await InsumoModel.find({ activo: true }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, insumos }, { status: 200 });
  } catch (error) {
    console.error('❌ Error obteniendo insumos:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// ✅ POST: Crear un nuevo insumo
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const body = await req.json();
    const { nombre, categoria, costo, cantidadPaquete, unidadMedida, stockActual } = body;

    if (!nombre?.trim() || !categoria?.trim() || !costo || !cantidadPaquete || !unidadMedida) {
      return NextResponse.json({ message: 'Todos los campos obligatorios deben ser completados.' }, { status: 400 });
    }

    const nuevoInsumo = await InsumoModel.create({
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      costo: Number(costo),
      cantidadPaquete: Number(cantidadPaquete),
      unidadMedida: unidadMedida.trim(),
      stockActual: Number(stockActual) || 0,
      creadoPor: admin.id
    });

    return NextResponse.json({ success: true, message: 'Insumo creado exitosamente', insumo: nuevoInsumo }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creando insumo:', error);
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Ya existe un insumo con ese nombre.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// ✅ PUT: Actualizar un insumo existente
// ✅ PUT: Actualizar un insumo existente (CON ACTUALIZACIÓN EN CASCADA DEL PRECIO FINAL)
export async function PUT(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'ID del insumo es requerido' }, { status: 400 });

    const body = await req.json();
    const { nombre, categoria, costo, cantidadPaquete, unidadMedida, stockActual } = body;

    // 1. Actualizar el insumo en la base de datos
    const insumoActualizado = await InsumoModel.findByIdAndUpdate(
      id,
      {
        nombre: nombre?.trim(),
        categoria: categoria?.trim(),
        costo: Number(costo),
        cantidadPaquete: Number(cantidadPaquete),
        unidadMedida: unidadMedida?.trim(),
        stockActual: Number(stockActual) || 0
      },
      { new: true, runValidators: true }
    );

    if (!insumoActualizado) {
      return NextResponse.json({ message: 'Insumo no encontrado' }, { status: 404 });
    }

    // 2. 🔄 ACTUALIZACIÓN EN CASCADA: Buscar productos que usan este insumo
    const productosAfectados = await Producto.find({ 'insumos.insumoId': id });

    if (productosAfectados.length > 0) {
      const nuevoCostoUnitario = insumoActualizado.costo / insumoActualizado.cantidadPaquete;

      for (const prod of productosAfectados) {
        // Recalcular los insumos de este producto específico
        const insumosActualizados = prod.insumos.map((ins: any) => {
          if (ins.insumoId.toString() === id) {
            // Es el insumo que cambió: actualizamos su costo y subtotal
            const nuevoSubtotal = nuevoCostoUnitario * ins.cantidadUsada;
            return {
              ...ins.toObject(),
              costoUnitarioCalculado: nuevoCostoUnitario,
              subtotalCalculado: nuevoSubtotal
            };
          }
          return ins; // Los demás insumos quedan igual
        });

        // Sumar todos los subtotales actualizados
        const nuevoCostoTotalInsumos = insumosActualizados.reduce(
          (sum: number, ins: any) => sum + (Number(ins.subtotalCalculado) || 0), 
          0
        );

        // Recalcular los totales del producto
        const costoManoObra = (prod.tiempoManoDeObraMinutos / 60) * prod.valorHoraManoDeObra;
        const nuevoCostoTotalProduccion = nuevoCostoTotalInsumos + costoManoObra;
        
        // Aplicar el margen de ganancia original del producto
        const margenDecimal = (prod.margenGananciaPorcentaje || 0) / 100;
        const nuevoPrecioSugerido = nuevoCostoTotalProduccion + (nuevoCostoTotalProduccion * margenDecimal);
        
        // 3. 💡 CLAVE: Actualizamos el precio final de venta para que suba junto con el insumo
        // Esto protege el margen de ganancia de la emprendedora automáticamente.
        const nuevoPrecioFinal = nuevoPrecioSugerido;

        // 4. Guardar los cambios en el producto
        await Producto.findByIdAndUpdate(prod._id, {
          insumos: insumosActualizados,
          costoTotalInsumos: nuevoCostoTotalInsumos,
          costoTotalProduccion: nuevoCostoTotalProduccion,
          precioSugerido: nuevoPrecioSugerido,
          precioFinalManual: nuevoPrecioFinal, // <-- ¡AQUÍ SE ACTUALIZA EL PRECIO DE VENTA!
          estaEnPerdida: false // Ya no está en pérdida porque ajustamos el precio al nuevo costo
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Insumo y productos afectados actualizados exitosamente',
      productosActualizados: productosAfectados.length,
      insumo: insumoActualizado 
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error actualizando insumo:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// ✅ DELETE: Eliminar un insumo
export async function DELETE(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'ID del insumo es requerido' }, { status: 400 });

    const insumoEliminado = await InsumoModel.findByIdAndDelete(id);

    if (!insumoEliminado) {
      return NextResponse.json({ message: 'Insumo no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Insumo eliminado exitosamente' }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error eliminando insumo:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}