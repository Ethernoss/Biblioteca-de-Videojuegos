const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId, // Referencia a un usuario
    ref: "User",
    required: true,
  },
  juegos: [
    {
      type: mongoose.Schema.Types.ObjectId, // Referencias a juegos
      ref: "Game",
    },
  ],
});

module.exports = mongoose.model("Library", librarySchema);
