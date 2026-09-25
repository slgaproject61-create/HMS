import React, { useState } from "react";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";
import api from "../api";
import {
  MdDirectionsBoat,
  MdFlight,
  MdNightlife,
  MdBathtub,
  MdCheckCircle,
  MdAccessTime,
  MdAttachMoney,
  MdArrowForward,
  MdCalendarToday,
  MdPerson,
  MdEmail,
  MdPeople,
  MdWarning,
} from "react-icons/md";

const experiencesData = [
  {
    id: "yacht",
    title: "Sunset Champagne Yacht Charter",
    category: "Maritime Luxury",
    duration: "3.5 Hours",
    price: "$1,800 for up to 6 Guests",
    image: "/hotel-exterior.jpg",
    desc: "Embark on our private 72-foot Sunseeker luxury motor yacht. Cruise the crystalline coastal coves with chilled Dom Pérignon, artisanal canapés prepared by our chef, and an onboard swimming stop in an azure private lagoon.",
    inclusions: ["Private Captain & Steward Service", "Two Bottles of Vintage Dom Pérignon", "Gourmet Seafood & Charcuterie Canapés", "Snorkeling & Seabob Jet Gear Included"],
  },
  {
    id: "helicopter",
    title: "Helicopter Vineyard & Reserve Cellar Expedition",
    category: "Aerial & Enology",
    duration: "4.5 Hours",
    price: "$2,400 for up to 4 Guests",
    image: "/hotel-lobby.jpg",
    desc: "Depart directly from the LuxuryStay rooftop helipad. Take an exhilarating coastal flight over the archipelago before landing at a private mountain estate for a private masterclass and 6-course wine pairing lunch.",
    inclusions: ["Private Twin-Engine Helicopter Flights", "Exclusive Access to Private Family Cellars", "6-Course Wine-Paired Degustation Lunch", "Signed Bottle of Limited Reserve Vintage"],
  },
  {
    id: "beach-cabana",
    title: "Starlit Beachfront Cabana Private Dinner",
    category: "Romantic Dining",
    duration: "Evening (7:00 PM – 10:30 PM)",
    price: "$850 for Two",
    image: "/hotel-exterior.jpg",
    desc: "An enchanting private dining setup on our secluded white-sand beach. Torches flicker as a dedicated butler serves a 7-course custom seafood menu accompanied by live acoustic violin beneath the stars.",
    inclusions: ["Secluded Oceanfront Table & Floral Styling", "Personal Butler & Private Sommelier", "Custom 7-Course Seafood or Truffle Menu", "Live Acoustic Violinist for 2 Hours"],
  },
  {
    id: "scuba",
    title: "Coral Reef Sanctuary & Seabob Safari",
    category: "Marine Adventure",
    duration: "4 Hours",
    price: "$420 per Guest",
    image: "/hotel-lobby.jpg",
    desc: "Glide effortlessly through protected coral gardens using advanced underwater Seabob electric scooters. Led by our resident marine biologist, encounter sea turtles, vibrant reef species, and gentle rays.",
    inclusions: ["Private Marine Biologist Expedition Lead", "Latest High-Speed Seabob F5-S Scooters", "Underwater 4K Video & Photo Keepsake", "Gourmet Bento Refreshment on Private Boat"],
  },
  {
    id: "heritage-walk",
    title: "1928 Grand Heritage & Sommelier Tour",
    category: "Culture & Heritage",
    duration: "2.5 Hours",
    price: "$280 per Guest",
    image: "/hotel-exterior.jpg",
    desc: "Explore the hidden secret passages, aristocratic ballroom archives, and underground cellars of the 1928 estate. Concludes with a guided vintage cognac and artisanal chocolate pairing.",
    inclusions: ["Head Historian & Chief Sommelier Guidance", "Exclusive Access to Archival Suites & Cellar", "Tasting of 3 Rare Vintages & 50-Year Cognac", "Hardcover Illustrated History of LuxuryStay"],
  },
];

const ExperiencesPage = () => {
  const [selectedExp, setSelectedExp] = useState(experiencesData[0].title);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [guestCount, setGuestCount] = useState("2");
  const [inquirySent, setInquirySent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await api.post("/inquiries", {
        type: "experience_inquiry",
        guestName: name.trim(),
        email: email.trim(),
        experience: selectedExp,
        preferredDate: date,
        guestCount: parseInt(guestCount, 10),
      });
      setInquirySent(true);
    } catch (err) {
      setFormError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setName(""); setEmail(""); setDate(new Date().toISOString().split("T")[0]);
    setGuestCount("2"); setFormError(""); setInquirySent(false);
  };

  const inp = {
    width: "100%", height: 48,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 12, color: "#F0F2F8",
    fontFamily: "Inter", fontSize: 14,
    padding: "0 16px", outline: "none",
  };
  const lbl = { fontSize: 11.5, fontWeight: 700, color: "rgba(201,168,76,0.9)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, display: "block" };

  return (
    <div className="page-wrapper white-gold-theme">
      <LandingNavbar />

      <header className="page-hero-banner">
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <span className="page-kicker">EXTRAORDINARY DISCOVERIES</span>
          <h1 className="page-title">Curated Bespoke Experiences</h1>
          <p className="page-subtitle">
            From private yacht charters across turquoise bays to aerial helicopter vineyard expeditions,
            our Chief Concierge crafts unrepeatable moments tailored solely to your passions.
          </p>
        </div>
      </header>

      <main className="experiences-main-container">
        <div className="experiences-cards-list">
          {experiencesData.map((exp) => (
            <article key={exp.id} className="experience-detail-card">
              <div className="exp-card-media" style={{ backgroundImage: `url(${exp.image})` }}>
                <span className="exp-category-pill">{exp.category}</span>
                <span className="exp-price-badge">{exp.price}</span>
              </div>
              <div className="exp-card-content">
                <div className="exp-duration-tag"><MdAccessTime /> Duration: {exp.duration}</div>
                <h2 className="exp-title">{exp.title}</h2>
                <p className="exp-desc">{exp.desc}</p>
                <div className="exp-inclusions-list">
                  <h4>Curated Inclusions:</h4>
                  <ul>
                    {exp.inclusions.map((inc, i) => (
                      <li key={i}><MdCheckCircle className="check-gold" /> {inc}</li>
                    ))}
                  </ul>
                </div>
                <div className="exp-card-footer">
                  <a href="#exp-booking" className="btn-inquire-exp" onClick={() => setSelectedExp(exp.title)}>
                    Reserve This Experience <MdArrowForward />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Booking form */}
        <section id="exp-booking" className="exp-inquiry-box">
          <div style={{
            background: "linear-gradient(135deg, rgba(15,12,40,0.97) 0%, rgba(8,10,28,0.98) 100%)",
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: 20, padding: "36px 36px",
            backdropFilter: "blur(16px)",
          }}>
            <div className="form-box-header" style={{ marginBottom: 28 }}>
              <span className="section-kicker">CHIEF CONCIERGE DESK</span>
              <h3 style={{ color: "#fff", fontFamily: "Outfit", fontSize: 24, fontWeight: 800, margin: "8px 0 6px" }}>
                Reserve an Experience or Request a Custom Itinerary
              </h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                Our dedicated concierge will contact you with availability and personalize every detail of your excursion.
              </p>
            </div>

            {inquirySent ? (
              <div className="reservation-confirmed-card">
                <MdCheckCircle className="conf-icon" />
                <h4>Experience Inquiry Confirmed</h4>
                <p>
                  Thank you, <strong>{name}</strong>. Our Chief Concierge has received your request for{" "}
                  <strong>{selectedExp}</strong> on <strong>{date}</strong> and will reach out via {email} with full details.
                </p>
                <button type="button" className="guest-btn-secondary" onClick={resetForm}>
                  Inquire About Another Excursion
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
                  <div>
                    <label style={lbl}>Guest Legal Name *</label>
                    <div style={{ position: "relative" }}>
                      <MdPerson style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: 17, pointerEvents: "none" }} />
                      <input type="text" placeholder="Arthur Pendelton" value={name} onChange={(e) => setName(e.target.value)} required style={{ ...inp, paddingLeft: 42 }} />
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Email Address *</label>
                    <div style={{ position: "relative" }}>
                      <MdEmail style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: 17, pointerEvents: "none" }} />
                      <input type="email" placeholder="arthur@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ ...inp, paddingLeft: 42 }} />
                    </div>
                  </div>
                </div>

                {/* Experience selector */}
                <div>
                  <label style={lbl}>Select Desired Experience *</label>
                  <select value={selectedExp} onChange={(e) => setSelectedExp(e.target.value)} style={{ ...inp, height: 50, appearance: "none", cursor: "pointer" }}>
                    {experiencesData.map((exp) => (
                      <option key={exp.id} value={exp.title} style={{ background: "#0c0f26", color: "#F0F2F8" }}>
                        {exp.title} — {exp.price}
                      </option>
                    ))}
                    <option value="Bespoke Private Itinerary" style={{ background: "#0c0f26", color: "#C9A84C" }}>✦ Custom Bespoke Private Itinerary</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={lbl}>Preferred Date *</label>
                    <div style={{ position: "relative" }}>
                      <MdCalendarToday style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: 16, pointerEvents: "none" }} />
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ ...inp, paddingLeft: 42 }} />
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Number of Guests</label>
                    <div style={{ position: "relative" }}>
                      <MdPeople style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: 17, pointerEvents: "none" }} />
                      <select value={guestCount} onChange={(e) => setGuestCount(e.target.value)} style={{ ...inp, height: 50, paddingLeft: 42, appearance: "none", cursor: "pointer" }}>
                        {[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n} style={{ background: "#0c0f26" }}>{n} Guest{n > 1 ? "s" : ""}</option>)}
                        <option value="9+" style={{ background: "#0c0f26" }}>9+ (Private Group)</option>
                      </select>
                    </div>
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
                  }}
                >
                  {saving ? "Submitting…" : <><span>Submit Concierge Request</span><MdArrowForward /></>}
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

export default ExperiencesPage;
