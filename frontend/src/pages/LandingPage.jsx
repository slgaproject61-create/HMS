import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";
import {
  MdHotel,
  MdCalendarToday,
  MdPeople,
  MdSearch,
  MdCheckCircle,
  MdStars,
  MdRoomService,
  MdPool,
  MdRestaurant,
  MdSpa,
  MdDirectionsCar,
  MdFitnessCenter,
  MdArrowForward,
  MdBed,
  MdWarning,
  MdCardGiftcard,
  MdVerified,
} from "react-icons/md";

const suitePreviews = [
  {
    id: "suite-presidential",
    name: "Presidential Sky Suite",
    category: "Presidential Suite",
    tag: "Most Exclusive Sanctuary",
    price: 850,
    size: "1,450 sq ft",
    guests: 2,
    bed: "King Imperial Bed",
    view: "360° Skyline & Ocean",
    image: "/hotel-lobby.jpg",
    desc: "Soaring floor-to-ceiling panoramic windows, private outdoor heated jacuzzi terrace, and 24/7 dedicated British-guild butler service.",
  },
  {
    id: "suite-penthouse",
    name: "Royal Penthouse Villa",
    category: "Penthouse",
    tag: "Pinnacle of Global Luxury",
    price: 1200,
    size: "2,200 sq ft",
    guests: 4,
    bed: "2 California King Beds",
    view: "Direct Unobstructed Oceanfront",
    image: "/hotel-exterior.jpg",
    desc: "Rooftop infinity plunge pool, private executive chef's kitchen, grand Steinway piano, and in-suite sommelier wine & cigar cellar.",
  },
  {
    id: "suite-ocean",
    name: "Executive Oceanfront Suite",
    category: "Executive Suite",
    tag: "Guest Favorite & Romantic Haven",
    price: 550,
    size: "950 sq ft",
    guests: 2,
    bed: "Plush King Bed",
    view: "Direct Golden Sunset View",
    image: "/hotel-exterior.jpg",
    desc: "Spacious seaside elegance with an expansive private sun balcony, deep freestanding marble soaking tub, and Bang & Olufsen sound.",
  },
];

const diningPreviews = [
  {
    name: "L'Étoile Royale",
    accolade: "3 Michelin Stars",
    cuisine: "French Haute Cuisine",
    desc: "An avant-garde 9-course degustation menu by Chef Jean-Luc Laurent, paired with rare vintages from our 5,000-bottle subterranean cellar.",
    image: "/hotel-lobby.jpg",
  },
  {
    name: "Aura Oceanfront Grill",
    accolade: "Forbes 4-Star",
    cuisine: "Seafood & Prime Steaks",
    desc: "Catch of the day and dry-aged steaks prepared on hardwood rotisseries over water, accompanied by fresh oysters and caviar service.",
    image: "/hotel-exterior.jpg",
  },
  {
    name: "The Velvet & Amber Bar",
    accolade: "Top 50 Bars",
    cuisine: "Speakeasy & Rare Spirits",
    desc: "Intimate speakeasy featuring 50-year-old single malts, botanical cocktail infusions, and nightly live jazz piano.",
    image: "/hotel-lobby.jpg",
  },
];

const amenitiesList = [
  { icon: <MdPool />, title: "Heated Sky Infinity Pool", desc: "Private cabanas, poolside mixology, and sunset panoramas." },
  { icon: <MdRestaurant />, title: "Michelin-Starred Dining", desc: "Three distinctive fine dining venues curated by internationally acclaimed culinary masters." },
  { icon: <MdSpa />, title: "Lotus Hydrotherapy Sanctuary", desc: "A 12,000 sq ft holistic sanctuary with Himalayan salt grotto and mineral pools." },
  { icon: <MdRoomService />, title: "24/7 Dedicated Butler", desc: "Attentive, discreet service catering to your every request at any hour." },
  { icon: <MdDirectionsCar />, title: "Chauffeur Rolls-Royce Fleet", desc: "Complimentary airport transfers in bespoke Rolls-Royce and Maybach vehicles." },
  { icon: <MdFitnessCenter />, title: "Technogym Wellness Hub", desc: "State-of-the-art equipment, certified personal trainers, and private yoga pavilions." },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isCustomer, isLoggedIn, bookings } = useAuth();

  const todayStr = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0]
  );
  const [checkOut, setCheckOut] = useState(
    new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0]
  );
  const [guests, setGuests] = useState("2");
  const [dateError, setDateError] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (new Date(checkIn) >= new Date(checkOut)) {
      setDateError("Check-in date cannot be greater than or equal to check-out date.");
      return;
    }
    setDateError("");
    navigate("/suites", { state: { checkInDate: checkIn, checkOutDate: checkOut, guestsCount: guests } });
  };

  return (
    <div className="page-wrapper white-gold-theme">
      <LandingNavbar />

      {/* Hero Section */}
      <header className="landing-hero-luxe">
        <div
          className="hero-background-media"
          style={{ backgroundImage: "url(/hotel-exterior.jpg)" }}
        >
          <div className="hero-light-overlay" />
        </div>

        <div className="hero-luxe-content">
          {/* VIP Welcome Banner if guest is signed in */}
          {isLoggedIn && isCustomer && (
            <div className="vip-guest-strip">
              <div className="vip-avatar-gold">
                {user.name ? user.name.charAt(0).toUpperCase() : "G"}
              </div>
              <div className="vip-strip-text">
                <h3>Welcome Back, {user.name}</h3>
                <p>
                  <span className="gold-pill-tag"><MdStars /> VIP Privileges Active</span>
                  · {user.loyaltyPoints || 250} Rewards Points Available
                </p>
              </div>
              <Link to="/suites" className="vip-strip-cta">
                Book with VIP Rates →
              </Link>
            </div>
          )}

          <div className="hero-badge-pill">
            <MdStars className="star-icon" /> 5-STAR ULTRA-LUXURY SANCTUARY
          </div>

          <h1 className="hero-headline">
            Where Opulence Meets <br />
            <span className="gold-shimmer-text">Timeless Splendor</span>
          </h1>

          <p className="hero-subline">
            Immerse yourself in world-class seaside elegance. Handcrafted Italian suites,
            Michelin-starred gastronomy, and intuitive British-guild butler care tailored to your stay.
          </p>

          {/* Quick Search & Reservation Bar in White & Gold */}
          <form onSubmit={handleSearchSubmit} className="hero-search-box-luxe">
            <div className="search-col-luxe">
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
                className="search-control-luxe"
              />
            </div>

            <div className="search-col-luxe">
              <label><MdCalendarToday /> Check-Out</label>
              <input
                type="date"
                min={checkIn}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="search-control-luxe"
              />
            </div>

            <div className="search-col-luxe">
              <label><MdPeople /> Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="search-control-luxe"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>

            <div className="search-btn-col">
              <button type="submit" className="hero-btn-search">
                <MdSearch /> Check Suite Availability
              </button>
            </div>
          </form>

          {dateError && (
            <div className="hero-date-error">
              <MdWarning /> {dateError}
            </div>
          )}

          <div className="hero-guarantee-line">
            <span>✓ Best Rate Guaranteed</span>
            <span>•</span>
            <span>✓ Complimentary Champagne Welcome</span>
            <span>•</span>
            <span>✓ Free Cancellation up to 48 Hours</span>
          </div>
        </div>
      </header>

      {/* 1. SUITES PREVIEW SECTION */}
      <section className="landing-luxe-section">
        <div className="section-head-center">
          <span className="section-kicker">EXQUISITE SANCTUARIES</span>
          <h2 className="section-title-luxe">Curated Suites & Private Villas</h2>
          <p className="section-desc-luxe">
            Discover architectural masterpieces boasting panoramic ocean vistas, private heated jacuzzi terraces,
            and 24/7 dedicated butler service.
          </p>
        </div>

        <div className="preview-suites-grid">
          {suitePreviews.map((suite) => (
            <div key={suite.id} className="preview-suite-card">
              <div className="card-media-luxe" style={{ backgroundImage: `url(${suite.image})` }}>
                <span className="card-luxe-tag">{suite.tag}</span>
                <div className="card-price-luxe">
                  <span className="price-num">${suite.price}</span>
                  <span className="price-label">/ night</span>
                </div>
              </div>

              <div className="card-body-luxe">
                <div className="card-meta-line">
                  <span>{suite.size}</span>
                  <span>•</span>
                  <span><MdPeople /> Up to {suite.guests} Guests</span>
                  <span>•</span>
                  <span><MdBed /> {suite.bed}</span>
                </div>
                <h3>{suite.name}</h3>
                <p className="card-view-tag">{suite.view}</p>
                <p className="card-desc-luxe">{suite.desc}</p>
                <div className="card-footer-luxe">
                  <Link to="/suites" className="btn-card-explore">
                    Reserve Suite <MdArrowForward />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="section-explore-center">
          <Link to="/suites" className="btn-explore-dedicated">
            Explore All 6 Suites & Villas with Full Floorplans →
          </Link>
        </div>
      </section>

      {/* 2. GASTRONOMY PREVIEW SECTION */}
      <section className="landing-luxe-section section-ivory-bg">
        <div className="section-head-center">
          <span className="section-kicker">MICHELIN GASTRONOMY</span>
          <h2 className="section-title-luxe">An Odyssey of Exceptional Flavors</h2>
          <p className="section-desc-luxe">
            Three distinctive culinary destinations curated by internationally acclaimed chefs,
            complemented by rare vintages from our 5,000-bottle cellar.
          </p>
        </div>

        <div className="preview-dining-grid">
          {diningPreviews.map((venue, i) => (
            <div key={i} className="preview-dining-card">
              <div className="dining-media-luxe" style={{ backgroundImage: `url(${venue.image})` }}>
                <span className="venue-star-tag">{venue.accolade}</span>
              </div>
              <div className="dining-body-luxe">
                <span className="venue-sub-tag">{venue.cuisine}</span>
                <h3>{venue.name}</h3>
                <p>{venue.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="section-explore-center">
          <Link to="/dining" className="btn-explore-dedicated">
            View Full Menus, Chef Biographies & Table Reservations →
          </Link>
        </div>
      </section>

      {/* 3. LOTUS SPA PREVIEW */}
      <section className="landing-luxe-section">
        <div className="spa-split-banner-luxe">
          <div className="spa-split-text">
            <span className="section-kicker">HOLISTIC RESTORATION</span>
            <h2>The Lotus Hydrotherapy & Wellness Sanctuary</h2>
            <p>
              Spanning 12,000 square feet of soothing natural stone, water gardens, and steam pavilions.
              Experience heated Himalayan pink salt inhalation grottoes, Thalassotherapy sea mineral infinity pools,
              and Ayurvedic body rituals.
            </p>
            <div className="spa-perks-row">
              <div><strong>✓ Himalayan Salt Grotto</strong></div>
              <div><strong>✓ Thalassotherapy Pools</strong></div>
              <div><strong>✓ Couples Garden Pavilions</strong></div>
            </div>
            <Link to="/spa" className="btn-explore-dedicated" style={{ marginTop: 24 }}>
              Explore Treatment Menu & Reserve Spa Appointment →
            </Link>
          </div>
          <div className="spa-split-image" style={{ backgroundImage: "url(/hotel-exterior.jpg)" }} />
        </div>
      </section>

      {/* 4. EXPERIENCES PREVIEW */}
      <section className="landing-luxe-section section-ivory-bg">
        <div className="section-head-center">
          <span className="section-kicker">MEMORIES BEYOND COMPARE</span>
          <h2 className="section-title-luxe">Bespoke Curated Excursions</h2>
          <p className="section-desc-luxe">
            From sunset champagne sailing on our 72-ft Sunseeker motor yacht to aerial helicopter vineyard tastings,
            our Chief Concierge designs moments that linger for a lifetime.
          </p>
        </div>

        <div className="section-explore-center">
          <Link to="/experiences" className="btn-explore-dedicated">
            Browse All Private Yacht, Helicopter & Island Excursions →
          </Link>
        </div>
      </section>

      {/* 5. HERITAGE & AMENITIES */}
      <section className="landing-luxe-section">
        <div className="section-head-center">
          <span className="section-kicker">WORLD-CLASS REPUTATION</span>
          <h2 className="section-title-luxe">The Art of European Hospitality</h2>
          <p className="section-desc-luxe">
            Since 1928, LuxuryStay has welcomed royalty and global dignitaries with unparalleled warmth,
            discretion, and bespoke attention.
          </p>
        </div>

        <div className="amenities-grid-luxe">
          {amenitiesList.map((item, i) => (
            <div key={i} className="amenity-card-luxe">
              <div className="amenity-icon-gold">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="section-explore-center" style={{ marginTop: 40 }}>
          <Link to="/heritage" className="btn-explore-dedicated">
            Discover Our 1928 Architectural Heritage & Sustainability Charter →
          </Link>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="landing-cta-luxe">
        <div className="cta-luxe-box">
          <span className="cta-kicker-gold">YOUR EXTRAORDINARY SANCTUARY AWAITS</span>
          <h2>Reserve Your Suite at LuxuryStay</h2>
          <p>Experience the benchmark of 5-star seaside hospitality with guaranteed best rates and champagne arrival.</p>
          <div className="cta-buttons-row">
            <Link to="/suites" className="cta-btn-gold">
              Explore Suites & Book Now
            </Link>
            <Link to="/contact" className="cta-btn-outline">
              Contact Concierge Desk
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
