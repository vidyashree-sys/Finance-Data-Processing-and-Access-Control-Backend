const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if URI exists
    if (!process.env.MONGO_URI) {
      console.error("ERROR: MONGO_URI is not defined in .env file");
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;