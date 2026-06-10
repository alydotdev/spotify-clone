import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config();
const connectDb = async()=>{
    try {
        const conn =  await mongoose.connect(process.env.MONGODB_URI);
         console.log(`MongoDb connected: ${conn.connection.host}`)
    } catch (error) {
        console.log("MongoDB connection error: ", error)
    }
}

export default connectDb;