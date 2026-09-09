const app = require("../Backend/src/app");

module.exports = (req, res) => {
    return app(req, res);
};