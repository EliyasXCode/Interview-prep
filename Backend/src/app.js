const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (
            origin.includes("localhost") ||
            origin.includes("127.0.0.1") ||
            origin.endsWith(".vercel.app") ||
            (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)
        ) {
            return callback(null, true);
        }
        return callback(null, true); // Permissive for easy API testing and deployment
    },
    credentials: true
}))


/* require all the routes here  */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/*using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
module.exports = app 