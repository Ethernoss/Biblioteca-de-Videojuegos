const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const Game = require("../models/Game.js");
const User = require("../models/user.js");
const Library = require("../models/library.js");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/categories", async (req, res) => {
  try {
    const categories = await Game.distinct("category"); // Obtiene las categorías únicas
    res.json(categories);
  } catch (error) {
    console.error("Error al obtener las categorías:", error.message);
    res.status(500).json({ message: "Error al obtener las categorías" });
  }
});

router.post("/gamesCategories", async (req, res) => {
  try {
    const { data } = req.body;
    // Obtiene todos los juegos de la base de datos que coincidan con las categorías
    const games = await Game.find({ category: { $in: data } }); // No es necesario usar toArray()

    if (!games || games.length === 0) {
      return res.status(404).json({ message: "Juegos no encontrados" });
    }
    // Responde con los juegos
    res.json(games);
  } catch (error) {
    console.error("Error al obtener los juegos:", error.message);
    res.status(500).json({ message: "Error al obtener los juegos" });
  }
});

router.get("/games", async (req, res) => {
  try {
    // Obtiene todos los juegos de la base de datos
    const games = await Game.find({});
    // Responde con los juegos
    res.json(games);
  } catch (error) {
    console.error("Error al obtener los juegos:", error.message);
    res.status(500).json({ message: "Error al obtener los juegos" });
  }
});

// Ruta para buscar juegos por palabras clave
router.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query || query.trim() === "") {
    return res
      .status(400)
      .json({ message: "Debe proporcionar un término de búsqueda válido." });
  }

  try {
    const regex = new RegExp(query, "i"); // Búsqueda insensible a mayúsculas
    const games = await Game.find({
      $or: [
        { title: regex },
        { category: { $elemMatch: { $regex: regex } } }, // Corregido
      ],
    });

    if (games.length === 0) {
      return res.status(404).json({
        message: "No se encontraron juegos que coincidan con la búsqueda.",
      });
    }

    res.json(games);
  } catch (error) {
    console.error("Error al realizar la búsqueda:", error.message);
    res.status(500).json({ message: "Error al realizar la búsqueda." });
  }
});

// Listar todos los juegos
router.get("/", async (req, res) => {
  try {
    const games = await Game.find({}); // Consulta todos los juegos en MongoDB
    res.json(games);
  } catch (error) {
    console.error("Error al obtener los juegos:", error.message);
    res.status(500).json({ message: "Error al obtener los juegos" });
  }
});

// Registro de usuario
router.post("/register", async (req, res) => {
  console.log("Datos recibidos en el servidor:", req.body);
  try {
    const { username, email, password, isAdmin } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya está registrado" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo documento de librería vacío
    const newLibrary = new Library({});
    await newLibrary.save();

    // Crear nuevo usuario con la referencia a la librería
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false, // Por defecto, no es admin
      library: newLibrary._id.toString(), // Convierte el ObjectId a cadena
    });

    await newUser.save();
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("Error al registrar usuario:", error.message);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
});

// Login de usuario
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Enviar el token en una cookie
    res.cookie("token", token, {
      httpOnly: true, // Más seguro porque solo se usa en solicitudes HTTP
      secure: false, // Cambiar a `true` si usas HTTPS
      sameSite: "lax",
    });

    res.json({
      message: "Inicio de sesión exitoso",
      redirect: user.isAdmin ? "/admin" : "/library",
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

// Cerrar sesión
router.post("/logout", (req, res) => {
  res.clearCookie("token"); // Borrar la cookie
  res.status(200).json({ message: "Sesión cerrada exitosamente" });
});

router.post("/", async (req, res) => {
  try {
    console.log("Datos recibidos en el servidor:", req.body);

    const { title, price, description, category, image } = req.body;

    const newGame = new Game({
      title,
      price,
      description,
      category,
      image,
    });

    const savedGame = await newGame.save(); // Guarda el juego en la base de datos
    console.log("Juego guardado en la base de datos:", savedGame);
    res.status(201).json(savedGame); // Enviar el juego guardado al cliente
  } catch (error) {
    console.error("Error al agregar el juego:", error.message);
    res.status(400).json({ message: "Error al agregar el juego" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el ID tiene un formato válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const game = await Game.findById(id); // Aquí ocurre el error si `id` no es un ObjectId válido
    if (!game) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }

    res.json(game);
  } catch (error) {
    console.error("Error al obtener el juego:", error.message);
    res.status(500).json({ message: "Error al obtener el juego" });
  }
});

// Editar un juego
router.put("/:id", async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // Validar los datos según el esquema
    });
    if (!game) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }
    res.json(game); // Devolver el juego actualizado
  } catch (error) {
    console.error("Error al actualizar el juego:", error.message);
    res.status(500).json({ message: "Error al actualizar el juego" });
  }
});

// Eliminar un juego
router.delete("/:id", async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: "Juego eliminado exitosamente" });
  } catch (error) {
    res.status(400).json({ message: "Error al eliminar el juego" });
  }
});

module.exports = router;
