import { Schema, model, models, Document } from 'mongoose';

// Interfaz para los insumos dentro del presupuesto
export interface IInsumoPresupuesto {
  id: string; // Puede ser el _id de la BD o un string 'custom-xxx'
  nombre: string;
  unidadMedida: string;
  costoUnitario: number;
  cantidad: number;
  subtotal: number;
  esPersonalizado: boolean;
}

// Interfaz principal del documento
export interface IPresupuestoInterno extends Document {
  nombreProyecto: string;
  notasInternas?: string;
  insumos: IInsumoPresupuesto[];
  tiempoManoDeObraMinutos: number;
  valorHoraManoDeObra: number;
  margenGananciaPorcentaje: number;
  precioFinalEstimado: number;
  costoTotal: number;
  creadoPor: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Schema del insumo (sin _id propio para que sea un subdocumento limpio)
const InsumoPresupuestoSchema = new Schema<IInsumoPresupuesto>({
  id: { type: String, required: true },
  nombre: { type: String, required: true },
  unidadMedida: { type: String, required: true },
  costoUnitario: { type: Number, required: true },
  cantidad: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  esPersonalizado: { type: Boolean, default: false }
}, { _id: false });

// Schema principal
const PresupuestoInternoSchema = new Schema<IPresupuestoInterno>({
  nombreProyecto: { type: String, required: true, trim: true },
  notasInternas: { type: String, default: '' },
  insumos: { type: [InsumoPresupuestoSchema], required: true },
  tiempoManoDeObraMinutos: { type: Number, default: 0 },
  valorHoraManoDeObra: { type: Number, default: 0 },
  margenGananciaPorcentaje: { type: Number, default: 0 },
  precioFinalEstimado: { type: Number, required: true },
  costoTotal: { type: Number, required: true },
  creadoPor: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { 
  timestamps: true 
});

// Índice para búsquedas rápidas por usuario y fecha
PresupuestoInternoSchema.index({ creadoPor: 1, createdAt: -1 });

const PresupuestoInterno = models.PresupuestoInterno || model<IPresupuestoInterno>('PresupuestoInterno', PresupuestoInternoSchema);
export default PresupuestoInterno;