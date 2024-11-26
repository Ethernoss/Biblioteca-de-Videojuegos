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
  description: {
    type: String,
    required: true,
  },
  category: {
    type: [String],
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  priceId: {
    type: String,
    required: true,
  },
});

// Indica explícitamente el nombre de la colección si es necesario
const Game = mongoose.model("mygames", gameSchema);

module.exports = Game;
