const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  library: { type: String, ref: "Library", required: true }, // Cambiado a `library`
});

const User = mongoose.model("users", userSchema);
module.exports = User;
