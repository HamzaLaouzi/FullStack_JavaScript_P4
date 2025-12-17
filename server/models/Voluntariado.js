const mongoose = require('mongoose');

const voluntariadoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria']
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha es obligatoria'],
    // Validación personalizada: la fecha no puede ser en el pasado
    validate: {
      validator: function(v) {
        return v && v > Date.now();
      },
      message: 'La fecha del voluntariado debe ser futura.'
    }
  },
  lugar: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    enum: ['Salud', 'Educación', 'Medio Ambiente', 'Social'], // Ejemplo de enum
    default: 'Social'
  },
  creador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true // Esto agrega automáticamente createdAt y updatedAt
});

// Middleware pre-save (ejemplo para log de auditoría o validaciones extra)
voluntariadoSchema.pre('save', function(next) {
  console.log(`Guardando voluntariado: ${this.nombre}`);
  next();
});

module.exports = mongoose.model('Voluntariado', voluntariadoSchema);