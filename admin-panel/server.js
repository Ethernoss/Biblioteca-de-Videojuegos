const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./db.js"); // Importa la conexión desde db.js
const gameRoutes = require("./routes/routes.js"); // Importa las rutas

dotenv.config(); // Configuración del archivo .env

const app = express();
const PORT = 3000;
app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

// Conexión a MongoDB
connectDB(); // Llama a la conexión desde db.js

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, "public")));
app.use("/src", express.static(path.join(__dirname, "src")));

// Rutas de la API
app.use("/api/games", gameRoutes); // Todas las rutas de la API estarán bajo /api/games

// Ruta principal que apunta a "admin.html"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/assets/admin.html"));
});

app.get("/api/test", (req, res) => {
  res.send("API funcionando correctamente");
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
