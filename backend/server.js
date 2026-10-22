require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const jwt     = require("jsonwebtoken");
const bcrypt  = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// ─── In-Memory Store ────────────────────────────────────────────────────────
let _id = 1;
const newId = () => String(_id++);

const db = {
  attendees: [],
  events:    [],
  tickets:   []
};

// ─── Request Logger ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

// ─── Auth Middleware ─────────────────────────────────────────────────────────
function authGuard(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ error: "Bearer token required" });
  try {
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

const api = express.Router();

// POST /api/v1/auth/register
api.post("/auth/register", async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "name, email and password are required" });
  if (db.attendees.find(a => a.email === email.toLowerCase()))
    return res.status(400).json({ error: "Email already exists" });
  const attendee = {
    _id: newId(),
    name,
    email: email.toLowerCase(),
    phone: phone || "",
    passwordHash: await bcrypt.hash(password, 10),
    role: role === "organizer" ? "organizer" : "attendee"
  };
  db.attendees.push(attendee);
  const token = jwt.sign({ id: attendee._id, role: attendee.role }, process.env.JWT_SECRET, { expiresIn: "2h" });
  res.status(201).json({ token, attendee: { id: attendee._id, name: attendee.name, email: attendee.email }, role: attendee.role });
});

// POST /api/v1/auth/login
api.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });
  const attendee = db.attendees.find(a => a.email === email.toLowerCase());
  if (!attendee || !(await bcrypt.compare(password, attendee.passwordHash)))
    return res.status(401).json({ error: "Invalid email or password" });
  const token = jwt.sign({ id: attendee._id, role: attendee.role }, process.env.JWT_SECRET, { expiresIn: "2h" });
  res.json({ token, attendee: { id: attendee._id, name: attendee.name, email: attendee.email }, role: attendee.role });
});

// GET /api/v1/events (public)
api.get("/events", (req, res) => {
  res.json(db.events.slice().sort((a, b) => new Date(a.date) - new Date(b.date)));
});

// ── Protected routes below ───────────────────────────────────────────────────
api.use(authGuard);

// POST /api/v1/tickets
api.post("/tickets", (req, res) => {
  const { eventId, quantity } = req.body;
  if (!eventId || !Number.isInteger(quantity) || quantity < 1)
    return res.status(400).json({ error: "Valid eventId and positive whole-number quantity required" });
  const event = db.events.find(e => e._id === eventId);
  if (!event) return res.status(400).json({ error: "Event not found" });
  if (event.ticketsAvailable < quantity)
    return res.status(400).json({ error: "Not enough tickets available" });
  event.ticketsAvailable -= quantity;
  const ticket = { _id: newId(), attendeeId: req.user.id, eventId, quantity, status: "booked", bookedAt: new Date().toISOString() };
  db.tickets.push(ticket);
  res.status(201).json({ message: "Tickets booked successfully", ticket });
});

// GET /api/v1/tickets/my
api.get("/tickets/my", (req, res) => {
  const tickets = db.tickets
    .filter(t => t.attendeeId === req.user.id)
    .map(t => {
      const event = db.events.find(e => e._id === t.eventId) || {};
      return { ...t, eventId: { _id: event._id, title: event.title, date: event.date, venue: event.venue } };
    });
  res.json(tickets);
});

// PATCH /api/v1/tickets/:id/status
api.patch("/tickets/:id/status", (req, res) => {
  const { status } = req.body;
  if (!["booked", "cancelled", "used"].includes(status))
    return res.status(400).json({ error: "Status must be booked, cancelled or used" });
  const ticket = db.tickets.find(t => t._id === req.params.id && t.attendeeId === req.user.id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  if (ticket.status === status) return res.json({ message: "Ticket status unchanged", ticket });
  if (ticket.status !== "booked")
    return res.status(400).json({ error: "Only booked tickets can be cancelled or marked used" });
  if (status === "cancelled") {
    const event = db.events.find(e => e._id === ticket.eventId);
    if (event) event.ticketsAvailable += ticket.quantity;
  }
  ticket.status = status;
  res.json({ message: "Ticket status updated", ticket });
});

// POST /api/v1/events (organizer only)
api.post("/events", (req, res) => {
  if (req.user.role !== "organizer")
    return res.status(403).json({ error: "Organizer role required" });
  const { title, category, date, venue, ticketsAvailable } = req.body;
  if (!title || !date || !venue)
    return res.status(400).json({ error: "title, date and venue are required" });
  const event = { _id: newId(), title, category: category || "General", date, venue, ticketsAvailable: Number(ticketsAvailable) || 100 };
  db.events.push(event);
  res.status(201).json(event);
});

app.use("/api/v1", api);

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Seed Demo Data ───────────────────────────────────────────────────────────
async function seed() {
  if (!db.attendees.find(a => a.email === "attendee@eventhub.com")) {
    db.attendees.push({ _id: newId(), name: "Demo Attendee", email: "attendee@eventhub.com", phone: "9999999999", passwordHash: await bcrypt.hash("123456", 10), role: "attendee" });
  }
  if (!db.attendees.find(a => a.email === "organizer@eventhub.com")) {
    db.attendees.push({ _id: newId(), name: "Demo Organizer", email: "organizer@eventhub.com", phone: "9999999998", passwordHash: await bcrypt.hash("123456", 10), role: "organizer" });
  }
  if (db.events.length === 0) {
    db.events.push(
      { _id: newId(), title: "Music Festival",   category: "Music",         date: "2027-01-15", venue: "Ahmedabad", ticketsAvailable: 100 },
      { _id: newId(), title: "Tech Conference",  category: "Technology",    date: "2027-02-10", venue: "Surat",     ticketsAvailable: 50  },
      { _id: newId(), title: "Comedy Night",     category: "Entertainment", date: "2027-03-05", venue: "Vadodara",  ticketsAvailable: 0   }
    );
  }
}

async function startServer() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required in .env");
  await seed();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
}

startServer().catch(err => { console.error("Startup failed:", err.message); process.exit(1); });
