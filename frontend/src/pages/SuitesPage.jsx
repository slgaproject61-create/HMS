import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";
import {
  MdCalendarToday,
  MdPeople,
  MdCheckCircle,
  MdStars,
  MdRoomService,
  MdClose,
  MdArrowForward,
  MdVerified,
  MdWarning,
  MdSquareFoot,
  MdBathtub,
  MdKingBed,
  MdCreditCard,
  MdLock,
} from "react-icons/md";

import api from "../api";

const SuitesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isCustomer, isLoggedIn, addBooking } = useAuth();

  const [dbRooms, setDbRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingRoom, setPendingRoom] = useState(null);

  // Dates
  const todayStr = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(
    location.state?.checkInDate || new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0]
  );
  const [checkOut, setCheckOut] = useState(
    location.state?.checkOutDate || new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0]
  );
  const [guests, setGuests] = useState(location.state?.guestsCount || "2");
  const [specialReq, setSpecialReq] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dateWarning, setDateWarning] = useState("");

  // Fetch rooms added from Admin Portal from Backend
  useEffect(() => {
    let isMounted = true;
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const { data } = await api.get("/rooms");
        if (isMounted) {
          setDbRooms(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load rooms from inventory:", err.message);
      } finally {
        if (isMounted) setLoadingRooms(false);
      }
    };
    fetchRooms();
    return () => { isMounted = false; };
  }, []);

  // Resume booking if coming from login
  useEffect(() => {
    if (location.state?.resumeBooking && isLoggedIn) {
      setSelectedRoom(location.state.resumeBooking);
      window.history.replaceState({}, document.title);
    }
  }, [location, isLoggedIn]);

  const handleBookClick = (room) => {
    if (!isLoggedIn) {
      setPendingRoom(room);
      setShowAuthModal(true);
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      setDateWarning("Check-in date cannot be greater than or equal to check-out date.");
      return;
    }

    setDateWarning("");
    setSelectedRoom(room);
  };

  const handleConfirmReservation = async () => {
    if (!selectedRoom || !isLoggedIn) return;

    if (new Date(checkIn) >= new Date(checkOut)) {
      setDateWarning("Check-in date cannot be greater than or equal to check-out date.");
      return;
    }

    setIsProcessing(true);
    const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1);
    const subtotal = selectedRoom.price * nights;
    const taxes = Math.round(subtotal * 0.12);
    const total = subtotal + taxes;

    try {
      // Save reservation to backend database
      await api.post("/reservations", {
        roomNumber: selectedRoom.roomNumber || selectedRoom.number || "101",
        guestName: user?.name || "Valued Guest",
        guestEmail: user?.email || "guest@luxurystay.com",
        guestPhone: user?.phone || "",
        checkIn,
        checkOut,
        adults: parseInt(guests, 10) || 1,
        totalPrice: total,
        source: "Online",
        notes: specialReq || "Booked online via guest portal",
      });
    } catch (apiErr) {
      console.warn("Reservation API save note:", apiErr.message);
    }

    setTimeout(() => {
      const newBooking = addBooking({
        roomName: selectedRoom.name,
        roomType: selectedRoom.category,
        checkIn,
        checkOut,
        nights,
        guests: parseInt(guests, 10),
        totalPrice: total,
        guestName: user?.name || "Valued Guest",
        guestEmail: user?.email || "guest@luxurystay.com",
        specialRequests: specialReq || "VIP Arrival Treatment",
      });

      setIsProcessing(false);
      setSelectedRoom(null);
      setBookingSuccess(newBooking);
    }, 600);
  };

  // Convert DB rooms into luxury suite presentation objects
  const suitesFromDb = dbRooms.map((r) => {
    const amenitiesList = r.amenities
      ? r.amenities.split(",").map((s) => s.trim()).filter(Boolean)
      : ["High-Speed Wi-Fi", "Smart 4K TV", "Carrara Marble Bath", "Dedicated Concierge", "Nespresso Bar"];

    return {
      id: r._id,
      roomNumber: r.number,
      number: r.number,
      name: r.name || `${r.type} Suite #${r.number}`,
      category: r.type,
      tag: r.tag || (r.type === "Presidential Suite" ? "Most Exclusive Sanctuary" : r.type === "Penthouse" ? "Pinnacle of Global Luxury" : `${r.type} Accommodation`),
      price: r.pricePerNight,
      size: r.size || (r.type === "Penthouse" ? "2,200 sq ft" : r.type === "Presidential Suite" ? "1,450 sq ft" : "850 sq ft"),
      guests: r.capacity || 2,
      bed: r.bed || "King Imperial Bed",
      view: r.view || (r.floor && Number(r.floor) > 4 ? "Panoramic Ocean & Skyline" : "City & Ocean View"),
      floor: r.floor ? `Floor ${r.floor}` : "Upper Level",
      image: r.images && r.images.length > 0 ? r.images[0] : "/hotel-lobby.jpg",
      images: r.images && r.images.length > 0 ? r.images : ["/hotel-lobby.jpg"],
      description: r.description || "Indulge in a masterfully appointed architectural haven, featuring panoramic vistas, Italian finishes, and bespoke butler service.",
      features: amenitiesList,
      inclusions: [
        "Complimentary High-Speed Wi-Fi",
        "Artisanal Coffee & Rare Tea Bar",
        "24/7 Dedicated Concierge & Turndown",
        "Access to Sky Pool & Hydrotherapy Suite",
      ],
      status: r.status,
    };
  });

  // Only display rooms created by admin in inventory (and exclude out of service / maintenance for guest booking)
  const availableSuites = suitesFromDb.filter((s) => s.status !== "Out of Service");

  const filteredSuites = categoryFilter === "All"
    ? availableSuites
    : availableSuites.filter((s) => s.category.toLowerCase().includes(categoryFilter.toLowerCase()));

  return (
    <div className="page-wrapper white-gold-theme">
      <LandingNavbar />

      {/* Hero Header */}
      <header className="page-hero-banner">
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <span className="page-kicker">THE PINNACLE OF COMFORT</span>
          <h1 className="page-title">Curated Suites & Private Villas</h1>
          <p className="page-subtitle">
            Indulge in our collection of handcrafted architectural sanctuaries. Each suite offers
            sweeping vistas, Italian silk furnishings, and personal butler services tailored to your stay.
          </p>

          {/* Quick Date Selector Bar in White & Gold */}
          <div className="suites-date-strip">
            <div className="strip-col">
              <label><MdCalendarToday /> Check-In</label>
              <input
                type="date"
                min={todayStr}
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (new Date(checkOut) <= new Date(e.target.value)) {
                    const next = new Date(e.target.value);
                    next.setDate(next.getDate() + 1);
                    setCheckOut(next.toISOString().split("T")[0]);
                  }
                }}
                className="strip-input"
              />
            </div>

            <div className="strip-col">
              <label><MdCalendarToday /> Check-Out</label>
              <input
                type="date"
                min={checkIn}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="strip-input"
              />
            </div>

            <div className="strip-col">
              <label><MdPeople /> Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="strip-input"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>
          </div>

          {dateWarning && (
            <div className="date-warning-pill">
              <MdWarning /> {dateWarning}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="suites-main-container">
        {/* Category Filters */}
        <div className="suites-filter-bar">
          {["All", "Presidential Suite", "Penthouse", "Executive Suite", "Deluxe", "Standard"].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`suite-pill ${categoryFilter === cat ? "active" : ""}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === "All" ? "All Accommodations" : cat}
            </button>
          ))}
        </div>

        {/* Suites Grid */}
        {loadingRooms ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <p style={{ fontFamily: "Cinzel, serif", fontSize: 18, color: "var(--gold)" }}>Loading live suite inventory…</p>
          </div>
        ) : filteredSuites.length === 0 ? (
          <div style={{ textAlign: "center", padding: "70px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(212,175,55,0.25)", margin: "20px 0" }}>
            <div style={{ fontSize: 44, color: "var(--gold)", marginBottom: 12 }}>🏨</div>
            <h3 style={{ fontFamily: "Cinzel, serif", fontSize: 22, color: "#fff", marginBottom: 8 }}>No Suites Available</h3>
            <p style={{ color: "var(--text-muted)", maxWidth: 520, margin: "0 auto 16px", fontSize: 14 }}>
              {categoryFilter !== "All"
                ? `There are currently no suites available in the "${categoryFilter}" category.`
                : "There are currently no suites in the live inventory. Rooms added by the hotel administration will appear here automatically."}
            </p>
            {categoryFilter !== "All" && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCategoryFilter("All")}>
                View All Accommodations
              </button>
            )}
          </div>
        ) : (
          <div className="suites-full-grid">
            {filteredSuites.map((suite) => (
              <article key={suite.id} className="suite-card-luxe">
                <div className="suite-card-image" style={{ backgroundImage: `url(${suite.image})` }}>
                  <span className="suite-luxe-tag">{suite.tag}</span>
                  <div className="suite-luxe-price">
                    <span className="amount">${suite.price}</span>
                    <span className="period">/ night</span>
                  </div>
                </div>

                <div className="suite-card-content">
                  <div className="suite-quick-meta">
                    <span><MdSquareFoot /> {suite.size}</span>
                    <span>•</span>
                    <span><MdPeople /> Up to {suite.guests} Guests</span>
                    <span>•</span>
                    <span><MdKingBed /> {suite.bed}</span>
                  </div>

                  <h2 className="suite-name">{suite.name}</h2>
                  <span className="suite-location-sub">{suite.floor} · {suite.view}</span>
                  <p className="suite-desc">{suite.description}</p>

                  {/* Key Features */}
                  <div className="suite-features-section">
                    <h4>Suite Highlights:</h4>
                    <div className="features-pill-list">
                      {suite.features.map((f, i) => (
                        <span key={i} className="feature-pill-item">
                          <MdCheckCircle className="feat-icon" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Inclusions */}
                  <div className="suite-inclusions-box">
                    <strong>Complimentary Privileges:</strong>
                    <ul>
                      {suite.inclusions.map((inc, i) => (
                        <li key={i}>{inc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="suite-card-actions">
                    <button
                      type="button"
                      className="btn-reserve-suite"
                      onClick={() => handleBookClick(suite)}
                    >
                      Reserve This Suite <MdArrowForward />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* VIP Inclusions Comparison */}
        <section className="suites-privileges-banner">
          <div className="privilege-banner-content">
            <span className="section-kicker">BESPOKE INCLUSIONS</span>
            <h3>Every Suite Reservation Includes</h3>
            <div className="privileges-columns-grid">
              <div className="privilege-col-item">
                <MdRoomService className="col-icon" />
                <h4>24-Hour Dedicated Butler</h4>
                <p>Private packing, garment steaming, bath drawing, and personal tea service whenever requested.</p>
              </div>
              <div className="privilege-col-item">
                <MdStars className="col-icon" />
                <h4>Champagne Welcome Ceremony</h4>
                <p>Chilled Dom Pérignon or vintage Krug awaiting upon your arrival with artisanal canapés.</p>
              </div>
              <div className="privilege-col-item">
                <MdBathtub className="col-icon" />
                <h4>Bespoke Diptyque Paris Bath Bar</h4>
                <p>Full-sized organic bath oils, bath salts, and embroidered monogrammed Egyptian cotton robes.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL 1: AUTH REQUIRED NOTICE */}
      {showAuthModal && (
        <div className="landing-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="landing-modal-box auth-prompt-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowAuthModal(false)}
            >
              <MdClose />
            </button>

            <div className="auth-prompt-header">
              <div className="auth-prompt-icon">
                <MdStars />
              </div>
              <h3>Guest Authentication Required</h3>
              <p>
                To reserve the <strong>{pendingRoom?.name || "selected suite"}</strong>, please sign in to your guest account or create a complimentary guest profile.
              </p>
            </div>

            <div className="auth-prompt-benefits">
              <div className="benefit-item">
                <MdCheckCircle className="benefit-icon" />
                <span>Instant reservation confirmation with guaranteed zero deposit fees</span>
              </div>
              <div className="benefit-item">
                <MdCheckCircle className="benefit-icon" />
                <span>Receive 250 VIP loyalty welcome points immediately on sign in</span>
              </div>
              <div className="benefit-item">
                <MdCheckCircle className="benefit-icon" />
                <span>Personalized butler and pillow preferences remembered for every stay</span>
              </div>
            </div>

            <div className="auth-prompt-actions">
              <button
                type="button"
                className="guest-btn-primary"
                onClick={() => {
                  setShowAuthModal(false);
                  navigate("/login", {
                    state: {
                      resumeBooking: pendingRoom,
                      checkInDate: checkIn,
                      checkOutDate: checkOut,
                      guestsCount: guests,
                      message: `Please sign in to confirm your reservation for the ${pendingRoom?.name}.`,
                    },
                  });
                }}
              >
                Sign In to Reserve Suite
              </button>
              <button
                type="button"
                className="guest-btn-secondary"
                onClick={() => {
                  setShowAuthModal(false);
                  navigate("/signup", {
                    state: {
                      resumeBooking: pendingRoom,
                      checkInDate: checkIn,
                      checkOutDate: checkOut,
                      guestsCount: guests,
                    },
                  });
                }}
              >
                Register New Guest Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMATION MODAL */}
      {selectedRoom && (
        <div className="landing-modal-overlay" onClick={() => setSelectedRoom(null)}>
          <div className="landing-modal-box reservation-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedRoom(null)}
            >
              <MdClose />
            </button>

            <div className="res-modal-header">
              <span className="res-modal-kicker">CONFIRM RESERVATION</span>
              <h2>{selectedRoom.name}</h2>
              <p className="res-modal-category">{selectedRoom.category} · {selectedRoom.view}</p>
            </div>

            <div className="res-summary-grid">
              <div className="res-summary-card">
                <span className="summary-label"><MdCalendarToday /> Check-In</span>
                <strong>{checkIn}</strong>
                <span className="summary-sub">From 3:00 PM</span>
              </div>
              <div className="res-summary-card">
                <span className="summary-label"><MdCalendarToday /> Check-Out</span>
                <strong>{checkOut}</strong>
                <span className="summary-sub">Until 12:00 PM</span>
              </div>
              <div className="res-summary-card">
                <span className="summary-label"><MdPeople /> Occupancy</span>
                <strong>{guests} Guest(s)</strong>
                <span className="summary-sub">{selectedRoom.bed}</span>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="res-price-breakdown">
              <div className="price-row">
                <span>
                  ${selectedRoom.price} ×{" "}
                  {Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1)} Night(s)
                </span>
                <span>
                  $
                  {selectedRoom.price *
                    Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1)}
                </span>
              </div>
              <div className="price-row">
                <span>Hospitality Service & Luxury Taxes (12%)</span>
                <span>
                  $
                  {Math.round(
                    selectedRoom.price *
                      Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1) *
                      0.12
                  )}
                </span>
              </div>
              <div className="price-row total-row">
                <strong>Estimated Total Due at Check-In</strong>
                <strong className="total-number">
                  $
                  {Math.round(
                    selectedRoom.price *
                      Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1) *
                      1.12
                  )}
                </strong>
              </div>
            </div>

            <div className="res-guest-indicator">
              <MdVerified className="guest-indicator-icon" />
              <div>
                <span>Reserving as:</span> <strong>{user?.name}</strong> ({user?.email})
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="guest-label">Special Requests (Optional)</label>
              <textarea
                className="guest-textarea"
                rows="2"
                placeholder="e.g. Chilled Dom Pérignon, high floor, hypoallergenic pillows, quiet wing..."
                value={specialReq}
                onChange={(e) => setSpecialReq(e.target.value)}
              />
            </div>

            {/* ── Payment Method ── */}
            <div style={{
              marginTop: 20,
              padding: "20px 22px",
              background: "rgba(201,168,76,0.06)",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <MdCreditCard style={{ color: "#C9A84C", fontSize: 20 }} />
                <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 14, color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase" }}>Payment Method</span>
              </div>

              {/* Method selector */}
              <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                {[
                  { val: "credit_card", label: "Credit Card" },
                  { val: "debit_card", label: "Debit Card" },
                  { val: "paypal", label: "PayPal" },
                  { val: "bank_transfer", label: "Bank Transfer" },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPaymentMethod(val)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: paymentMethod === val ? "1.5px solid #C9A84C" : "1px solid rgba(255,255,255,0.12)",
                      background: paymentMethod === val ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.04)",
                      color: paymentMethod === val ? "#C9A84C" : "rgba(255,255,255,0.5)",
                      fontFamily: "Inter",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Card fields */}
              {(paymentMethod === "credit_card" || paymentMethod === "debit_card") && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, display: "block" }}>Name on Card</label>
                      <input
                        type="text"
                        placeholder="Arthur C. Pendelton"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        style={{ width: "100%", height: 44, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#F0F2F8", fontSize: 14, padding: "0 14px", outline: "none", fontFamily: "Inter" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, display: "block" }}>Card Number</label>
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim())}
                        style={{ width: "100%", height: 44, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#F0F2F8", fontSize: 14, padding: "0 14px", outline: "none", fontFamily: "Inter", letterSpacing: "0.1em" }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, display: "block" }}>Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="09/28"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, "");
                          if (v.length > 2) v = v.slice(0,2) + "/" + v.slice(2,4);
                          setCardExpiry(v);
                        }}
                        style={{ width: "100%", height: 44, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#F0F2F8", fontSize: 14, padding: "0 14px", outline: "none", fontFamily: "Inter" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, display: "block" }}>CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        style={{ width: "100%", height: 44, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#F0F2F8", fontSize: 14, padding: "0 14px", outline: "none", fontFamily: "Inter" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "paypal" && (
                <div style={{ padding: "16px", textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                  You will be redirected to PayPal to complete your secure payment after confirmation.
                </div>
              )}

              {paymentMethod === "bank_transfer" && (
                <div style={{ padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 10, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                  Bank transfer details will be sent to <strong style={{ color: "#C9A84C" }}>{user?.email}</strong> upon confirmation. Payment due within 48 hours.
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 11.5, color: "rgba(255,255,255,0.3)" }}>
                <MdLock style={{ fontSize: 14 }} /> 256-bit SSL encrypted · PCI DSS compliant · Your data is secure
              </div>
            </div>

            <div className="res-modal-footer" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="guest-btn-secondary"
                onClick={() => setSelectedRoom(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="guest-btn-primary"
                disabled={isProcessing}
                onClick={handleConfirmReservation}
              >
                {isProcessing ? "Processing Payment..." : "Confirm & Pay Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SUCCESS CELEBRATION */}
      {bookingSuccess && (
        <div className="landing-modal-overlay" onClick={() => setBookingSuccess(null)}>
          <div className="landing-modal-box success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon-box">
              <MdStars />
            </div>
            <h2>Reservation Confirmed!</h2>
            <p className="success-sub">
              Your sanctuary awaits. A bespoke confirmation email has been dispatched to <strong>{bookingSuccess.guestEmail}</strong>.
            </p>

            <div className="booking-receipt-card">
              <div className="receipt-header">
                <span>Confirmation Reference:</span>
                <strong>{bookingSuccess.id}</strong>
              </div>
              <div className="receipt-body">
                <div><span>Suite:</span> <strong>{bookingSuccess.roomName}</strong></div>
                <div><span>Dates:</span> <strong>{bookingSuccess.checkIn} to {bookingSuccess.checkOut} ({bookingSuccess.nights} nights)</strong></div>
                <div><span>Guests:</span> <strong>{bookingSuccess.guests} Guest(s)</strong></div>
                <div><span>Total:</span> <strong>${bookingSuccess.totalPrice}</strong></div>
              </div>
            </div>

            <button
              type="button"
              className="guest-btn-primary"
              style={{ width: "100%", marginTop: 20 }}
              onClick={() => setBookingSuccess(null)}
            >
              Return to Suites
            </button>
          </div>
        </div>
      )}

      <LandingFooter />
    </div>
  );
};

export default SuitesPage;
