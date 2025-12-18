/*
estructura de los voluntariados en la bbdd + índices
*/

const mongoose = require('mongoose');

// esquema ------------------------------------------------------------------------------
const voluntariadoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Campo obligatorio'],
        trim: true
    },
    email: { 
        type: String,
        required: [true, 'Campo obligatorio'],
        trim: true,
        lowercase: true,
    },
    date: {
        type: String,
        required: [true, 'Campo obligatorio'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Campo obligatorio'],
    },
    volunType: {
        type: String,
        required: [true, 'Campo obligatorio'],
        trim: true
    },
    autor: { 
        type: String,
        required: [true, 'Campo obligatorio'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, {
    // opciones esquema -----------------------------------------------------------------
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v; 
            ret.createdAt = ret.createdAt ? ret.createdAt.toLocaleString('es-ES') : '';
        }
    },
    toObject: {
        virtuals: true,
    }
});

// índices --------------------------------------------------------------------------------
voluntariadoSchema.index({volunType: 1}); // por tipo
voluntariadoSchema.index({email: 1}); // por autor
voluntariadoSchema.index({ date: 1 }); // por fecha
voluntariadoSchema.index({email: 1, volunType: 1}); // por tipo y autor

// crear modelo ---------------------------------------------------------------------------
const Voluntariado = mongoose.model('Voluntariado', voluntariadoSchema, 'voluntariados');

module.exports = Voluntariado;