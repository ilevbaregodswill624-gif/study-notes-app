const express = require("express");
const router = express.Router();
const Note = require("../models/Notes");
const multer = require('multer');
const path = require("path")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
})

const upload = multer({ storage: storage });

// GET all notes
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new note
router.post("/", upload.single('file'), async (req, res) => {
  const note = new Note({
    title: req.body.title,
    subject: req.body.subject,
    content: req.body.content,
    filePath: req.file ? req.file.filename: null
  });

  try {
    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// UPDATE a note
router.put("/:id", upload.single('file'), async (req, res) => {
  try {
    const updatedData = {};
    if (req.body.title !== undefined) updatedData.title = req.body.title;
    if (req.body.subject !== undefined) updatedData.subject = req.body.subject;
    if (req.body.content !== undefined) updatedData.content = req.body.content;
    if (req.body.reviewed !== undefined) updatedData.reviewed = req.body.reviewed;
    if (req.body.favorite !== undefined) updatedData.favorite = req.body.favorite;
    if (req.file) {

      
      // Only change the file if a new file is uploaded
      updatedData.filePath = req.file.filename;
    }
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// DELETE a note
router.delete("/:id", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH - update a note (e.g. toggle reviewed status)
router.patch("/:id", async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

