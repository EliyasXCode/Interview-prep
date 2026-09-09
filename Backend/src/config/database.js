const mongoose = require("mongoose");

let cachedPromise = null;

async function connectToDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in environment variables. Please configure MONGO_URI in your Vercel Project Settings.");
    }

    if (!cachedPromise) {
        const opts = {
            dbName: "interview_prep_db",
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 8000
        };

        cachedPromise = mongoose.connect(process.env.MONGO_URI, opts)
            .then((m) => {
                console.log("Connected to MongoDB Atlas Database successfully");
                return m;
            })
            .catch((err) => {
                cachedPromise = null;
                console.error("MongoDB Atlas Connection Error:", err.message);
                throw err;
            });
    }

    return cachedPromise;
}

module.exports = connectToDB;