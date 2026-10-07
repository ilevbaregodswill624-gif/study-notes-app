import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [reviewedFilter, setReviewedFilter] = useState("all");
  const [filter, setFilter] = useState("all");
  const [activePage, setActivePage] = useState("dashboard");

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingSubject, setEditingSubject] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // GET NOTES
  useEffect(() => {
    fetch("http://localhost:5000/api/notes")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch notes");
        }
        return res.json();
      })
      .then((data) => {
        setNotes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching notes:", err);
        setError("Failed to fetch notes. Please try again later.");
        setLoading(false);
      });
  }, []);

  // ADD NOTE
  function handleAddNote() {
    if (!title.trim() || !subject.trim()) return;

    const formData = new FormData();

    formData.append("title", title);
    formData.append("subject", subject);

    if (file) {
      formData.append("file", file);
    }

    fetch("http://localhost:5000/api/notes", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to add note");
        }
        return res.json();
      })
      .then((newNote) => {
        setNotes((prevNotes) => [...prevNotes, newNote]);

        setTitle("");
        setSubject("");
        setFile(null);
      })
      .catch((err) => {
        console.error("Error adding note:", err);
      });
  }

  // DELETE NOTE
  function handleDelete(id) {
    fetch(`http://localhost:5000/api/notes/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete note");
        }

        return res.json();
      })
      .then(() => {
        setNotes((prevNotes) =>
          prevNotes.filter((note) => note._id !== id)
        );
      })
      .catch((err) => {
        console.error("Error deleting note:", err);
      });
  }

  // TOGGLE REVIEWED
  function handleToggleReviewed(id, currentStatus) {
    fetch(`http://localhost:5000/api/notes/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reviewed: !currentStatus,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update reviewed status");
        }

        return res.json();
      })
      .then((updatedNote) => {
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === id ? updatedNote : note
          )
        );
      })
      .catch((err) => {
        console.error("Error updating note:", err);
      });
  }

  // TOGGLE FAVORITE
  function handleToggleFavorite(id, currentStatus) {
    fetch(`http://localhost:5000/api/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        favorite: !currentStatus,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update favorite");
        }

        return res.json();
      })
      .then((updatedNote) => {
        console.log("Updated favorite:", updatedNote.favorite);

        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === id ? updatedNote : note
          )
        );
      })
      .catch((err) => {
        console.error("Error updating favorite:", err);
      });
  }

  // START EDITING
  function handleStartEditing(id, title, subject) {
    setEditingNoteId(id);
    setEditingTitle(title);
    setEditingSubject(subject);
  }

  // CANCEL EDITING
  function handleCancelEditing() {
    setEditingNoteId(null);
    setEditingTitle("");
    setEditingSubject("");
  }

  // SAVE EDITING
  function handleSaveEditing() {
    if (!editingNoteId) return;

    fetch(`http://localhost:5000/api/notes/${editingNoteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editingTitle,
        subject: editingSubject,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update note");
        }

        return res.json();
      })
      .then((updatedNote) => {
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === editingNoteId ? updatedNote : note
          )
        );

        setEditingNoteId(null);
        setEditingTitle("");
        setEditingSubject("");
      })
      .catch((err) => {
        console.error("Error updating note:", err);
      });
  }

  // FILTER NOTES
  const filteredNotes = notes.filter((note) => {
    const search = searchTerm.toLowerCase();

    const matchesPage =
      activePage === "dashboard" ||
      (activePage === "favorites" && note.favorite === true) ||
      (activePage === "reviewed" && note.reviewed === true);

    const matchesSearch =
      note.title.toLowerCase().includes(search) ||
      note.subject.toLowerCase().includes(search);

    const matchesSubject =
      subjectFilter === "all" ||
      note.subject === subjectFilter;

    const matchesReviewed =
      reviewedFilter === "all" ||
      (reviewedFilter === "reviewed" && note.reviewed) ||
      (reviewedFilter === "not_reviewed" && !note.reviewed);

    const matchesFavorite =
      filter === "all" ||
      (filter === "favorite" && note.favorite) ||
      (filter === "not_favorite" && !note.favorite);

    return (
      matchesPage &&
      matchesSearch &&
      matchesSubject &&
      matchesReviewed &&
      matchesFavorite
    );
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading your notes...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-screen">{error}</div>;
  }

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">📚</div>

          <div>
            <h2>StudyNotes</h2>
            <span>Student workspace</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          {/* DASHBOARD */}
          <button
            className={`nav-item ${
              activePage === "dashboard" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("dashboard");
              setFilter("all");
              setReviewedFilter("all");
              setSubjectFilter("all");
              setSearchTerm("");
            }}
          >
            <span>▦</span>
            Dashboard
          </button>

          {/* FAVORITES */}
          <button
            className={`nav-item ${
              activePage === "favorites" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("favorites");
              setFilter("all");
              setReviewedFilter("all");
              setSubjectFilter("all");
              setSearchTerm("");
            }}
          >
            <span>☆</span>
            Favorites
          </button>

          {/* REVIEWED */}
          <button
            className={`nav-item ${
              activePage === "reviewed" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("reviewed");
              setFilter("all");
              setReviewedFilter("all");
              setSubjectFilter("all");
              setSearchTerm("");
            }}
          >
            <span>✓</span>
            Reviewed
          </button>

        </nav>

        <div className="sidebar-bottom">
          <div className="study-tip">
            <span>💡</span>

            <p>
              Keep your notes organized and make studying easier.
            </p>
          </div>
        </div>

      </aside>

      {/* MAIN */}
      <main className="main">

        {/* HEADER */}
        <header className="topbar">

          <div>
            <p className="eyebrow">YOUR STUDY SPACE</p>

            <h1>Study Notes</h1>

            <p className="subtitle">
              Organize your notes, files and study materials.
            </p>
          </div>

          <div className="stats">

            <div className="stat-card">
              <span>Total Notes</span>
              <strong>{notes.length}</strong>
            </div>

            <div className="stat-card">
              <span>Favorites</span>

              <strong>
                {notes.filter((note) => note.favorite).length}
              </strong>
            </div>

            <div className="stat-card">
              <span>Reviewed</span>

              <strong>
                {notes.filter((note) => note.reviewed).length}
              </strong>
            </div>

          </div>

        </header>

        {/* ADD NOTE */}
        <section className="add-note-card">

          <div className="section-heading">
            <div>
              <h2>Create a new note</h2>

              <p>
                Add your study material to your workspace.
              </p>
            </div>
          </div>

          <div className="note-form">

            <input
              type="text"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <label className="file-input">

              <span>📎</span>

              <span>
                {file ? file.name : "Choose file"}
              </span>

              <input
                type="file"
                onChange={(e) =>
                  setFile(e.target.files[0])
                }
              />

            </label>

            <button
              className="add-button"
              onClick={handleAddNote}
            >
              + Add Note
            </button>

          </div>

        </section>

        {/* FILTERS */}
        <section className="toolbar">

          <div className="search-box">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search your notes..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

          </div>

          <select
            value={subjectFilter}
            onChange={(e) =>
              setSubjectFilter(e.target.value)
            }
          >
            <option value="all">All Subjects</option>

            {[...new Set(notes.map((note) => note.subject))].map(
              (subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              )
            )}

          </select>

          <select
            value={reviewedFilter}
            onChange={(e) =>
              setReviewedFilter(e.target.value)
            }
          >
            <option value="all">All Notes</option>
            <option value="reviewed">Reviewed</option>
            <option value="not_reviewed">
              Not Reviewed
            </option>
          </select>

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
          >
            <option value="all">All</option>
            <option value="favorite">Favorites</option>
            <option value="not_favorite">
              Not Favorites
            </option>
          </select>

        </section>

        {/* NOTES */}
        <section className="notes-section">

          <div className="notes-header">

            <div>

              <h2>Your Notes</h2>

              <p>
                {filteredNotes.length} notes found
              </p>

            </div>

          </div>

          <div className="notes-grid">

            {filteredNotes.map((note) => (

              <article
                className={`note-card ${
                  note.favorite ? "favorite-card" : ""
                }`}
                key={note._id}
              >

                {editingNoteId === note._id ? (

                  <div className="edit-area">

                    <input
                      value={editingTitle}
                      onChange={(e) =>
                        setEditingTitle(e.target.value)
                      }
                    />

                    <input
                      value={editingSubject}
                      onChange={(e) =>
                        setEditingSubject(e.target.value)
                      }
                    />

                    <div className="edit-actions">

                      <button
                        className="save-button"
                        onClick={handleSaveEditing}
                      >
                        Save
                      </button>

                      <button
                        className="cancel-button"
                        onClick={handleCancelEditing}
                      >
                        Cancel
                      </button>

                    </div>

                  </div>

                ) : (

                  <>

                    <div className="note-top">

                      <div className="note-icon">
                        📝
                      </div>

                      <button
                        className={`favorite-button ${
                          note.favorite ? "is-favorite" : ""
                        }`}
                        onClick={() =>
                          handleToggleFavorite(
                            note._id,
                            note.favorite
                          )
                        }
                      >
                        {note.favorite ? "★" : "☆"}
                      </button>

                    </div>

                    <div className="note-content">

                      <h3>{note.title}</h3>

                      <span className="subject-tag">
                        {note.subject}
                      </span>

                    </div>

                    <div className="note-footer">

                      <label className="reviewed">

                        <input
                          type="checkbox"
                          checked={note.reviewed}
                          onChange={() =>
                            handleToggleReviewed(
                              note._id,
                              note.reviewed
                            )
                          }
                        />

                        <span>
                          {note.reviewed
                            ? "Reviewed"
                            : "Not reviewed"}
                        </span>

                      </label>

                      <div className="note-actions">

                        {note.filePath && (
                          <a
                            className="view-button"
                            href={`http://localhost:5000/uploads/${encodeURIComponent(
                              note.filePath
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        )}

                        <button
                          onClick={() =>
                            handleStartEditing(
                              note._id,
                              note.title,
                              note.subject
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to delete "${note.title}"?`
                              )
                            ) {
                              handleDelete(note._id);
                            }
                          }}
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </>

                )}

              </article>

            ))}

          </div>

          {filteredNotes.length === 0 && (

            <div className="empty-state">

              <div>📚</div>

              <h3>No notes found</h3>

              <p>
                Try changing your search or filters.
              </p>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default App;