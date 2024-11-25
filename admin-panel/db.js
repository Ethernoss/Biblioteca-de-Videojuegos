const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado exitosamente");

    // Seleccionar la base de datos específica
    const db = mongoose.connection.useDb("games"); // Asegúrate de usar el nombre correcto de tu base de datos
    console.log(`Base de datos seleccionada: ${db.name}`);
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    process.exit(1); // Sale del proceso con un error
  }
};

module.exports = connectDB;
