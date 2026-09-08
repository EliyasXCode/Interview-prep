const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())
app.use(cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    credentials: true
}))


/* require all the routes here  */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/*using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
module.exports = app 