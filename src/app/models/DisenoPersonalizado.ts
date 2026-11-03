import { Schema, model, models } from 'mongoose';



export interface IDisenoPersonalizado extends Document {
  cliente: Schema.Types.ObjectId;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente?: string;
  titulo: string;
  tipoProducto: string;
  descripcion: string;
  colores?: string;
  textoDeseado?: string;
  cantidad: number;
  fechaLimite?: Date;
  presupuestoEstimado?: number;
  imagenesReferencia?: string[];
  estado: string;
  mensajes: any[];
  pedidoGenerado?: Schema.Types.ObjectId;
  precioFinal?: number;
  fechaRespuestaAdmin?: Date;
  fechaAprobacionCliente?: Date;
  createdAt: Date;
  updatedAt: Date;
}



const MensajeSchema = new Schema({
  autor: { type: String, required: true }, // 'cliente' o 'admin'
  nombreAutor: { type: String, required: true },
  contenido: { type: String, required: true },
  imagen: { type: String }, // Para vistas previas
  createdAt: { type: Date, default: Date.now }
});

const DisenoPersonalizadoSchema = new Schema({
  // 👤 Cliente
  cliente: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  nombreCliente: { type: String, required: true },
  emailCliente: { type: String, required: true },
  telefonoCliente: { type: String },

  // 🎨 Detalles del diseño
  titulo: { type: String, required: true, trim: true },
  tipoProducto: { 
    type: String, 
    required: true,
    enum: ['taza', 'remera', 'llavero_3d', 'figura_3d', 'sublimacion', 'candy', 'decoracion', 'otro']
  },
  descripcion: { type: String, required: true },
  colores: { type: String },
  textoDeseado: { type: String },
  cantidad: { type: Number, default: 1 },
  fechaLimite: { type: Date },
  presupuestoEstimado: { type: Number },

  // 🖼️ Imágenes de referencia
  imagenesReferencia: [{ type: String }], // URLs de Cloudinary

  // 📊 Estado del diseño
  estado: {
    type: String,
    enum: [
      'pendiente',           // Recién creado
      'en_revision',         // Admin lo está viendo
      'consulta',            // Admin pidió más info
      'vista_previa_enviada', // Se envió preview
      'aprobado',            // Cliente aprobó
      'en_produccion',       // Fabricando
      'completado',          // Terminado
      'rechazado'            // No se puede hacer
    ],
    default: 'pendiente'
  },

  // 💬 Conversación
  mensajes: [MensajeSchema],

  // 💰 Si se convierte en pedido
  pedidoGenerado: {
    type: Schema.Types.ObjectId,
    ref: 'Pedido'
  },
  precioFinal: { type: Number },

  // ⏱️ Timestamps
  fechaRespuestaAdmin: { type: Date },
  fechaAprobacionCliente: { type: Date }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
DisenoPersonalizadoSchema.index({ cliente: 1, createdAt: -1 });
DisenoPersonalizadoSchema.index({ estado: 1 });

// ... (tu esquema MensajeSchema y DisenoPersonalizadoSchema se mantienen igual) ...

const DisenoPersonalizado = models.DisenoPersonalizado || model<IDisenoPersonalizado>('DisenoPersonalizado', DisenoPersonalizadoSchema);
export default DisenoPersonalizado;