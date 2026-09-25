import React, { useEffect, useRef } from "react";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";
import {
  MdHotel,
  MdRoomService,
  MdRestaurant,
  MdSpa,
  MdDirectionsCar,
  MdStars,
  MdEco,
  MdVerified,
} from "react-icons/md";

const timelineEvents = [
  {
    year: "1928",
    era: "The Foundation Era",
    title: "The Vision of Grand Haven",
    desc: "Commissioned as a private coastal palace by Lord Percival Sterling, designed by classical European architects featuring Italian marble archways and expansive seaside verandas. The estate was destined to become one of the world's most storied retreats.",
    icon: "🏰",
    color: "#C9A84C",
    side: "left",
  },
  {
    year: "1954",
    era: "The Golden Age",
    title: "The Golden Era of Aristocracy",
    desc: "A sanctuary for heads of state, authors, screen legends, and royalty seeking total discretion and pristine natural waters far from the public gaze. Winston Churchill spent three consecutive winters here; Cary Grant celebrated his 50th birthday in the Imperial Suite.",
    icon: "✦",
    color: "#E5C97A",
    side: "right",
  },
  {
    year: "1971",
    era: "The Expansion",
    title: "Aqua Wing & Marina Development",
    desc: "Construction of the grand Aqua Wing added 48 rooms, a private deep-water marina, and the celebrated Grand Pavilion ballroom — which hosted the first of five acclaimed international peace summits on its marble terraces.",
    icon: "⚓",
    color: "#A07B30",
    side: "left",
  },
  {
    year: "1988",
    era: "The Botanical Era",
    title: "The Botanical & Spa Expansion",
    desc: "Surrounding ancient woodlands were transformed into our private 20-acre botanical sanctuary, integrating natural thalassotherapy mineral springs. The Lotus Hydrotherapy Sanctuary opened to international acclaim as one of the world's finest wellness retreats.",
    icon: "🌿",
    color: "#C9A84C",
    side: "right",
  },
  {
    year: "2003",
    era: "The Culinary Renaissance",
    title: "Three Michelin Stars Awarded",
    desc: "Executive Chef Armand Beaumont brought three consecutive Michelin stars to L'Étoile Royale, cementing LuxuryStay's reputation as a global fine dining destination. A 10,000-bottle wine cellar was curated from over 60 acclaimed estates.",
    icon: "⭐",
    color: "#E5C97A",
    side: "left",
  },
  {
    year: "2024",
    era: "The Modern Renaissance",
    title: "The $65 Million Grand Restoration",
    desc: "A meticulous restoration combining timeless neoclassical architecture with ultra-modern smart room automation, 3-star Michelin dining, and certified eco-luxury stewardship. Every room reimagined, every stone preserved — LuxuryStay reborn for the next century.",
    icon: "✦",
    color: "#C9A84C",
    side: "right",
  },
];

/* Intersection Observer hook for scroll animations */
const useScrollReveal = (ref, threshold = 0.2) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("timeline-item-visible");
          }
        });
      },
      { threshold }
    );
    const items = el.querySelectorAll(".timeline-scroll-item");
    items.forEach((item) => obs.observe(item));
    return () => obs.disconnect();
  }, []);
};

const HeritagePage = () => {
  const timelineRef = useRef(null);
  useScrollReveal(timelineRef);

  return (
    <div className="page-wrapper white-gold-theme">
      <LandingNavbar />

      {/* Hero Header */}
      <header className="page-hero-banner">
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <span className="page-kicker">A LEGACY OF SPLENDOR</span>
          <h1 className="page-title">A Century of Distinguished Hospitality</h1>
          <p className="page-subtitle">
            Founded in 1928 upon the golden bluffs of Grand Haven Island, LuxuryStay stands as an enduring testament
            to aristocratic grace, immaculate craftsmanship, and the heartfelt art of European service.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="heritage-main-container">
        {/* Story Introduction */}
        <section className="heritage-story-block">
          <div className="story-grid">
            <div className="story-visual-wrap">
              <img
                src="/hotel-lobby.jpg"
                alt="LuxuryStay Grand Lobby & Architecture"
                className="story-img"
              />
              <div className="story-stat-badge">
                <span className="stat-number">98</span>
                <span className="stat-label">Years of Undisputed Excellence</span>
              </div>
            </div>

            <div className="story-text">
              <span className="section-kicker">WHERE HISTORY RESIDES</span>
              <h2>Preserving Aristocratic Heritage in a Contemporary World</h2>
              <p>
                From the moment you cross our grand marble foyer beneath hand-blown Murano crystal chandeliers,
                you are immersed in a world where time slows. Our walls bear witness to nearly a century of royal visits,
                international peace summits, and celebrated romantic escapes.
              </p>
              <p>
                Every detail, from the hand-carved French oak paneling to our manicured botanical gardens, is preserved
                with reverence. Yet, seamlessly integrated behind this classical beauty lies the world's most intuitive
                smart-room technology and carbon-neutral resort infrastructure.
              </p>
            </div>
          </div>
        </section>

        {/* 4 Pillars of Hospitality */}
        <section className="pillars-showcase-section">
          <div className="pillars-header">
            <span className="section-kicker">OUR ETERNAL PROMISE</span>
            <h2>The Four Pillars of LuxuryStay Hospitality</h2>
            <p>Our guiding principles ensure no request is too great and no detail too minor.</p>
          </div>

          <div className="pillars-grid-4">
            <div className="pillar-luxe-card">
              <div className="pillar-luxe-icon"><MdRoomService /></div>
              <h3>Bespoke Butler Service</h3>
              <p>Guild-certified butlers anticipate every wish, offering garment pressing, personalized packing, and in-suite dining orchestration.</p>
            </div>
            <div className="pillar-luxe-card">
              <div className="pillar-luxe-icon"><MdRestaurant /></div>
              <h3>Michelin Gastronomy</h3>
              <p>Led by 3-Michelin-star chefs, our kitchens celebrate farm-to-table organic produce harvested daily from our private estate gardens.</p>
            </div>
            <div className="pillar-luxe-card">
              <div className="pillar-luxe-icon"><MdSpa /></div>
              <h3>Holistic Sanctuaries</h3>
              <p>Combining ancient mineral hydrotherapy with modern dermatological science in a tranquil 12,000 sq ft marble sanctuary.</p>
            </div>
            <div className="pillar-luxe-card">
              <div className="pillar-luxe-icon"><MdDirectionsCar /></div>
              <h3>Flawless Chauffeur Arrival</h3>
              <p>Complimentary greeting in bespoke Rolls-Royce Phantoms and Maybachs, or direct touch-down on our rooftop helipad.</p>
            </div>
          </div>
        </section>

        {/* ───── SCROLL-BASED TIMELINE ───── */}
        <section className="heritage-timeline-section" ref={timelineRef}>
          <div className="timeline-header">
            <span className="section-kicker">OUR CHRONICLE</span>
            <h2>Key Milestones Through the Decades</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, maxWidth: 520, margin: "12px auto 0" }}>
              A century of stories, each decade leaving its indelible mark on the soul of LuxuryStay.
            </p>
          </div>

          {/* Timeline vertical line + items */}
          <div className="heritage-timeline-spine">
            {/* Center line */}
            <div className="timeline-center-line" />

            {timelineEvents.map((evt, i) => (
              <div
              key={i}
                className={`timeline-scroll-item timeline-item-${evt.side}`}
                style={{ "--accent": evt.color }}
              >
                {/* Year bubble (always center) */}
                <div className="timeline-year-bubble">
                  <span className="tl-year-text">{evt.year}</span>
                </div>

                {/* Content card */}
                <div className="timeline-content-card">
                  <div className="tl-era-pill">{evt.era}</div>
                  <div className="tl-icon-row">
                    <span className="tl-icon-badge">{evt.icon}</span>
                    <h3 className="tl-title">{evt.title}</h3>
                  </div>
                  <p className="tl-desc">{evt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Eco-Luxury Sustainability Commitment */}
        <section className="heritage-eco-banner">
          <div className="eco-banner-content">
            <div className="eco-icon-circle"><MdEco /></div>
            <div>
              <span className="section-kicker">STEWARDSHIP & RESPONSIBILITY</span>
              <h3>Certified 100% Carbon-Neutral Eco-Luxury</h3>
              <p>
                True luxury honors nature. LuxuryStay operates on 100% renewable solar micro-grids, utilizes zero single-use plastics,
                and funds the Grand Haven Coral Reef Restoration Foundation, protecting 150 marine acres surrounding our island sanctuary.
              </p>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default HeritagePage;
