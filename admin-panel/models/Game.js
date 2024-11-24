const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  platform: {
    type: String,
    required: true,
  },
  category: {
    type: [String], // Asegúrate de que sea un array si tus datos están almacenados como un array
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

// Indica explícitamente el nombre de la colección si es necesario
const Game = mongoose.model("mygames", gameSchema); // Cambia "ourgames" si tu colección tiene otro nombre

module.exports = Game;
