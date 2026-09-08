const mongoose = require("mongoose")



let isConnected = false;

async function connectToDB(){
    if (isConnected || mongoose.connection.readyState >= 1) {
        return;
    }
    try{
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log("Connected to MongoDB Atlas Database successfully");
    }
    catch(err){
        console.error("MongoDB Atlas Connection Error:", err.message);
    }
}

module.exports = connectToDB;