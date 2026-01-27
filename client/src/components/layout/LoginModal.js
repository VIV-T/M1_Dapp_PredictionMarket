import { useState } from "react"

export default function LoginModal({ onClose, onSuccess }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  function handleLogin() {
    if (username === "admin" && password === "password") {
      onSuccess()
    } else {
      setError("Invalid username or password")
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Admin Login</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="error">{error}</div>}

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  )
}
