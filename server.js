const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./db.js"); // Importa la conexión desde db.js
const gameRoutes = require("./Main Panel/routes/routes.js"); // Importa las rutas
const User = require('./Main Panel/models/user.js');
const Library = require('./Main Panel/models/library.js');


// Stripe setup
const stripe = require("stripe")(
  "sk_test_51QPCNnGAB1NMfz0pEaLpkGnWmhoeg9texZClV5m8cqjpqe5TkJtX2uK0LjYftfI3n5bM0gZdet09ugAho16i8mjc00jdPHsbgZ"
);

dotenv.config(); // Configuración del archivo .env

const app = express();
const PORT = 3000;
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // Permitir ambos orígenes
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"], // Métodos permitidos
  })
);

// Conexión a MongoDB
connectDB(); // Llama a la conexión desde db.js

// Middleware para parsear JSON
app.use(express.json());
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
  const { priceId, gameId } = req.body; // Recibe también el ID del juego

  if (!priceId || !gameId) {
    return res.status(400).json({ error: "Price ID y Game ID son requeridos." });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
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

app.get("/session-status", async (req, res) => {
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
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "Main Panel/public/assets/admin.html"));
});

// Ruta para la biblioteca del usuario
app.get("/library", (req, res) => {
  res.sendFile(
    path.join(__dirname, "Main Panel/public/assets/Biblioteca.html")
  );
});

// Ruta para la tienda
app.get("/store", (req, res) => {
  res.sendFile(path.join(__dirname, "Main Panel/public/assets/Tienda.html"));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
