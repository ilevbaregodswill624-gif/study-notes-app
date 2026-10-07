const express = require("express");
const router = express.Router();
const Note = require("../models/Notes");
const multer = require("multer");

// MULTER STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname;

    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// GET ALL NOTES
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// CREATE NOTE
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const note = new Note({
      title: req.body.title,
      subject: req.body.subject,
      content: req.body.content || "",
      filePath: req.file ? req.file.filename : "",
      reviewed: false,
      favorite: false,
    });

    const newNote = await note.save();

    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

// UPDATE NOTE
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const updatedData = {};

    if (req.body.title !== undefined) {
      updatedData.title = req.body.title;
    }

    if (req.body.subject !== undefined) {
      updatedData.subject = req.body.subject;
    }

    if (req.body.content !== undefined) {
      updatedData.content = req.body.content;
    }

    if (req.body.reviewed !== undefined) {
      updatedData.reviewed = req.body.reviewed;
    }

    if (req.body.favorite !== undefined) {
      updatedData.favorite = req.body.favorite;
    }

    if (req.file) {
      updatedData.filePath = req.file.filename;
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedNote) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

// PATCH NOTE
router.patch("/:id", async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedNote) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

// DELETE NOTE
router.delete("/:id", async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(
      req.params.id
    );

    if (!deletedNote) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.json({
      message: "Note deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;