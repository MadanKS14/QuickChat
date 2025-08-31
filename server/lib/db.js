import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Await the connection to be established first.
    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
    
    // Log the success message after the connection is successful.
    console.log('Database connected successfully');

    // You can also listen for disconnection events here if needed
    mongoose.connection.on('disconnected', () => {
      console.log('Database disconnected');
    });

  } catch (error) {
    console.error("Error connecting to database:", error.message);
    // Exit process with failure
    process.exit(1);
  }
};
