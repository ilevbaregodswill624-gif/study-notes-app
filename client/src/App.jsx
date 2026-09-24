import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")

  // Fetch all notes when the page loads
  useEffect(() => {
    fetch("http://localhost:5000/api/notes")
      .then(res => res.json())
      .then(data => setNotes(data))
      .catch(err => console.error("Error fetching notes:", err))
  }, [])

  // Add a new note
  function handleAddNote() {
    fetch("http://localhost:5000/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subject })
    })
      .then(res => res.json())
      .then(newNote => {
        setNotes([...notes, newNote])
        setTitle("")
        setSubject("")
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
        <button onClick={handleAddNote}>Add Note</button>
      </div>

      <ul>
        {notes.map((note) => (
          <li key={note._id}>
            <input
              type="checkbox"
              checked={note.reviewed}
              onChange={() => handleToggleReviewed(note._id, note.reviewed)}
            />
            <strong>{note.title}</strong> — {note.subject}
            <button onClick={() => handleDelete(note._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App