const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema({
  general: [
    {
      type: mongoose.Schema.Types.ObjectId, // Referencias a los juegos
      ref: "Game",
    },
  ],
});

module.exports = mongoose.model("Library", librarySchema, "library"); // Asegúrate de que el nombre sea "library"
