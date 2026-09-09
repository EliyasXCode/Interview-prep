const mongoose = require("mongoose")



let isConnected = false;

async function connectToDB(){
    if (isConnected || mongoose.connection.readyState >= 1) {
        return;
    }
    try{
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "interview_prep_db",
            serverSelectionTimeoutMS: 5000,
            bufferCommands: false
        });
        isConnected = true;
        console.log("Connected to MongoDB Atlas Database successfully");
    }
    catch(err){
        console.error("MongoDB Atlas Connection Error:", err.message);
        throw err;
    }
}

module.exports = connectToDB;