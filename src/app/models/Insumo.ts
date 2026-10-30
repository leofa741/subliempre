import mongoose, { Schema, Document } from 'mongoose';

export interface IInsumo extends Document {
  nombre: string;
  categoria: string; // ej: 'Tintas', 'Envases', 'Cajas', 'Papelería'
  costo: number;     // Cuánto te costó el paquete/bote completo
  cantidadPaquete: number; // ej: 1000 (ml), 10 (unidades), 1 (kg)
  unidadMedida: string;    // ej: 'ml', 'unidades', 'kg', 'mts', 'hojas'
  stockActual: number;
  activo: boolean;
  creadoPor: string;
}

const InsumoSchema = new Schema<IInsumo>(
  {
    nombre: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, trim: true },
    costo: { type: Number, required: true, min: 0 },
    cantidadPaquete: { type: Number, required: true, min: 0.01 },
    unidadMedida: { type: String, required: true, trim: true },
    stockActual: { type: Number, required: true, default: 0 },
    activo: { type: Boolean, default: true },
    creadoPor: { type: String, required: true } // ID del admin/vendedor
  },
  { timestamps: true }
);

// Índice para búsquedas rápidas por nombre o categoría
InsumoSchema.index({ nombre: 'text', categoria: 'text' });

export default mongoose.models.Insumo || mongoose.model<IInsumo>('Insumo', InsumoSchema);