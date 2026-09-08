const mongoose = require("mongoose")



async function connectToDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to MongoDB Atlas Database successfully")
    }
    catch(err){
        console.error("MongoDB Atlas Connection Error:", err.message)
    }
}

module.exports = connectToDB