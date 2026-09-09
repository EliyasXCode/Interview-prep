let app = null;
let initError = null;

try {
    app = require("../Backend/src/app");
} catch (err) {
    console.error("FATAL INITIALIZATION ERROR IN api/index.js:", err);
    initError = {
        name: err.name,
        message: err.message,
        stack: err.stack
    };
}

module.exports = (req, res) => {
    if (initError) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify({
            status: "INITIALIZATION_FAILED",
            message: "The serverless function encountered an error during startup.",
            error: initError.message,
            stack: initError.stack
        }, null, 2));
    }

    try {
        return app(req, res);
    } catch (handlerErr) {
        console.error("UNHANDLED HANDLER ERROR:", handlerErr);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify({
            status: "REQUEST_FAILED",
            error: handlerErr.message,
            stack: handlerErr.stack
        }, null, 2));
    }
};