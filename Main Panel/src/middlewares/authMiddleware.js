const jwt = require("jsonwebtoken");

function isAuthenticated(req, res, next) {
  const token = req.cookies.token; // Leer el token desde las cookies
  console.log("Token recibido desde cookies:", token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acceso denegado. Falta el token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decodificado:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error al verificar el token:", error.message);
    return res.status(403).json({ message: "Token inválido." });
  }
}

function isAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res
      .status(403)
      .json({ message: "Acceso denegado. No eres administrador." });
  }
  next();
}

module.exports = { isAuthenticated, isAdmin };
