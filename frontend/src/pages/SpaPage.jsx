import React, { useState } from "react";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";
import api from "../api";
import {
  MdSpa,
  MdPool,
  MdStars,
  MdCheckCircle,
  MdCalendarToday,
  MdAccessTime,
  MdSelfImprovement,
  MdArrowForward,
  MdPerson,
  MdEmail,
  MdPhone,
  MdWarning,
} from "react-icons/md";

const treatmentsList = [
  {
    category: "Signature Rituals",
    items: [
      { name: "Himalayan Salt & Warm Herbal Poultice Therapy", duration: "90 Minutes", price: "$280", desc: "Heated Himalayan pink salt stones and steaming organic botanical herbal poultices relieve deep-seated muscle tension and balance the body's energetic meridians." },
      { name: "Royal Lotus Couples Harmony Journey", duration: "150 Minutes", price: "$680 for Two", desc: "Conducted in a private VIP garden pavilion. Includes foot bathing ceremony, full body bespoke massage, warm rose-oil scalp therapy, and private jacuzzi with champagne." },
      { name: "Ancient Ayurvedic Shirodhara & Marma Awakening", duration: "75 Minutes", price: "$230", desc: "A rhythmic flow of warm dosha-specific botanical oils over the third eye, accompanied by gentle neck and scalp massage to induce profound meditative calm." },
    ],
  },
  {
    category: "Couture Facials & Skin Revitalization",
    items: [
      { name: "Thalassotherapy Marine Collagen Infusion", duration: "75 Minutes", price: "$245", desc: "High-potency sea minerals and pure marine collagen sheets restore elasticity, diminish fine lines, and impart an illuminated golden glow." },
      { name: "Diamond Micro-Dermabrasion & Oxygen Lift", duration: "60 Minutes", price: "$220", desc: "Precision micro-polishing followed by hyperbaric pure oxygen serum infusion to deeply hydrate and brighten tired skin." },
    ],
  },
  {
    category: "Thermal Hydrotherapy & Body Wraps",
    items: [
      { name: "Volcanic Mineral Clay Detox Cocoon", duration: "75 Minutes", price: "$210", desc: "A purifying warm volcanic ash and seaweed wrap followed by Swiss rain showers and a soothing neroli blossom hydration veil." },
      { name: "Full Day Holistic Sanctuary Pass", duration: "All Day Access", price: "$150 (Complimentary for Suite Guests)", desc: "Unlimited access to the heated magnesium mineral pools, Himalayan salt inhalation grotto, cedarwood saunas, and relaxation sunbeds." },
    ],
  },
];

const allTreatments = treatmentsList.flatMap((c) => c.items);
const timeSlots = [
  { val: "09:00 AM", label: "9:00 AM – Morning Sanctuary" },
  { val: "11:00 AM", label: "11:00 AM – Mid-Day Session" },
  { val: "02:00 PM", label: "2:00 PM – Afternoon Awakening" },
  { val: "04:30 PM", label: "4:30 PM – Sunset Serenity" },
  { val: "06:30 PM", label: "6:30 PM – Evening Restoration" },
];

const SpaPage = () => {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [prefDate, setPrefDate] = useState(new Date().toISOString().split("T")[0]);
  const [prefTime, setPrefTime] = useState("11:00 AM");
  const [selectedTreatment, setSelectedTreatment] = useState(allTreatments[0].name);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await api.post("/inquiries", {
        type: "spa_booking",
        guestName: guestName.trim(),
        email: guestEmail.trim(),
        phone: guestPhone.trim(),
        treatment: selectedTreatment,
        preferredDate: prefDate,
        preferredTime: prefTime,
      });
      setBookingConfirmed(true);
    } catch (err) {
      setFormError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setGuestName(""); setGuestEmail(""); setGuestPhone("");
    setPrefDate(new Date().toISOString().split("T")[0]);
    setPrefTime("11:00 AM");
    setSelectedTreatment(allTreatments[0].name);
    setFormError(""); setBookingConfirmed(false);
  };

  /* Shared input style for dark backgrounds */
  const inp = {
    width: "100%", height: 48,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 12, color: "#F0F2F8",
    fontFamily: "Inter", fontSize: 14,
    padding: "0 16px", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div className="page-wrapper white-gold-theme">
      <LandingNavbar />

      {/* Hero Header */}
      <header className="page-hero-banner">
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <span className="page-kicker">HOLISTIC RESTORATION</span>
          <h1 className="page-title">The Lotus Hydrotherapy & Wellness Sanctuary</h1>
          <p className="page-subtitle">
            Spanning 12,000 square feet of soothing natural stone, water gardens, and steam pavilions.
            Surrender to ancient therapies, sea mineral pools, and bespoke rejuvenating rituals.
          </p>
        </div>
      </header>

      <main className="spa-main-container">
        {/* Sanctuary Highlights Grid */}
        <section className="spa-facilities-grid">
          <div className="facility-card">
            <div className="facility-icon"><MdSpa /></div>
            <h3>Himalayan Salt Grotto</h3>
            <p>A climate-controlled chamber lined with pure Himalayan pink crystal blocks. Promotes deep respiratory healing and cellular revitalization.</p>
          </div>
          <div className="facility-card">
            <div className="facility-icon"><MdPool /></div>
            <h3>Thalassotherapy Pools</h3>
            <p>Heated sea-mineral pools featuring variable water pressures, swan neck massage fountains, and underwater bubble recliners.</p>
          </div>
          <div className="facility-card">
            <div className="facility-icon"><MdSelfImprovement /></div>
            <h3>Cedar Saunas & Steam</h3>
            <p>Nordic dry cedar saunas and eucalyptus-infused steam rooms designed to eliminate toxins and relax muscle fibres.</p>
          </div>
        </section>

        {/* Treatment Menu */}
        <section className="spa-treatments-section">
          <div className="menu-header">
            <span className="section-kicker">SPA TREATMENT MENU</span>
            <h2>Curated Healing & Rejuvenation Rituals</h2>
            <p>All treatments begin with our signature warm foot bath ceremony and finish with herbal elixir refreshments.</p>
          </div>
          <div className="treatment-categories-list">
            {treatmentsList.map((cat, idx) => (
              <div key={idx} className="treatment-category-block">
                <h3 className="category-title">{cat.category}</h3>
                <div className="treatment-items-grid">
                  {cat.items.map((item, i) => (
                    <div key={i} className="treatment-item-card">
                      <div className="item-head">
                        <div>
                          <h4>{item.name}</h4>
                          <span className="item-duration"><MdAccessTime /> {item.duration}</span>
                        </div>
                        <span className="item-price">{item.price}</span>
                      </div>
                      <p className="item-desc">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Spa Appointment Booking Form */}
        <section className="spa-booking-section">
          <div className="spa-booking-card" style={{ background: "linear-gradient(135deg, rgba(15,12,40,0.97) 0%, rgba(8,10,28,0.98) 100%)", border: "1px solid rgba(201,168,76,0.25)", backdropFilter: "blur(16px)" }}>
            <div className="form-box-header">
              <span className="section-kicker">RESERVE YOUR APPOINTMENT</span>
              <h3 style={{ color: "#fff" }}>Book a Treatment at Lotus Spa</h3>
              <p style={{ color: "rgba(255,255,255,0.55)" }}>Our concierge will verify therapist availability and send your appointment confirmation within two hours.</p>
            </div>

            {bookingConfirmed ? (
              <div className="reservation-confirmed-card">
                <MdCheckCircle className="conf-icon" />
                <h4>Spa Appointment Requested</h4>
                <p>
                  Thank you, <strong>{guestName}</strong>. Your appointment for the <strong>{selectedTreatment}</strong> on{" "}
                  <strong>{prefDate} at {prefTime}</strong> has been received and will be confirmed via {guestEmail}.
                </p>
                <button type="button" className="guest-btn-secondary" onClick={resetForm}>
                  Book Another Treatment
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {formError && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(231,76,60,0.12)", border: "1px solid rgba(231,76,60,0.35)", borderRadius: 10, color: "#ff7875", fontSize: 13 }}>
                    <MdWarning /> {formError}
                  </div>
                )}

                {/* Row 1: Name + Email */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(201,168,76,0.9)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Guest Name *</label>
                    <div style={{ position: "relative" }}>
                      <MdPerson style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: 17, pointerEvents: "none" }} />
                      <input type="text" placeholder="Arthur Pendelton" value={guestName} onChange={(e) => setGuestName(e.target.value)} required style={{ ...inp, paddingLeft: 42 }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(201,168,76,0.9)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Email Address *</label>
                    <div style={{ position: "relative" }}>
                      <MdEmail style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: 17, pointerEvents: "none" }} />
                      <input type="email" placeholder="arthur@example.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required style={{ ...inp, paddingLeft: 42 }} />
                    </div>
                  </div>
                </div>

                {/* Row 2: Phone */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(201,168,76,0.9)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Phone Number (Optional)</label>
                  <div style={{ position: "relative" }}>
                    <MdPhone style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: 17, pointerEvents: "none" }} />
                    <input type="tel" placeholder="+1 (555) 000-0000" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} style={{ ...inp, paddingLeft: 42 }} />
                  </div>
                </div>

                {/* Treatment selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(201,168,76,0.9)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Select Treatment or Ritual *</label>
                  <select
                    value={selectedTreatment}
                    onChange={(e) => setSelectedTreatment(e.target.value)}
                    style={{ ...inp, height: 50, paddingLeft: 16, appearance: "none", cursor: "pointer" }}
                  >
                    {allTreatments.map((t) => (
                      <option key={t.name} value={t.name} style={{ background: "#0c0f26", color: "#F0F2F8" }}>
                        {t.name} · {t.duration} · {t.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date + Time */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(201,168,76,0.9)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Preferred Date *</label>
                    <div style={{ position: "relative" }}>
                      <MdCalendarToday style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: 16, pointerEvents: "none" }} />
                      <input type="date" value={prefDate} onChange={(e) => setPrefDate(e.target.value)} required style={{ ...inp, paddingLeft: 42 }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(201,168,76,0.9)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Preferred Time *</label>
                    <select value={prefTime} onChange={(e) => setPrefTime(e.target.value)} style={{ ...inp, height: 50, paddingLeft: 16, appearance: "none", cursor: "pointer" }}>
                      {timeSlots.map((s) => (
                        <option key={s.val} value={s.val} style={{ background: "#0c0f26", color: "#F0F2F8" }}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    height: 52, background: "linear-gradient(135deg, #C9A84C, #A07B30)",
                    border: "none", borderRadius: 12, color: "#050810",
                    fontFamily: "Outfit", fontSize: 15, fontWeight: 800,
                    letterSpacing: "0.04em", textTransform: "uppercase",
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    boxShadow: "0 6px 24px rgba(201,168,76,0.4)",
                    transition: "all 0.25s",
                  }}
                >
                  {saving ? "Submitting Request…" : <><span>Request Spa Appointment</span><MdArrowForward /></>}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default SpaPage;
