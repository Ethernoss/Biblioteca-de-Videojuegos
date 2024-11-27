// authMiddleware.js
const jwt = require("jsonwebtoken"); // Si usas JWT para sesiones

// Middleware para verificar si el usuario está autenticado
function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(req.headers); // Log para verificar los headers

  console.log("Authorization header recibido:", authHeader); // Log para verificar el header

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Acceso denegado. Falta el encabezado Authorization." });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Acceso denegado. Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Token decodificado:", decoded); // Log del token decodificado
    console.log("Token recibido:", token); // Log para verificar el token
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Error al verificar el token:", error.message);
    return res.status(403).json({ message: "Token inválido." });
  }
}

// Middleware para verificar si el usuario es admin
function isAdmin(req, res, next) {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      message: "Acceso denegado. No tienes permisos de administrador.",
    });
  }
  next();
}

module.exports = { isAuthenticated, isAdmin };
