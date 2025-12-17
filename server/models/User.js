const jwt = require('jsonwebtoken');

// Middleware para verificar Token
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Agregamos el payload del usuario a la request
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token no es válido' });
  }
};

// Middleware para verificar Rol de Admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Acceso denegado: Se requiere rol de administrador' });
  }
};

module.exports = { auth, isAdmin };