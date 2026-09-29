const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();
dotenv.config({ path: __dirname + "/.env" });

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/guests", require("./routes/guests"));
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/reservations", require("./routes/reservations"));
app.use("/api/billing", require("./routes/billing"));
app.use("/api/housekeeping", require("./routes/housekeeping"));
app.use("/api/maintenance", require("./routes/maintenance"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/services", require("./routes/services"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/inquiries", require("./routes/inquiries"));

// Health Check
app.get("/", (req, res) => {
  res.json({ message: "LuxuryStay HMS API is running 🏨", status: "OK" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🏨 LuxuryStay HMS Server running on port ${PORT}`);
});
