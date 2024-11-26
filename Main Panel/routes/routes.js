const bcrypt = require("bcrypt");
const express = require("express");
const Game = require("../models/Game.js");
const User = require("../models/user.js");

const router = express.Router();

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

    // Crear nuevo usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false, // Por defecto, no es admin
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

    // Buscar usuario por email
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Redirigir según el rol del usuario
    if (user.isAdmin) {
      res.json({ message: "Admin autenticado", redirect: "/admin" });
    } else {
      res.json({ message: "Usuario autenticado", redirect: "/library" });
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
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
    const game = await Game.findById(req.params.id); // Busca el juego por ID
    if (!game) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }
    res.json(game); // Devuelve el juego encontrado
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
