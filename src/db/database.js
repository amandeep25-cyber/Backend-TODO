import mongoose from "mongoose"
import { DB_NAME } from "../constant.js"

const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log("MongoDB connected successfully")
       
    } catch (error) {
        console.error("MongoDB connection failed :" + error)
    }

}

export { connectDB }