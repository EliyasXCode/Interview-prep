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


const mongoose = require("mongoose");
const connectToDB = require("./config/database");

// Normalization middleware to handle Vercel serverless rewrites
app.use((req, res, next) => {
    // If Vercel passed matched path in header, use it
    if (req.headers["x-matched-path"] && !req.url.includes("/auth") && !req.url.includes("/interview")) {
        req.url = req.headers["x-matched-path"];
    }
    // If Vercel rewrote path as /api/index.js or /api/index.js/..., clean it up
    if (req.url.startsWith("/api/index.js")) {
        req.url = req.url.replace(/^\/api\/index\.js/, "") || "/";
    }
    next();
});

// Immediate Health Check (does NOT require or wait for DB connection)
const healthHandler = (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "AI Interview Preparation Platform API",
        time: new Date().toISOString(),
        environment: {
            hasMongoUri: Boolean(process.env.MONGO_URI),
            hasJwtSecret: Boolean(process.env.JWT_SECRET),
            hasGeminiKey: Boolean(process.env.GOOGLE_GENAI_API_KEY)
        },
        database: {
            readyState: mongoose.connection.readyState,
            status: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown"
        }
    });
};

app.get("/", healthHandler);
app.get("/api", healthHandler);
app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

/* require all the routes here  */
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

// Connect to MongoDB before processing API routes, with graceful error handling
app.use(async (req, res, next) => {
    // Fast path for health checks
    if (req.path === "/" || req.path === "/health" || req.path.endsWith("/health")) {
        return next();
    }
    try {
        await connectToDB();
        next();
    } catch (dbErr) {
        console.error("Database connection middleware error:", dbErr.message);
        return res.status(503).json({
            success: false,
            message: "Database connection failed. Please ensure MONGO_URI is configured in Vercel settings and MongoDB Atlas allows connections from all IPs (0.0.0.0/0).",
            error: dbErr.message
        });
    }
});

/* Mount routes with and without /api prefix to support all Vercel rewrite patterns */
app.use("/api/auth", authRouter);
app.use("/auth", authRouter);

app.use("/api/interview", interviewRouter);
app.use("/interview", interviewRouter);

// Global Express error handler for unhandled exceptions
app.use((err, req, res, next) => {
    console.error("UNHANDLED EXPRESS ERROR:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        error: err.toString()
    });
});

module.exports = app;
 