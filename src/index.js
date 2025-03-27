import dotenv from "dotenv"
import { connectDB } from "./db/database.js"
import { app } from "./app.js"

dotenv.config({
    path:"./.env"
    
})

const port = process.env.PORT;

connectDB().then(()=>{
    app.listen(port,()=> {
        console.log(`Server is running at port ${port}`)
    })
}).catch((error)=>{
    console.log("Connection between database to express error :"+ error)
})