const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { 
    type: String,
     required: true 
    },

  subject: { 
    type: String,
    required: true
  },

  content: { 
    type: String, 
    default: "" 
  },

  reviewed: { 
    type: Boolean, 
    default: false 
  },

  filePath: {
    type: String,
    default: ""
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  },

  favorite: { 
    type: Boolean, 
    default: false 
  }
});

module.exports = mongoose.model("Note", noteSchema);

