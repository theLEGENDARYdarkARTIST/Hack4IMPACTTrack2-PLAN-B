const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
const diagnosisRoute = require("./routes/diagnosis");
const hospitalRoutes = require("./routes/hospitals");
const doctorRoutes = require("./routes/doctors");
const fitbitRoutes = require("./routes/fitbit");

app.use("/api/diagnosis", diagnosisRoute);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/fitbit", fitbitRoutes);

app.get("/callback", (req, res) => {
    res.redirect("/api/fitbit" + req.originalUrl);
});

app.get("/", (req, res) => {
    res.json({ message: "HealthPulse Backend Ready" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
