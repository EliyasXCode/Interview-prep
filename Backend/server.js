require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    connectToDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        })
        .catch((err) => {
            console.error("Failed to connect to DB at startup:", err.message);
            app.listen(PORT, () => {
                console.log(`Server running in fallback mode on port ${PORT}`);
            });
        });
}

module.exports = app;