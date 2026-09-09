const {Router} = require('express')
const authController = require("../controllers/auth.controllers")

const authRouter = Router()
const authmiddleware = require("../middlewares/auth.middleware")
/**
 * @route POST /api/auth/regisster
 * @description Register a new user 
 * @access Public
 */

authRouter.get("/health", async (req, res) => {
    try {
        const mongoose = require("mongoose");
        res.json({
            status: "ok",
            hasMongoUri: !!process.env.MONGO_URI,
            hasJwtSecret: !!process.env.JWT_SECRET,
            hasGeminiKey: !!process.env.GOOGLE_GENAI_API_KEY,
            dbReadyState: mongoose.connection.readyState,
            dbName: mongoose.connection.name
        });
    } catch (e) {
        res.status(500).json({ status: "error", error: e.message });
    }
});

authRouter.post("/register", authController.registerUserController)

/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */

authRouter.post("/login", authController.loginUserController)


/**
 * @router GET / api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
authRouter.get("/logout", authController.logoutUserController)

/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */

authRouter.get("/get-me", authmiddleware.authUser,authController.getMeController)



module.exports = authRouter