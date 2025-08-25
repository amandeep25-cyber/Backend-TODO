import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.routes.js"
import taskRoutes from "./routes/task.routes.js"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(cookieParser())
app.use(express.static("public"))

//User Routes
app.use('/api/user',userRoutes)

//Task routes
app.use('/api/task',taskRoutes)


export { app }