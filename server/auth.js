const jwt = require("jsonwebtoken");

const SECRET_KEY = "backend";

const auth = {
  // generar el token ---------------------------
  generateToken: (user) => {
    return jwt.sign({ userId: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
  },

  //verfiicar el token y decodificarlo ----------
  verifyToken: (token) => {
    try {
      return jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return null;
    }
  },

  // obtener información del usuario del token --
  getUserFromToken: (token) => {
    if (!token) return null;
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      return decoded;
    } catch (err) {
      console.error("El token no es valido:", err);
      return null;
    }
  }
};

module.exports = auth;