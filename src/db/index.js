import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectdb = async () => {
    try {
        const connectinstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected!! DB Host: ${connectinstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

export default connectdb;
