import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [file, setFile] = useState(null)

  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [editingSubject, setEditingSubject] = useState("")

  // Fetch all notes when the page loads
  useEffect(() => {
    fetch("http://localhost:5000/api/notes")
      .then(res => res.json())
      .then(data => setNotes(data))
      .catch(err => console.error("Error fetching notes:", err))
  }, [])

  // Add a new note
  function handleAddNote() {
    const formData = new FormData()
    formData.append("title", title)
    formData.append("subject", subject)
    if (file) {
      formData.append("file", file)
    }

    fetch("http://localhost:5000/api/notes", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(newNote => {
        setNotes([...notes, newNote])
        setTitle("")
        setSubject("")
        setFile(null)
      })
      .catch(err => console.error("Error adding note:", err))
  }

  // Delete a note
  function handleDelete(id) {
    fetch(`http://localhost:5000/api/notes/${id}`, {
      method: "DELETE"
    })
      .then(() => {
        setNotes(notes.filter(note => note._id !== id))
      })
      .catch(err => console.error("Error deleting note:", err))
  }

  // Toggle reviewed status
  function handleToggleReviewed(id, currentStatus) {
    fetch(`http://localhost:5000/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewed: !currentStatus })
    })
      .then(res => res.json())
      .then(updatedNote => {
        setNotes(notes.map(note =>
          note._id === id ? updatedNote : note
        ))
      })
      .catch(err => console.error("Error updating note:", err))
  }

  // Start editing a note
  function handleStartEditing(id, title, subject) {
    setEditingNoteId(id)
    setEditingTitle(title)
    setEditingSubject(subject)
  }

  function handleCancelEditing() {
    setEditingNoteId(null)
    setEditingTitle("")
    setEditingSubject("")
  }

  // Save edited note
  function handleSaveEditing() {
    if (!editingNoteId) return;

    fetch(`http://localhost:5000/api/notes/${editingNoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editingTitle,
        subject: editingSubject
      })
    })
      .then(res => res.json())
      .then(updatedNote => {
        setNotes(notes.map(note =>
          note._id === editingNoteId ? updatedNote : note
        ))
        setEditingNoteId(null)
      })
      .catch(err => console.error("Error updating note:", err))
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Study Notes Manager</h1>

      <div>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input 
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={handleAddNote}>Add Note</button>
      </div>

      <ul>
        {notes.map((note) => (
          <li key={note._id}>
            {editingNoteId === note._id ? (
              <div>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                />
                <input
                  type="text"
                  value={editingSubject}
                  onChange={(e) => setEditingSubject(e.target.value)}
                />
                <button onClick={handleSaveEditing}>Save</button>
                <button onClick={handleCancelEditing}>Cancel</button>
              </div>
            ) : (
              <>
              <strong>{note.title}</strong> — {note.subject}

              <input 
type="checkbox"
                checked={note.reviewed}
                onChange={() => handleToggleReviewed(note._id, note.reviewed)}
              />
              {note.filePath && (
                <a href={`http://localhost:5000/uploads/${note.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: "10px" }}
                >
                 View File
                </a>
              )}
              <button onClick={() => handleStartEditing(note._id, note.title, note.subject)}>Edit</button>
              <button onClick={() => handleDelete(note._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
export default App