import React, { useState } from "react";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";
import api from "../api";
import {
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdFlight,
  MdDirectionsBoat,
  MdDirectionsCar,
  MdHelpOutline,
  MdCheckCircle,
  MdArrowForward,
  MdPerson,
  MdMessage,
  MdWarning,
} from "react-icons/md";

const hotelFaqData = [
  {
    q: "What are the standard check-in and check-out times?",
    a: "Check-in begins at 3:00 PM, and check-out is at 12:00 PM noon. Registered VIP guests enjoy guaranteed early check-in from 11:00 AM and late check-out until 4:00 PM upon advance request.",
  },
  {
    q: "How do private airport chauffeur and helipad transfers work?",
    a: "Complimentary Rolls-Royce Phantom transfers are included for Presidential and Penthouse reservations. For all other guests, chauffeur or helicopter arrival coordination can be arranged directly with our concierge desk prior to arrival.",
  },
  {
    q: "What is the dress code across your restaurants?",
    a: "L'Étoile Royale requests formal evening attire (jacket recommended for gentlemen). Aura Oceanfront Grill and The Velvet & Amber Bar welcome elegant resort chic and smart casual attire. Beachwear is reserved for pool and beach venues.",
  },
  {
    q: "Can non-hotel residents book dining tables or spa treatments?",
    a: "Yes, external guests are warmly welcomed at our Michelin-starred venues and Lotus Spa with advance reservation. In-house guests always receive guaranteed priority booking times.",
  },
  {
    q: "What is the cancellation and deposit policy?",
    a: "Standard suites may be modified or cancelled up to 48 hours prior to arrival with no penalty. Penthouse and Presidential Suites require 7 days advance notice.",
  },
  {
    q: "Are children and pets permitted at the resort?",
    a: "We welcome guests of all ages. For families, we offer interconnecting suites, our Little Royalty children's concierge, and certified nanny services. Discretionary canine accommodations are available in ground-level Garden Sanctuary Villas.",
  },
];

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("General Concierge Inquiry");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await api.post("/inquiries", {
        type: "contact_message",
        guestName: name.trim(),
        email: email.trim(),
        subject: topic,
        message: message.trim(),
      });
      setSent(true);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to send. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper white-gold-theme">
      <LandingNavbar />

      {/* Hero Header */}
      <header className="page-hero-banner">
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <span className="page-kicker">AT YOUR SERVICE AROUND THE CLOCK</span>
          <h1 className="page-title">Global Concierge & Estate Location</h1>
          <p className="page-subtitle">
            Our Head Concierge and reservations team are at your disposal 24 hours a day to assist
            with private transfers, customized dietary arrangements, and bespoke itinerary planning.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="contact-main-container">
        {/* Contact Cards Strip */}
        <section className="contact-cards-grid">
          <div className="contact-info-card">
            <div className="contact-icon"><MdLocationOn /></div>
            <h3>Estate Location</h3>
            <p>1000 Oceanview Boulevard, Grand Haven Island, Archipelagic Zone 4</p>
            <span className="contact-sub">Private Island Access · 25 min from Int'l Airport</span>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon"><MdPhone /></div>
            <h3>Direct Concierge Line</h3>
            <p>+1 (800) 849-LUXURY</p>
            <span className="contact-sub">International: +1 (555) 019-2800 · Toll-Free 24/7</span>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon"><MdEmail /></div>
            <h3>Electronic Inquiries</h3>
            <p>concierge@luxurystay.com</p>
            <span className="contact-sub">Reservations: bookings@luxurystay.com</span>
          </div>
        </section>

        {/* Arrival Logistics */}
        <section className="arrival-ways-section">
          <div className="arrival-header">
            <span className="section-kicker">ARRIVAL CHOREOGRAPHY</span>
            <h2>Three Flawless Ways to Arrive</h2>
          </div>

          <div className="arrival-cards-grid">
            <div className="arrival-card">
              <MdDirectionsCar className="arrival-icon" />
              <h4>Private Chauffeur Fleet</h4>
              <p>Met curbside at the airport terminal by your uniformed chauffeur with chilled towels and sparkling water in a bespoke Rolls-Royce Phantom.</p>
            </div>
            <div className="arrival-card">
              <MdFlight className="arrival-icon" />
              <h4>Rooftop Helipad Arrival</h4>
              <p>Touch down directly on our certified resort helipad (Coordinates: 25°04'32"N, 77°20'18"W). Aerial transfer flight takes 8 minutes from the capital.</p>
            </div>
            <div className="arrival-card">
              <MdDirectionsBoat className="arrival-icon" />
              <h4>Private Deep-Water Marina</h4>
              <p>Our protected private marina offers 12 slips accommodating superyachts up to 240 feet, featuring full shore power, fresh water, and customs clearance.</p>
            </div>
          </div>
        </section>

        {/* Interactive Inquiry Form */}
        <section className="contact-form-section">
          <div className="contact-form-box" style={{
            background: "linear-gradient(135deg, rgba(15,12,40,0.97) 0%, rgba(8,10,28,0.98) 100%)",
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: 20, padding: "36px 36px",
            backdropFilter: "blur(16px)",
          }}>
            <div className="form-box-header" style={{ marginBottom: 28 }}>
              <span className="section-kicker">DIRECT INQUIRY</span>
              <h3 style={{ color: "#fff", fontFamily: "Outfit", fontSize: 24, fontWeight: 800, margin: "8px 0 6px" }}>Send a Message to the Chief Concierge</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Whether arranging a bespoke wedding, private charter, or suite dietary curation, our team responds within 60 minutes.</p>
            </div>

            {sent ? (
              <div className="reservation-confirmed-card">
                <MdCheckCircle className="conf-icon" />
                <h4>Message Received</h4>
                <p>
                  Thank you, <strong>{name}</strong>. Our Chief Concierge has received your inquiry regarding <strong>{topic}</strong> and will reply to <strong>{email}</strong> shortly.
                </p>
                <button type="button" className="guest-btn-secondary" onClick={() => { setName(""); setEmail(""); setMessage(""); setTopic("General Concierge Inquiry"); setFormError(""); setSent(false); }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {formError && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(231,76,60,0.12)", border: "1px solid rgba(231,76,60,0.35)", borderRadius: 10, color: "#ff7875", fontSize: 13 }}>
                    <MdWarning /> {formError}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(201,168,76,0.9)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Your Legal Name *</label>
                    <div style={{ position: "relative" }}>
                      <MdPerson style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: 17, pointerEvents: "none" }} />
                      <input type="text" placeholder="Arthur Pendelton" value={name} onChange={(e) => setName(e.target.value)} required
                        style={{ width: "100%", height: 48, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, color: "#F0F2F8", fontFamily: "Inter", fontSize: 14, paddingLeft: 42, outline: "none" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(201,168,76,0.9)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Email Address *</label>
                    <div style={{ position: "relative" }}>
                      <MdEmail style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: 17, pointerEvents: "none" }} />
                      <input type="email" placeholder="arthur@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                        style={{ width: "100%", height: 48, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, color: "#F0F2F8", fontFamily: "Inter", fontSize: 14, paddingLeft: 42, outline: "none" }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(201,168,76,0.9)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Inquiry Subject *</label>
                  <select value={topic} onChange={(e) => setTopic(e.target.value)}
                    style={{ width: "100%", height: 50, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, color: "#F0F2F8", fontFamily: "Inter", fontSize: 14, padding: "0 16px", outline: "none", appearance: "none", cursor: "pointer" }}>
                    <option value="General Concierge Inquiry" style={{ background: "#0c0f26" }}>General Concierge &amp; Stay Inquiry</option>
                    <option value="Private Suite & Villa Booking" style={{ background: "#0c0f26" }}>Private Suite &amp; Villa Booking</option>
                    <option value="Michelin Dining Table Reservation" style={{ background: "#0c0f26" }}>Michelin Dining Table Reservation</option>
                    <option value="Lotus Spa & Wellness Appointment" style={{ background: "#0c0f26" }}>Lotus Spa &amp; Wellness Appointment</option>
                    <option value="Private Yacht or Helicopter Charter" style={{ background: "#0c0f26" }}>Private Yacht or Helicopter Charter</option>
                    <option value="Weddings & Aristocratic Events" style={{ background: "#0c0f26" }}>Weddings &amp; Aristocratic Private Events</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(201,168,76,0.9)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Your Message *</label>
                  <textarea
                    rows="4"
                    placeholder="Describe your anticipated travel dates, suite preferences, or specific arrangements needed..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, color: "#F0F2F8", fontFamily: "Inter", fontSize: 14, padding: "14px 16px", outline: "none", resize: "vertical", minHeight: 120 }}
                  />
                </div>

                <button type="submit" disabled={saving}
                  style={{ height: 52, background: "linear-gradient(135deg, #C9A84C, #A07B30)", border: "none", borderRadius: 12, color: "#050810", fontFamily: "Outfit", fontSize: 15, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 6px 24px rgba(201,168,76,0.4)" }}>
                  {saving ? "Sending…" : <><span>Transmit Concierge Inquiry</span><MdArrowForward /></>}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Hotel FAQ Section */}
        <section className="contact-faq-section">
          <div className="faq-header">
            <span className="section-kicker">FREQUENTLY ASKED QUESTIONS</span>
            <h2>Hotel Policies & Guest Guidelines</h2>
          </div>

          <div className="faq-list-grid">
            {hotelFaqData.map((item, i) => (
              <div key={i} className="faq-detail-card">
                <h4><MdHelpOutline className="faq-icon-gold" /> {item.q}</h4>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default ContactPage;
