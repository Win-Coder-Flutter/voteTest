require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const personRoutes = require("./routes/person");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = require("./firebase-admin-sdk.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected..."))
    .catch((err) => console.error("MongoDB connection error:", err));

app.use("/images", express.static("images"));
app.use("/api", personRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});