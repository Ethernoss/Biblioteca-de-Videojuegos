// routes.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Game = require("../models/Game.js");
const User = require("../models/user.js");
const Library = require("../models/library.js");
const { isAuthenticated } = require("../src/middlewares/authMiddleware.js");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    cb(null, uploadPath); // Ruta correcta a la carpeta 'uploads'
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Ruta para obtener todos los juegos ordenados alfabéticamente
router.get("/games", async (req, res) => {
  try {
    // Ordenar los juegos por el campo "title" en orden ascendente
    const games = await Game.find({}).sort({ title: 1 }); // 1 para ascendente, -1 para descendente
    res.json(games);
  } catch (error) {
    console.error("Error al obtener los juegos:", error.message);
    res.status(500).json({ message: "Error al obtener los juegos" });
  }
});

// Ruta para obtener categorías únicas
router.get("/categories", async (req, res) => {
  try {
    const categories = await Game.distinct("category");
    res.json(categories);
  } catch (error) {
    console.error("Error al obtener las categorías:", error.message);
    res.status(500).json({ message: "Error al obtener las categorías" });
  }
});

// Ruta para obtener juegos por categorías
// Ruta para obtener juegos por categorías ordenados alfabéticamente
router.post("/gamesCategories", async (req, res) => {
  try {
    const { data } = req.body; // Categorías enviadas desde el cliente
    const games = await Game.find({ category: { $in: data } }).sort({
      title: 1,
    }); // Ordenar alfabéticamente por título

    if (!games || games.length === 0) {
      return res.status(404).json({ message: "Juegos no encontrados" });
    }

    res.json(games);
  } catch (error) {
    console.error("Error al obtener los juegos por categoría:", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener los juegos por categoría" });
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
    const regex = new RegExp(query, "i");
    const games = await Game.find({
      $or: [{ title: regex }, { category: { $elemMatch: { $regex: regex } } }],
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

// Ruta para buscar juegos en la biblioteca del usuario
router.get("/library/search", isAuthenticated, async (req, res) => {
  const query = req.query.q;

  if (!query || query.trim() === "") {
    return res
      .status(400)
      .json({ message: "Debe proporcionar un término de búsqueda válido." });
  }

  try {
    const regex = new RegExp(query, "i");
    const userId = req.user.id;

    // Obtener la biblioteca del usuario
    const user = await User.findById(userId).populate({
      path: "library",
      populate: { path: "general", model: "Game" },
    });

    if (!user || !user.library) {
      return res.status(404).json({ message: "Biblioteca no encontrada" });
    }

    const games = user.library.general.filter((game) => regex.test(game.title));

    if (games.length === 0) {
      return res.status(404).json({
        message: "No se encontraron juegos que coincidan con la búsqueda.",
      });
    }

    res.json(games);
  } catch (error) {
    console.error(
      "Error al realizar la búsqueda en la biblioteca:",
      error.message
    );
    res.status(500).json({ message: "Error al realizar la búsqueda." });
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
    const newLibrary = new Library({ general: [] });
    await newLibrary.save();

    // Crear nuevo usuario con la referencia a la librería
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
      library: newLibrary._id.toString(),
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
      httpOnly: true,
      secure: false, // Cambiar a true si usas HTTPS
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
  res.clearCookie("token");
  res.status(200).json({ message: "Sesión cerrada exitosamente" });
});

// Ruta para agregar un nuevo juego
router.post("/games", upload.single("image"), async (req, res) => {
  try {
    console.log("Datos recibidos en el servidor:", req.body);
    console.log("Archivo recibido:", req.file);

    const { title, price, description, category } = req.body;

    // Validar los campos obligatorios
    if (!title || !price || !description || !category) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    // Procesar la imagen
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    // Procesar las categorías
    const categories =
      typeof category === "string"
        ? category.split(",").map((cat) => cat.trim())
        : [];

    // Crear el nuevo juego
    const newGame = new Game({
      title,
      price,
      description,
      category: categories, // Usar las categorías procesadas
      image,
    });

    const savedGame = await newGame.save();
    console.log("Juego guardado en la base de datos:", savedGame);

    res.status(201).json(savedGame);
  } catch (error) {
    console.error("Error al agregar el juego:", error.message);
    res.status(500).json({ message: "Error al agregar el juego" });
  }
});

// Ruta para obtener un juego por ID
router.get("/games/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el ID tiene un formato válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const game = await Game.findById(id);
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
router.put("/games/:id", upload.single("image"), async (req, res) => {
  try {
    console.log("Datos recibidos para actualizar:", req.body);

    const { title, price, description, category } = req.body;
    const gameId = req.params.id;

    // Validar los campos obligatorios
    if (!title || !price || !description || !category) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    // Procesar la imagen
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Crear objeto de actualización
    const updateData = {
      title,
      price,
      description,
      category: category.split(",").map((cat) => cat.trim()), // Convertir categorías en arreglo
    };

    if (image) {
      updateData.image = image; // Solo actualizar la imagen si se cargó una nueva
    }

    // Actualizar el juego en la base de datos
    const updatedGame = await Game.findByIdAndUpdate(gameId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedGame) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }

    console.log("Juego actualizado:", updatedGame);
    res.status(200).json(updatedGame);
  } catch (error) {
    console.error("Error al actualizar el juego:", error.message);
    res.status(500).json({ message: "Error al actualizar el juego" });
  }
});

// Eliminar un juego
router.delete("/games/:id", async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: "Juego eliminado exitosamente" });
  } catch (error) {
    res.status(400).json({ message: "Error al eliminar el juego" });
  }
});

// Ruta para obtener la biblioteca del usuario autenticado
router.get("/user/library", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    // Encontrar al usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Obtener la biblioteca del usuario
    const libraryId = user.library;
    const library = await Library.findById(libraryId);

    if (!library) {
      return res.status(404).json({ message: "Biblioteca no encontrada" });
    }

    // Obtener los IDs de los juegos en la biblioteca
    const gameIds = library.general.map((gameId) => gameId.toString());

    res.json({ games: gameIds });
  } catch (error) {
    console.error("Error al obtener la biblioteca del usuario:", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener la biblioteca del usuario" });
  }
});

module.exports = router;

// Ruta para agregar un nuevo juego
// router.post("/games", async (req, res) => {
//   try {
//     console.log("Datos recibidos en el servidor:", req.body);

//     const { title, price, description, category, image } = req.body;

//     const newGame = new Game({
//       title,
//       price,
//       description,
//       category,
//       image,
//     });

//     const savedGame = await newGame.save();
//     console.log("Juego guardado en la base de datos:", savedGame);
//     res.status(201).json(savedGame);
//   } catch (error) {
//     console.error("Error al agregar el juego:", error.message);
//     res.status(400).json({ message: "Error al agregar el juego" });
//   }
// });
