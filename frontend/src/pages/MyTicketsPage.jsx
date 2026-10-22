import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";

export default function MyTicketsPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        const response = await fetch("http://localhost:5000/api/v1/tickets/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load tickets");
        setTickets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, [token]);

  if (loading) return <main className="page"><p>Loading your tickets...</p></main>;
  if (error) return <main className="page"><p className="error">Error: {error}</p></main>;

  return (
    <main className="page">
      <h1>My Tickets</h1>
      {tickets.length === 0 && <p>No tickets booked yet.</p>}
      <section className="event-grid">
        {tickets.map(ticket => (
          <article className="card" key={ticket._id}>
            <h3>{ticket.eventId?.title || "Event unavailable"}</h3>
            <p><strong>Venue:</strong> {ticket.eventId?.venue || "N/A"}</p>
            <p><strong>Date:</strong> {ticket.eventId?.date ? new Date(ticket.eventId.date).toLocaleDateString() : "N/A"}</p>
            <p><strong>Quantity:</strong> {ticket.quantity}</p>
            <p><strong>Status:</strong> {ticket.status}</p>
            <p><strong>Booked:</strong> {ticket.bookedAt ? new Date(ticket.bookedAt).toLocaleDateString() : "N/A"}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
