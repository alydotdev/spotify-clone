import express from 'express'
import dotenv from 'dotenv'
import { clerkMiddleware } from '@clerk/express'
import path from 'path'
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import   songRoutes from './routes/song.routes.js';
import albumRoutes from './routes/album.routes.js';
import connectDb from './lib/connectDb.js';
import fileUpload from 'express-fileupload'
import cors from 'cors';
import statRoutes from "./routes/stat.route.js";
import { initializeSocket } from "./lib/socket.js";
import { createServer } from 'http';
dotenv.config();
const __dirname= path.resolve();
const app= express();
const httpServer = createServer(app);
initializeSocket(httpServer);
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}))
app.use(express.json())
app.use(clerkMiddleware())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname,"tmp"),
    createParentPath: true,
    limits: {
        fileSize: 10*1024*1024,
    },
}))
const port= process.env.PORT;
app.use("/api/users" , userRoutes)
app.use("/api/auth" , authRoutes)
app.use("/api/admin" , adminRoutes)
app.use("/api/songs" , songRoutes)
app.use("/api/albums" , albumRoutes)
app.use("/api/stats" , statRoutes)


app.use((err,req,res,next)=>{
    res.status(500).json({message: process.env.NODE_ENV === "production"? "Internal server error": err.message}); 
})
httpServer.listen(port, () => {
  console.log("Server is running on:", port);
  connectDb();
});