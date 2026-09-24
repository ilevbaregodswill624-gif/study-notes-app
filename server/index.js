require('dotenv').config();
const mongoose = require('mongoose');

const multer = require('multer');
const path = require('path'); 

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Study Notes API is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const noteRoutes = require("./routes/notes");
app.use("/api/notes", noteRoutes);

