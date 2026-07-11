import mongoose from "mongoose";
import logger from "../utils/logger.js";

/**
 * Connects to MongoDB using `MONGO_URI` from the environment.
 *
 * Also wires up listeners for connection loss/reconnection so issues show
 * up clearly in logs instead of failing silently mid-request.
 *
 * @returns {Promise<import("mongoose").Connection>} The active connection.
 */
const connectDB = async () => {
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
  mongoose.connection.on("reconnected", () => logger.info("MongoDB reconnected"));
  mongoose.connection.on("error", (err) => logger.error("MongoDB connection error", err));

  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
  });

  logger.info(`MongoDB connected -> ${conn.connection.host}`);
  return conn;
};

export default connectDB;
