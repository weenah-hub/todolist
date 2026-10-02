/*
  Todo List App - Frontend (React)
  =================================
  3 Tabs:
  1. Todos    — add, toggle, delete todos
  2. Notes    — add, edit, delete notes
  3. Completed — shows all accomplished tasks

  Uses localStorage to store data (no backend needed).
*/

import { useState, useEffect } from 'react'

// ----- localStorage helpers -----
function loadFromStorage(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function App() {
  const [activeTab, setActiveTab] = useState('todos')

  return (
    <div className="container">
      <h1>📝 My Planner</h1>

      {/* ----- Tab Navigation ----- */}
      <div className="tabs">
        <button
          className={activeTab === 'todos' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('todos')}
        >
          ✅ Todos
        </button>
        <button
          className={activeTab === 'notes' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('notes')}
        >
          📒 Notes
        </button>
        <button
          className={activeTab === 'completed' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('completed')}
        >
          🏆 Completed
        </button>
      </div>

      {/* ----- Tab Content ----- */}
      {activeTab === 'todos' && <TodosTab />}
      {activeTab === 'notes' && <NotesTab />}
      {activeTab === 'completed' && <CompletedTab />}
    </div>
  )
}

/* ========================================
   TAB 1: TODOS
   ======================================== */
function TodosTab() {
  const [todos, setTodos] = useState(() =>
    loadFromStorage('todos', [
      { id: 1, text: 'Learn React', done: false },
      { id: 2, text: 'Build a cool app', done: false },
      { id: 3, text: 'Share with friends', done: false },
    ])
  )
  const [newText, setNewText] = useState('')

  // Save to localStorage whenever todos change
  useEffect(() => {
    saveToStorage('todos', todos)
  }, [todos])

  function addTodo() {
    if (!newText.trim()) return
    const newTodo = {
      id: Date.now(),
      text: newText,
      done: false,
    }
    setTodos([...todos, newTodo])
    setNewText('')
  }

  function toggleDone(todo) {
    setTodos(todos.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)))
  }

  function deleteTodo(id) {
    setTodos(todos.filter((t) => t.id !== id))
  }

  return (
    <div>
      <div className="add-row">
        <input
          type="text"
          placeholder="What do you need to do?"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.done ? 'done' : ''}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleDone(todo)}
              />
              <span>{todo.text}</span>
            </label>
            <button className="delete" onClick={() => deleteTodo(todo.id)}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && <p className="empty">No todos yet — add one above!</p>}
    </div>
  )
}

/* ========================================
   TAB 2: NOTES
   ======================================== */
function NotesTab() {
  const [notes, setNotes] = useState(() =>
    loadFromStorage('notes', [
      { id: 1, title: 'Welcome!', content: 'This is my first note.' },
    ])
  )
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  // Save to localStorage whenever notes change
  useEffect(() => {
    saveToStorage('notes', notes)
  }, [notes])

  function addNote() {
    if (!title.trim() || !content.trim()) return
    const newNote = {
      id: Date.now(),
      title: title,
      content: content,
    }
    setNotes([...notes, newNote])
    setTitle('')
    setContent('')
  }

  function startEdit(note) {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  function saveEdit(id) {
    setNotes(
      notes.map((n) =>
        n.id === id ? { ...n, title: editTitle, content: editContent } : n
      )
    )
    setEditingId(null)
  }

  function deleteNote(id) {
    setNotes(notes.filter((n) => n.id !== id))
  }

  return (
    <div>
      {/* Add note form */}
      <div className="note-form">
        <input
          type="text"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        <button onClick={addNote}>Add Note</button>
      </div>

      {/* Notes list */}
      <div className="notes-list">
        {notes.map((note) => (
          <div key={note.id} className="note-card">
            {editingId === note.id ? (
              /* ----- Edit Mode ----- */
              <div className="note-edit">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                />
                <div className="note-actions">
                  <button className="save-btn" onClick={() => saveEdit(note.id)}>
                    Save
                  </button>
                  <button className="cancel-btn" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* ----- View Mode ----- */
              <>
                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <div className="note-actions">
                  <button className="edit-btn" onClick={() => startEdit(note)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => deleteNote(note.id)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {notes.length === 0 && <p className="empty">No notes yet — add one above!</p>}
    </div>
  )
}

/* ========================================
   TAB 3: COMPLETED TASKS
   ======================================== */
function CompletedTab() {
  const [todos] = useState(() => loadFromStorage('todos', []))
  const completed = todos.filter((t) => t.done)

  return (
    <div>
      <h2 className="section-title">🏆 Accomplished Tasks</h2>
      <ul className="todo-list">
        {completed.map((todo) => (
          <li key={todo.id} className="done">
            <label>
              <input type="checkbox" checked readOnly />
              <span>{todo.text}</span>
            </label>
          </li>
        ))}
      </ul>

      {completed.length === 0 && (
        <p className="empty">Nothing completed yet — check off some todos!</p>
      )}
    </div>
  )
}

export default App
