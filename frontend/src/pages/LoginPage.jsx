import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("attendee@eventhub.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      login(data);
      navigate(data.role === "organizer" ? "/organizer" : "/events");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page narrow">
      <h1>EventHub Login</h1>
      <p>Sign in to browse events and book tickets.</p>
      <form onSubmit={handleLogin} className="form">
        <label>Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p className="muted">Demo attendee: attendee@eventhub.com / 123456</p>
      <p className="muted">Demo organizer: organizer@eventhub.com / 123456</p>
    </main>
  );
}
