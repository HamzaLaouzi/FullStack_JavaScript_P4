const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// esquema ------------------------------------------------------------------------------
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Campo obligatorio'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Campo obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Usa un email válido']
    },
    password: {
        type: String,
        required: [true, 'Campo obligatorio'],
        minlength: [4, 'Mínimo 4 carácteres']
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }

    role: {
        type: String,
        enum: ['user', 'admin'], // Solo permite estos dos valores
        default: 'user'          // Por defecto, todos son usuarios normales
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    // opciones esquema -----------------------------------------------------------------
    timestamps: true,
    // transformar a JSON o JS
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => { // renombrar campo id para grpahql y quitar campos internos bbdd
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password; // por seguridad, no devolver contraseña
            ret.createdAt = ret.createdAt ? ret.createdAt.toLocaleString('es-ES') : '';
        }
    },
    toObject: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;
            ret.createdAt = ret.createdAt ? ret.createdAt.toLocaleString('es-ES') : '';
        }
    }
});

// hash contraseña ------------------------------------------------------
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) { // si de un usuario creado o modificada
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// comprobar contraseña y crear modelo -----------------------------------
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password); // contraseña hash bbdd
};

const User = mongoose.model('User', userSchema, 'usuarios');

module.exports = User;