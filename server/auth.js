const auth = {
  // Generar el token con ID y ROL
  generateToken: (user) => {
    const payload = { 
        id: user._id.toString(), 
        email: user.email,
        role: user.role // ¡Importante! Incluimos el rol
    };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });
  },

  // Verificar el token
  verifyToken: (token) => {
    try {
      return jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return null;
    }
  },

  // Decodificar (útil para el servidor)
  getUserFromToken: (token) => {
    if (!token) return null;
    try {
      return jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return null;
    }
  }
};