export default function EventCard({
  title,
  category,
  date,
  venue,
  ticketsAvailable,
  onBook
}) {
  const soldOut = ticketsAvailable === 0;

  return (
    <article className="card">
      <h3>{title}</h3>
      <p><strong>Category:</strong> {category}</p>
      <p><strong>Date:</strong> {new Date(date).toLocaleDateString()}</p>
      <p><strong>Venue:</strong> {venue}</p>
      <p><strong>Tickets Available:</strong> {ticketsAvailable}</p>
      {soldOut ? (
        <span className="badge">Sold Out</span>
      ) : (
        <button onClick={onBook}>Book</button>
      )}
    </article>
  );
}
