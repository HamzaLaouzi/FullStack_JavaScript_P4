const mongoose = require('mongoose');

// esquema ------------------------------------------------------------------------------
const voluntariadoSchema = new mongoose.Schema({
    title: {
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
    email: { 
        type: String,
        required: [true, 'Campo obligatorio'],
        trim: true,
        lowercase: true,
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

// crear modelo -----------------------------------------------------------------------------
const Voluntariado = mongoose.model('Voluntariado', voluntariadoSchema, 'voluntariados');

module.exports = Voluntariado;