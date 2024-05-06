import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectwithdb = async () => {
  const uri = await process.env.DBCONNECTIONURL;
  console.log("uri" + `${uri}`);
  try {
    await mongoose.connect(`${uri}`);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

export default connectwithdb;
