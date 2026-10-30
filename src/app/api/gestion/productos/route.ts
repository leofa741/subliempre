import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongoose';
import ProductoModel from '@/app/models/Producto';
import InsumoModel from '@/app/models/Insumo';
import { verifyAdmin } from '@/app/lib/auth';

// ✅ GET: Obtener lista de productos
export async function GET(req: NextRequest) {
    try {
        const admin = await verifyAdmin(req);
        if (!admin) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
        }

        await connectDB();
        const productos = await ProductoModel.find({ activo: true })
            .sort({ createdAt: -1 })
            .select('-__v');

        return NextResponse.json({ success: true, productos }, { status: 200 });
    } catch (error) {
        console.error('❌ Error obteniendo productos:', error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}

// ✅ POST: Crear un nuevo producto
export async function POST(req: NextRequest) {
    try {
        const admin = await verifyAdmin(req);
        if (!admin) {
            return NextResponse.json(
                { message: 'No autorizado. Se requieren permisos de administrador o vendedor.' },
                { status: 403 }
            );
        }

        await connectDB();
        const body = await req.json();

        const {
            nombre,
            descripcion,
            categoria,
            insumos,
            tiempoManoDeObraMinutos,
            valorHoraManoDeObra,
            margenGananciaPorcentaje,
            precioFinalManual,
            imagen
        } = body;

        if (!nombre?.trim() || !categoria || !Array.isArray(insumos) || insumos.length === 0) {
            return NextResponse.json(
                { message: 'Nombre, categoría y al menos un insumo son obligatorios.' },
                { status: 400 }
            );
        }

        let costoTotalInsumos = 0;
        const insumosDetallados = [];

        for (const item of insumos) {
            const insumo = await InsumoModel.findById(item.insumoId);
            if (!insumo) {
                return NextResponse.json(
                    { message: `El insumo con ID ${item.insumoId} no existe en la base de datos.` },
                    { status: 400 }
                );
            }

            const costoPorUnidad = insumo.costo / insumo.cantidadPaquete;
            const subtotal = costoPorUnidad * item.cantidadUsada;
            costoTotalInsumos += subtotal;

            insumosDetallados.push({
                insumoId: insumo._id,
                nombre: insumo.nombre,
                cantidadUsada: item.cantidadUsada,
                costoUnitarioCalculado: costoPorUnidad,
                subtotalCalculado: subtotal
            });
        }

        const costoManoObra = ((tiempoManoDeObraMinutos || 0) / 60) * (valorHoraManoDeObra || 0);
        const costoTotalProduccion = costoTotalInsumos + costoManoObra;

        const margenDecimal = (margenGananciaPorcentaje || 0) / 100;
        const precioSugerido = costoTotalProduccion + (costoTotalProduccion * margenDecimal);

        const precioFinal = precioFinalManual ? Number(precioFinalManual) : precioSugerido;
        const estaEnPerdida = precioFinal < costoTotalProduccion;

        const nuevoProducto = await ProductoModel.create({
            nombre: nombre.trim(),
            descripcion: descripcion?.trim() || '',
            categoria,
            insumos: insumosDetallados,
            tiempoManoDeObraMinutos: tiempoManoDeObraMinutos || 0,
            valorHoraManoDeObra: valorHoraManoDeObra || 0,
            margenGananciaPorcentaje: margenGananciaPorcentaje || 0,
            precioFinalManual: precioFinal,
            imagen: imagen || '',
            costoTotalInsumos,
            costoManoObra,
            costoTotalProduccion,
            precioSugerido,
            estaEnPerdida,
            creadoPor: admin.id
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Producto creado exitosamente',
                producto: nuevoProducto,
                advertencia: estaEnPerdida
                    ? 'Atención: El producto se guardó, pero el precio final está por debajo del costo de producción.'
                    : null
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('❌ Error creando producto:', error);
        if (error.name === 'ValidationError') {
            return NextResponse.json({ message: 'Datos inválidos', errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error interno del servidor al crear el producto' }, { status: 500 });
    }
}

// ✅ PUT: Actualizar un producto existente
export async function PUT(req: NextRequest) {
    try {
        const admin = await verifyAdmin(req);
        if (!admin) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
        }

        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'ID del producto es requerido' }, { status: 400 });
        }

        const body = await req.json();
        const {
            nombre,
            descripcion,
            categoria,
            insumos,
            tiempoManoDeObraMinutos,
            valorHoraManoDeObra,
            margenGananciaPorcentaje,
            precioFinalManual,
            imagen,
            destacado,
            nuevo
        } = body;

        let updateData: any = {};

        // Si se envían insumos, recalculamos todos los costos automáticamente
        if (insumos && Array.isArray(insumos) && insumos.length > 0) {
            let costoTotalInsumos = 0;
            const insumosDetallados = [];

            for (const item of insumos) {
                const insumo = await InsumoModel.findById(item.insumoId);
                if (!insumo) {
                    return NextResponse.json(
                        { message: `El insumo con ID ${item.insumoId} no existe.` },
                        { status: 400 }
                    );
                }

                const costoPorUnidad = insumo.costo / insumo.cantidadPaquete;
                const subtotal = costoPorUnidad * item.cantidadUsada;
                costoTotalInsumos += subtotal;

                insumosDetallados.push({
                    insumoId: insumo._id,
                    nombre: insumo.nombre,
                    cantidadUsada: item.cantidadUsada,
                    costoUnitarioCalculado: costoPorUnidad,
                    subtotalCalculado: subtotal
                });
            }

            const costoManoObra = ((tiempoManoDeObraMinutos || 0) / 60) * (valorHoraManoDeObra || 0);
            const costoTotalProduccion = costoTotalInsumos + costoManoObra;
            const margenDecimal = (margenGananciaPorcentaje || 0) / 100;
            const precioSugerido = costoTotalProduccion + (costoTotalProduccion * margenDecimal);
            const precioFinal = precioFinalManual ? Number(precioFinalManual) : precioSugerido;
            const estaEnPerdida = precioFinal < costoTotalProduccion;

            updateData = {
                insumos: insumosDetallados,
                tiempoManoDeObraMinutos: tiempoManoDeObraMinutos || 0,
                valorHoraManoDeObra: valorHoraManoDeObra || 0,
                margenGananciaPorcentaje: margenGananciaPorcentaje || 0,
                precioFinalManual: precioFinal,
                costoTotalInsumos,
                costoManoObra,
                costoTotalProduccion,
                precioSugerido,
                estaEnPerdida
            };
        } 
        
        // Actualización de campos básicos (si no se enviaron insumos, o además de ellos)
        if (nombre !== undefined) updateData.nombre = nombre.trim();
        if (descripcion !== undefined) updateData.descripcion = descripcion.trim();
        if (categoria !== undefined) updateData.categoria = categoria;
        if (precioFinalManual !== undefined && !insumos) updateData.precioFinalManual = Number(precioFinalManual);
        if (imagen !== undefined) updateData.imagen = imagen;
        if (destacado !== undefined) updateData.destacado = destacado;
        if (nuevo !== undefined) updateData.nuevo = nuevo;

        const productoActualizado = await ProductoModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!productoActualizado) {
            return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Producto actualizado exitosamente',
            producto: productoActualizado
        }, { status: 200 });

    } catch (error: any) {
        console.error('❌ Error actualizando producto:', error);
        return NextResponse.json({ message: 'Error interno del servidor al actualizar el producto' }, { status: 500 });
    }
}

// ✅ DELETE: Eliminar un producto
export async function DELETE(req: NextRequest) {
    try {
        const admin = await verifyAdmin(req);
        if (!admin) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
        }

        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'ID del producto es requerido' }, { status: 400 });
        }

        const productoEliminado = await ProductoModel.findByIdAndDelete(id);

        if (!productoEliminado) {
            return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Producto eliminado exitosamente'
        }, { status: 200 });

    } catch (error: any) {
        console.error('❌ Error eliminando producto:', error);
        return NextResponse.json({ message: 'Error interno del servidor al eliminar el producto' }, { status: 500 });
    }
}

// ✅ PATCH: Actualizar parcialmente un producto (ej: cambiar estado "destacado")
export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ message: 'No autorizado' }, { status: 403 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID del producto es requerido' }, { status: 400 });
    }

    const body = await req.json();
    const updateData: any = {};

    // Solo permitimos actualizar campos específicos por seguridad
    if (body.destacado !== undefined) updateData.destacado = body.destacado;
    if (body.nuevo !== undefined) updateData.nuevo = body.nuevo;

    const productoActualizado = await ProductoModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!productoActualizado) {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Producto actualizado exitosamente', 
      producto: productoActualizado 
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error actualizando producto:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}