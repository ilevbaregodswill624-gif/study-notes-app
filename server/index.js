require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const noteRoutes = require("./routes/notes");

const app = express();
const PORT = 5000;

// MONGODB
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// SERVE UPLOADED FILES
app.use(
  "/uploads",
  express.static("uploads")
);

// ROOT
app.get("/", (req, res) => {
  res.send("Study Notes API is running!");
});

// NOTES ROUTES
app.use("/api/notes", noteRoutes);

// START SERVER
app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});