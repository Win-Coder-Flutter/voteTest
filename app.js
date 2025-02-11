require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const personRoutes = require("./routes/person");
const admin = require("firebase-admin");
const fs = require("fs");

const app = express();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_CLOUD_KEY_PATH, 'utf8'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected..."))
    .catch((err) => console.error("MongoDB connection error:", err));

app.use("/images", express.static("images"));

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    // console.log("Auth Header Received:", authHeader); // Debugging

    if (!authHeader) {
        return res.status(401).json({ error: "Access denied, token missing" });
    }

    // const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
    const token = authHeader;
    // console.log("Extracted Token:", token); // Debugging

    if (!token) {
        return res.status(401).json({ error: "Access denied, token missing" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token", details: err.message });
        }
        req.user = decoded;
        next();
    });
};



// Generate Token API
app.post("/api/getToken", (req, res) => {
    const { domain } = req.body;
    if (domain !== "vode") {
        return res.status(400).json({ error: "Invalid domain" });
    }

    const token = jwt.sign({ domain }, SECRET_KEY, { expiresIn: "1h" });
    res.status(200).json({ token });
});

// Protected API route
app.use("/api", authenticateToken, personRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});
