const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Servir archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, "public")));
app.use("/src", express.static(path.join(__dirname, "src")));

// Ruta principal que apunta a "admin.html"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/assets/admin.html"));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
