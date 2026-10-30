import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongoose';
import ProductoModel from '@/app/models/Producto';
import InsumoModel from '@/app/models/Insumo';
import { verifyAdmin } from '@/app/lib/auth';

// ✅ GET: Obtener un solo producto por su ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await verifyAdmin(req);
        if (!admin) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
        }

        await connectDB();
        const producto = await ProductoModel.findById(await (await params).id);

        if (!producto) {
            return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ success: true, producto }, { status: 200 });
    } catch (error) {
        console.error('❌ Error obteniendo producto:', error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}

// ✅ PUT: Actualizar un producto por su ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await verifyAdmin(req);
        if (!admin) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
        }

        await connectDB();
        const body = await req.json();
        const {
            nombre, descripcion, categoria, insumos, tiempoManoDeObraMinutos,
            valorHoraManoDeObra, margenGananciaPorcentaje, precioFinalManual, imagen, destacado, nuevo
        } = body;

        let updateData: any = {};

        // Si se envían insumos, recalculamos todos los costos automáticamente
        if (insumos && Array.isArray(insumos) && insumos.length > 0) {
            let costoTotalInsumos = 0;
            const insumosDetallados = [];

            for (const item of insumos) {
                const insumo = await InsumoModel.findById(item.insumoId);
                if (!insumo) {
                    return NextResponse.json({ message: `El insumo con ID ${item.insumoId} no existe.` }, { status: 400 });
                }

                const costoPorUnidad = insumo.costo / insumo.cantidadPaquete;
                const subtotal = costoPorUnidad * item.cantidadUsada;
                costoTotalInsumos += subtotal;

                insumosDetallados.push({
                    insumoId: insumo._id, nombre: insumo.nombre, cantidadUsada: item.cantidadUsada,
                    costoUnitarioCalculado: costoPorUnidad, subtotalCalculado: subtotal
                });
            }

            const costoManoObra = ((tiempoManoDeObraMinutos || 0) / 60) * (valorHoraManoDeObra || 0);
            const costoTotalProduccion = costoTotalInsumos + costoManoObra;
            const margenDecimal = (margenGananciaPorcentaje || 0) / 100;
            const precioSugerido = costoTotalProduccion + (costoTotalProduccion * margenDecimal);
            const precioFinal = precioFinalManual ? Number(precioFinalManual) : precioSugerido;
            const estaEnPerdida = precioFinal < costoTotalProduccion;

            updateData = {
                insumos: insumosDetallados, tiempoManoDeObraMinutos: tiempoManoDeObraMinutos || 0,
                valorHoraManoDeObra: valorHoraManoDeObra || 0, margenGananciaPorcentaje: margenGananciaPorcentaje || 0,
                precioFinalManual: precioFinal, costoTotalInsumos, costoManoObra, costoTotalProduccion,
                precioSugerido, estaEnPerdida
            };
        } 
        
        // Actualización de campos básicos
        if (nombre !== undefined) updateData.nombre = nombre.trim();
        if (descripcion !== undefined) updateData.descripcion = descripcion.trim();
        if (categoria !== undefined) updateData.categoria = categoria;
        if (precioFinalManual !== undefined && !insumos) updateData.precioFinalManual = Number(precioFinalManual);
        if (imagen !== undefined) updateData.imagen = imagen;
        if (destacado !== undefined) updateData.destacado = destacado;
        if (nuevo !== undefined) updateData.nuevo = nuevo;

        const productoActualizado = await ProductoModel.findByIdAndUpdate(
            await (await params).id, { $set: updateData }, { new: true, runValidators: true }
        );

        if (!productoActualizado) {
            return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Producto actualizado', producto: productoActualizado }, { status: 200 });

    } catch (error: any) {
        console.error('❌ Error actualizando producto:', error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}

// ✅ DELETE: Eliminar un producto por su ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await verifyAdmin(req);
        if (!admin) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
        }

        await connectDB();
        const productoEliminado = await ProductoModel.findByIdAndDelete(await (await params).id);

        if (!productoEliminado) {
            return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Producto eliminado' }, { status: 200 });

    } catch (error: any) {
        console.error('❌ Error eliminando producto:', error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}