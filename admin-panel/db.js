const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Conectar a MongoDB
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado exitosamente");

    // Seleccionar la base de datos específica
    const db = mongoose.connection.useDb("games"); // Asegúrate de usar el nombre correcto de tu base de datos
    console.log(`Base de datos seleccionada: ${db.name}`);

    // Listar las colecciones dentro de la base de datos seleccionada
    const collections = await db.db.listCollections().toArray(); // Requiere `db` explícito para `listCollections`
    console.log("Colecciones disponibles:");
    collections.forEach((col) => console.log(`- ${col.name}`));

    // Acceder a la colección específica y obtener sus datos
    const ourgames = db.collection("mygames"); // Nombre de tu colección
    const games = await ourgames.find().toArray();
    console.log("Datos en la colección `mygames`:", games);

    return games; // Devuelve los datos si necesitas usarlos en otro lugar
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    process.exit(1); // Sale del proceso con un error
  }
};

module.exports = connectDB;
