import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected Database:", mongoose.connection.name);

    console.log("Database connected successfully");

  } catch (error) {
    console.error("Error connecting to database:", error.message);
    process.exit(1);
  }
};