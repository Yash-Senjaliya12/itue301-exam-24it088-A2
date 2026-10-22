import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import { useAuth } from "../AuthContext";

const API = "http://localhost:5000/api/v1";

export default function EventsPage() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API}/events`);
      if (!response.ok) throw new Error("Could not fetch events");
      setEvents(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function bookTickets(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const response = await fetch(`${API}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: selectedEvent,
          quantity: Number(quantity)
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Booking failed");
      setMessage(data.message);
      setSelectedEvent("");
      setQuantity(1);
      await loadEvents();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <main className="page"><p>Loading events...</p></main>;

  return (
    <main className="page">
      <h1>Available Events</h1>
      <input
        className="search"
        type="search"
        placeholder="Search events by title..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <section className="event-grid">
        {filteredEvents.map(event => (
          <EventCard
            key={event._id}
            title={event.title}
            category={event.category}
            date={event.date}
            venue={event.venue}
            ticketsAvailable={event.ticketsAvailable}
            onBook={() => {
              setSelectedEvent(event._id);
              setQuantity(1);
              setMessage("");
            }}
          />
        ))}
      </section>
      {filteredEvents.length === 0 && <p>No events found.</p>}

      <section className="booking">
        <h2>Book Tickets</h2>
        <form onSubmit={bookTickets} className="form">
          <label>Select event
            <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} required>
              <option value="">Choose an event</option>
              {events.filter(event => event.ticketsAvailable > 0).map(event => (
                <option key={event._id} value={event._id}>
                  {event.title} ({event.ticketsAvailable} available)
                </option>
              ))}
            </select>
          </label>
          <label>Quantity
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={!token}>Confirm Booking</button>
        </form>
        {!token && <p className="muted">Log in to book tickets.</p>}
      </section>
    </main>
  );
}
