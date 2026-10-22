const mongoose = require("mongoose");

const attendeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["attendee", "organizer", "admin"], default: "attendee" }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  ticketsAvailable: { type: Number, required: true, min: 0 }
});

const ticketSchema = new mongoose.Schema({
  attendeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Attendee", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    validate: { validator: Number.isInteger, message: "Quantity must be a whole number" }
  },
  bookingDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["booked", "cancelled", "used"], default: "booked" }
});

module.exports = {
  Attendee: mongoose.model("Attendee", attendeeSchema),
  Event: mongoose.model("Event", eventSchema),
  Ticket: mongoose.model("Ticket", ticketSchema)
};
