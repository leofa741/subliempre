import { Schema, model, models } from 'mongoose';

const ClienteSchema = new Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, default: '', trim: true },
  telefono: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    trim: true, 
    lowercase: true, 
    sparse: true, 
    match: [/^\S+@\S+\.\S+$/, 'Email inválido'] 
  },
  direccion: { type: String, trim: true },
  ciudad: { type: String, trim: true },
  notas: { type: String, trim: true }, // Campo flexible para alergias, gustos, referidos, etc.
  activo: { type: Boolean, default: true },
  origen: { type: String, default: 'web' } // web, instagram, presencial, etc.
}, {
  timestamps: true
});

// Evitar duplicados de teléfonos activos
ClienteSchema.pre('save', async function (next) {
  if (this.isModified('telefono') || this.isNew) {
    const ClienteModel = this.constructor as any;
    const existing = await ClienteModel.findOne({
      telefono: this.telefono,
      _id: { $ne: this._id },
      activo: true
    });
    if (existing) {
      const error = new Error('Ya existe una clienta activa con este teléfono');
      (error as any).statusCode = 409;
      return next(error);
    }
  }
  next();
});

const Cliente = models.Cliente || model('Cliente', ClienteSchema);
export default Cliente;