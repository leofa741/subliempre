import mongoose, { Schema, Document } from 'mongoose';

interface IProductoPedido {
  productoId: mongoose.Types.ObjectId;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface IPedido extends Document {
  clienteNombre: string;
  clienteTelefono: string;
  productos: IProductoPedido[];
  estado: 'pendiente' | 'en_produccion' | 'listo' | 'entregado' | 'cancelado';
  total: number;
  seña: number;
  saldoPendiente: number;
  fechaEntregaEstimada: Date;
  notas?: string;
  creadoPor: string;
}

const PedidoSchema = new Schema<IPedido>(
  {
    clienteNombre: { type: String, required: true, trim: true },
    clienteTelefono: { type: String, required: true, trim: true },
    productos: [{
      productoId: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
      nombre: { type: String, required: true },
      cantidad: { type: Number, required: true, min: 1 },
      precioUnitario: { type: Number, required: true, min: 0 },
      subtotal: { type: Number, required: true, min: 0 }
    }],
    estado: { 
      type: String, 
      enum: ['pendiente', 'en_produccion', 'listo', 'entregado', 'cancelado'], 
      default: 'pendiente' 
    },
    total: { type: Number, required: true, min: 0 },
    seña: { type: Number, default: 0, min: 0 },
    saldoPendiente: { type: Number, required: true, min: 0 },
    fechaEntregaEstimada: { type: Date, required: true },
    notas: { type: String, trim: true },
    creadoPor: { type: String, required: true } // ID del admin/vendedor
  },
  { timestamps: true }
);

// Middleware para calcular automáticamente el saldo pendiente antes de guardar
PedidoSchema.pre('save', function(next) {
  this.saldoPendiente = Math.max(0, this.total - this.seña);
  next();
});

export default mongoose.models.Pedido || mongoose.model<IPedido>('Pedido', PedidoSchema);