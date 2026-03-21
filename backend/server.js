const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// ── ADD THESE TWO LINES ──────────────────────────
const http = require("http");
const { Server } = require("socket.io");
// ─────────────────────────────────────────────────

const app = express();

// ── WRAP app IN http server ──────────────────────
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});
// ─────────────────────────────────────────────────

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));

// MongoDB Connection
console.log("MONGO_URI:", process.env.MONGO_URI); // Debugging dotenv loading
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
const prescriptionRoutes = require('./routes/prescription');
app.use('/api/prescription', prescriptionRoutes);
// ── SOCKET.IO SIGNALING ──────────────────────────
const videoSignaling = require("./routes/video");
videoSignaling(io);
// ─────────────────────────────────────────────────

app.get("/callback", (req, res) => {
    res.redirect("/api/fitbit" + req.originalUrl);
});

app.get("/", (req, res) => {
    res.json({ message: "HealthPulse Backend Ready" });
});

const PORT = process.env.PORT || 3000;

// ── MUST BE server.listen, NOT app.listen ────────
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// ─────────────────────────────────────────────────