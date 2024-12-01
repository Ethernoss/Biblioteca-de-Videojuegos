// server.js

const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./db.js"); // Importa la conexión desde db.js
const gameRoutes = require("./Main Panel/routes/routes.js"); // Importa las rutas
const User = require("./Main Panel/models/user.js");
const cookieParser = require("cookie-parser");
const Library = require("./Main Panel/models/library.js");
const {
  isAuthenticated,
  isAdmin,
} = require("./Main Panel/src/middlewares/authMiddleware.js");

// Configuración de variables de entorno
dotenv.config(); // Carga las variables de entorno desde .env

// Stripe setup
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Usa la clave secreta desde .env

const app = express();
const PORT = 3000;

// Conexión a MongoDB
connectDB(); // Llama a la conexión desde db.js

// Middleware para parsear JSON y cookies
app.use(express.json());
app.use(cookieParser());

// Configuración de CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Permite el origen del frontend
    credentials: true, // Permite credenciales (cookies, encabezados de autorización)
    allowedHeaders: ["Content-Type", "Authorization"], // Permite encabezados personalizados
  })
);

// Servir archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, "Main Panel/public")));
app.use("/src", express.static(path.join(__dirname, "Main Panel/src")));

// Rutas de la API
app.use("/api/games", gameRoutes); // Todas las rutas de la API estarán bajo /api/games

// Ruta principal que redirige al login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Ruta para el login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "./Main Panel/public/assets/login.html"));
});

// Rutas de Stripe
const YOUR_DOMAIN = "http://localhost:3000";

app.post("/create-checkout-session", async (req, res) => {
  const { gameId, gameTitle, gamePrice } = req.body; // Recibe gameId, gameTitle y gamePrice

  if (!gameId || !gameTitle || !gamePrice) {
    return res
      .status(400)
      .json({ error: "Game ID, Title y Price son requeridos." });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd", // Cambia la moneda si es necesario
            product_data: {
              name: gameTitle,
            },
            unit_amount: Math.round(gamePrice * 100), // Convierte el precio a centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/store?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/store?canceled=true`,
      metadata: {
        gameId, // Incluir el ID del juego en los metadatos
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creando la sesión de pago:", error.message);
    res.status(500).json({ error: "Error creando la sesión de pago" });
  }
});

app.get("/session-status", isAuthenticated, async (req, res) => {
  const sessionId = req.query.session_id;

  if (!sessionId) {
    return res.status(400).json({ error: "session_id es requerido." });
  }

  console.log("Recuperando estado de sesión para ID:", sessionId);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Sesión recuperada:", session);

    const gameId = session.metadata.gameId;
    const userEmail = session.customer_details.email;

    if (!gameId || !userEmail) {
      throw new Error("Faltan datos importantes en la sesión.");
    }

    // Busca al usuario por su correo
    const user = await User.findOne({ email: userEmail }).populate("library");

    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    // Verifica que la biblioteca existe
    if (!user.library) {
      throw new Error("Biblioteca no encontrada para este usuario.");
    }

    console.log("Usuario recuperado:", user);
    console.log("Biblioteca recuperada:", user.library);

    // Verifica si el juego ya está en la biblioteca
    if (!user.library.general.includes(gameId)) {
      user.library.general.push(gameId); // Agregar al campo `general`
      await user.library.save();
    }

    res.send({
      status: session.payment_status,
      customer_email: userEmail,
    });
  } catch (error) {
    console.error("Error recuperando el estado de la sesión:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Ruta principal que apunta a "admin.html"
app.get("/admin", isAuthenticated, isAdmin, (req, res) => {
  if (!req.user.isAdmin) {
    return res
      .status(403)
      .json({ message: "Acceso denegado. No eres administrador." });
  }
  res.sendFile(path.join(__dirname, "Main Panel/public/assets/admin.html"));
});

// Ruta protegida para la biblioteca
app.get("/library", isAuthenticated, (req, res) => {
  res.sendFile(
    path.join(__dirname, "Main Panel/public/assets/Biblioteca.html")
  );
});

// Ruta para la tienda
app.get("/store", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "Main Panel/public/assets/Tienda.html"));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
