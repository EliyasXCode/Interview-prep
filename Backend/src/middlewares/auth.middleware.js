const jwt = require("jsonwebtoken")
const tokenBlacklistmodel = require("../models/blacklist.model")


async function authUser(req, res, next){

    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null)

    if(!token){
        return res.status(401).json({
            message: "Authentication token required. Please login."
        })
    }



    const isTokenBlacklisted = await tokenBlacklistmodel.findOne({
        token
    })

        if(isTokenBlacklisted){
            return res.status(401).json({
                message: "Token is invalid"
            })
        }

    
    try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET)


    req.user = decoded
    next()



    } catch (err) {
        return res.status(401).json({
            message: "Invalid token."
        })
    }


}


module.exports = {authUser}