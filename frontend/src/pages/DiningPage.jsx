import React, { useState } from "react";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";
import {
  MdRestaurant,
  MdWineBar,
  MdStars,
  MdCalendarToday,
  MdAccessTime,
  MdPeople,
  MdCheckCircle,
  MdArrowForward,
} from "react-icons/md";

const diningVenues = [
  {
    id: "etoile",
    name: "L'Étoile Royale",
    accolade: "3 Michelin Stars · Forbes 5-Star Dining",
    cuisine: "Contemporary French Haute Cuisine",
    hours: "Dinner: 6:00 PM – 11:00 PM (Closed Mondays)",
    dressCode: "Formal Evening Attire Required",
    image: "/hotel-lobby.jpg",
    chef: "Executive Chef Jean-Luc Laurent",
    sommelier: "Head Sommelier Marcel Dupuis",
    desc: "A beacon of global gastronomy. Chef Jean-Luc Laurent presents avant-garde French technique celebrating the world's most prized seasonal delicacies paired with Grand Cru vintages from our 5,000-bottle subterranean cellar.",
    menuHighlights: [
      { name: "Oscietra Royal Caviar & Langoustine Tartare", price: "$95", desc: "Gold leaf, smoked crème fraîche, brioche feuilletée" },
      { name: "Perigord Black Truffle & Carnaroli Risotto", price: "$85", desc: "Aged 36-month Parmigiano-Reggiano, cultured Brittany butter" },
      { name: "A5 Miyazaki Wagyu Tenderloin Rossini", price: "$180", desc: "Pan-seared duck foie gras, Madeira bone marrow reduction" },
      { name: "Wild Turbot Poached in Champagne Emulsion", price: "$120", desc: "Braised baby leeks, sea urchin emulsion, sea aster" },
      { name: "Grand Cru Valrhona Chocolate Sphere", price: "$40", desc: "Warm single-origin caramel pour, Madagascar vanilla foam" },
    ],
    degustation: "9-Course Signature Degustation Tasting Menu: $340 per guest (Wine pairing: +$195)",
  },
  {
    id: "aura",
    name: "Aura Oceanfront Grill & Raw Bar",
    accolade: "Forbes 4-Star Verified Venue",
    cuisine: "Coastal Mediterranean, Catch of the Day & Prime Steaks",
    hours: "Lunch: 12:00 PM – 3:30 PM | Dinner: 6:00 PM – 10:30 PM",
    dressCode: "Smart Resort Chic",
    image: "/hotel-exterior.jpg",
    chef: "Chef de Cuisine Marco Bellini",
    desc: "Perched over the turquoise ocean with an open-flame hardwood rotisserie and panoramic sunset terrace. Seafood arrives daily from local artisan fishermen and is prepared simply with cold-pressed olive oils, sea salt, and aromatic herbs.",
    menuHighlights: [
      { name: "Grand Seafood Plateau Royale", price: "$165", desc: "Chilled Maine lobster, King crab legs, oysters on the half shell" },
      { name: "Salt-Crusted Mediterranean Sea Bass", price: "$92", desc: "Flambéed tableside with Provençal herbs and lemon velouté" },
      { name: "Dry-Aged Tomahawk Ribeye (42oz for Two)", price: "$220", desc: "Smoked sea salt, truffle chimichurri, roasted bone marrow" },
      { name: "Wood-Fired Spanish Octopus", price: "$48", desc: "Crispy fingerling potatoes, smoked paprika aioli, chorizo oil" },
    ],
    degustation: "Sunset Chef's Selection Tasting: $185 per guest",
  },
  {
    id: "velvet",
    name: "The Velvet & Amber Speakeasy Bar",
    accolade: "World's 50 Best Discovery Venue",
    cuisine: "Artisanal Mixology, Vintage Cognacs & Small Bites",
    hours: "5:00 PM – 2:00 AM Nightly",
    dressCode: "Smart Elegant",
    image: "/hotel-lobby.jpg",
    desc: "Hidden behind an unadorned mahogany door in the historical wing. An intimate sanctuary featuring 50-year-old single malts, custom botanical infusions, and live jazz pianists performing every evening.",
    menuHighlights: [
      { name: "The 1928 Amber Solera", price: "$48", desc: "Rare Louis XIII cognac, saffron smoke, fig reduction, 24k gold leaf" },
      { name: "Smoked Rosemary Old Fashioned", price: "$32", desc: "WhistlePig 12-Year Rye, charred French oak, Angostura & orange bitters" },
      { name: "Velvet Truffle Martini", price: "$35", desc: "Beluga Transatlantic vodka, white truffle dry vermouth, blue cheese olive" },
      { name: "A5 Wagyu Sliders (Trio)", price: "$52", desc: "Brioche buns, black garlic aioli, caramelized shallots" },
    ],
    degustation: "Vintage Cognac Flight (3 Pours): $140 per guest",
  },
];

const DiningPage = () => {
  const [activeVenue, setActiveVenue] = useState("etoile");
  const [resName, setResName] = useState("");
  const [resEmail, setResEmail] = useState("");
  const [resDate, setResDate] = useState(new Date().toISOString().split("T")[0]);
  const [resTime, setResTime] = useState("19:30");
  const [resGuests, setResGuests] = useState("2");
  const [resNotes, setResNotes] = useState("");
  const [resSubmitted, setResSubmitted] = useState(false);

  const currentVenue = diningVenues.find((v) => v.id === activeVenue) || diningVenues[0];

  const handleReservationSubmit = (e) => {
    e.preventDefault();
    setResSubmitted(true);
  };

  return (
    <div className="page-wrapper white-gold-theme">
      <LandingNavbar />

      {/* Hero Header */}
      <header className="page-hero-banner">
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <span className="page-kicker">MICHELIN GASTRONOMY</span>
          <h1 className="page-title">An Odyssey of Culinary Artistry</h1>
          <p className="page-subtitle">
            Experience three distinct culinary sanctuaries curated by internationally acclaimed chefs,
            featuring rare vintage pairings and panoramic oceanfront atmospheres.
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="dining-main-container">
        {/* Venue Selector Tabs */}
        <div className="dining-venue-tabs">
          {diningVenues.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`venue-tab-btn ${activeVenue === v.id ? "active" : ""}`}
              onClick={() => { setActiveVenue(v.id); setResSubmitted(false); }}
            >
              <span className="venue-tab-name">{v.name}</span>
              <span className="venue-tab-sub">{v.cuisine.split(",")[0]}</span>
            </button>
          ))}
        </div>

        {/* Active Venue Showcase */}
        <section className="venue-showcase-card">
          <div className="venue-showcase-grid">
            <div className="venue-showcase-media" style={{ backgroundImage: `url(${currentVenue.image})` }}>
              <span className="venue-badge-floating">{currentVenue.accolade}</span>
            </div>

            <div className="venue-showcase-info">
              <span className="venue-cuisine-tag">{currentVenue.cuisine}</span>
              <h2 className="venue-title">{currentVenue.name}</h2>
              <p className="venue-description">{currentVenue.desc}</p>

              <div className="venue-specs-grid">
                <div className="spec-item">
                  <strong>Service Hours:</strong>
                  <span>{currentVenue.hours}</span>
                </div>
                <div className="spec-item">
                  <strong>Dress Code:</strong>
                  <span>{currentVenue.dressCode}</span>
                </div>
                <div className="spec-item">
                  <strong>Culinary Leadership:</strong>
                  <span>{currentVenue.chef}</span>
                </div>
              </div>

              {currentVenue.degustation && (
                <div className="degustation-banner">
                  <MdStars className="degustation-icon" />
                  <div>
                    <strong>Signature Tasting Experience:</strong>
                    <p>{currentVenue.degustation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu Highlights List */}
          <div className="venue-menu-section">
            <div className="menu-header">
              <span className="section-kicker">CULINARY CREATIONS</span>
              <h3>Signature Dishes & Curated Pairings</h3>
            </div>

            <div className="menu-items-grid">
              {currentVenue.menuHighlights.map((dish, i) => (
                <div key={i} className="menu-dish-card">
                  <div className="dish-title-row">
                    <h4>{dish.name}</h4>
                    <span className="dish-price">{dish.price}</span>
                  </div>
                  <p className="dish-desc">{dish.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Table Reservation Booking Form */}
          <div className="dining-reservation-form-box">
            <div className="form-box-header">
              <span className="section-kicker">CONFIRM YOUR TABLE</span>
              <h3>Reserve a Table at {currentVenue.name}</h3>
              <p>In-house guests receive priority seating. We recommend reserving at least 24 hours in advance.</p>
            </div>

            {resSubmitted ? (
              <div className="reservation-confirmed-card">
                <MdCheckCircle className="conf-icon" />
                <h4>Reservation Request Received</h4>
                <p>
                  Thank you, <strong>{resName}</strong>. Our Maître d’ will confirm your table for{" "}
                  <strong>{resGuests} guest(s)</strong> on <strong>{resDate} at {resTime}</strong> via email.
                </p>
                <button
                  type="button"
                  className="guest-btn-secondary"
                  onClick={() => setResSubmitted(false)}
                >
                  Make Another Reservation
                </button>
              </div>
            ) : (
              <form onSubmit={handleReservationSubmit} className="dining-booking-form">
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="guest-label">Guest Full Name</label>
                    <input
                      type="text"
                      className="guest-input"
                      placeholder="e.g. Arthur Pendelton"
                      value={resName}
                      onChange={(e) => setResName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="guest-label">Email Address</label>
                    <input
                      type="email"
                      className="guest-input"
                      placeholder="e.g. arthur@example.com"
                      value={resEmail}
                      onChange={(e) => setResEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="guest-label">Party Size</label>
                    <select
                      className="guest-input"
                      value={resGuests}
                      onChange={(e) => setResGuests(e.target.value)}
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                      <option value="5">5 Guests</option>
                      <option value="6">6+ Guests (Private Dining)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="guest-label">Preferred Date</label>
                    <input
                      type="date"
                      className="guest-input"
                      value={resDate}
                      onChange={(e) => setResDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="guest-label">Seating Time</label>
                    <select
                      className="guest-input"
                      value={resTime}
                      onChange={(e) => setResTime(e.target.value)}
                    >
                      <option value="18:00">6:00 PM</option>
                      <option value="18:30">6:30 PM</option>
                      <option value="19:00">7:00 PM</option>
                      <option value="19:30">7:30 PM</option>
                      <option value="20:00">8:00 PM</option>
                      <option value="20:30">8:30 PM</option>
                      <option value="21:00">9:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="guest-label">Dietary Preferences or Special Occasion Notes</label>
                  <input
                    type="text"
                    className="guest-input"
                    placeholder="e.g. Anniversary celebration, shellfish allergy, window table requested"
                    value={resNotes}
                    onChange={(e) => setResNotes(e.target.value)}
                  />
                </div>

                <button type="submit" className="guest-btn-primary">
                  Request Table Reservation <MdArrowForward />
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

export default DiningPage;
