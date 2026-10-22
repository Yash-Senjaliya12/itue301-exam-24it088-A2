import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Navigation() {
  const { token, role, logout } = useAuth();

  return (
    <nav className="nav">
      <strong>EventHub</strong>
      <Link to="/">Login</Link>
      <Link to="/events">Events</Link>
      <Link to="/my-tickets">My Tickets</Link>
      <Link to="/organizer">Organizer</Link>
      <span className="spacer" />
      {token && <span>Role: {role}</span>}
      {token && <button onClick={logout}>Logout</button>}
    </nav>
  );
}
