const express = require("express");
const router = express.Router();
const Note = require("../models/Notes");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

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

