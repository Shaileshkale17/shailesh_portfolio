import mongoose, { connect } from "mongoose";
import dotenv from "dotenv";

const connectDB = async () => {
  try {
    console.log("Mongo URI exists:", !!process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log("MongoDB Connected:", conn.connection.host);
  } catch (err) {
    console.error("MongoDB Error:", err);
    throw err;
  }
};

export default connectDB;
