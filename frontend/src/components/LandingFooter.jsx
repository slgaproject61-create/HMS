import React from "react";
import { Link } from "react-router-dom";
import {
  MdHotel,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdStars,
} from "react-icons/md";

const LandingFooter = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-top">
        {/* Brand Column */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div className="footer-logo-icon">
              <MdHotel />
            </div>
            <div className="footer-logo-text">
              <span className="footer-brand-name">LuxuryStay</span>
              <span className="footer-brand-sub">HOSPITALITY · 5-STAR RESORT</span>
            </div>
          </Link>
          <p className="footer-desc">
            A prestigious seaside sanctuary dedicated to the timeless art of hospitality,
            bespoke comfort, and extraordinary memories since 1928.
          </p>
          <div className="footer-contact-item">
            <MdLocationOn /> 1000 Oceanview Boulevard, Grand Haven Island
          </div>
          <div className="footer-contact-item">
            <MdPhone /> +1 (800) 849-LUXURY · 24/7 Global Concierge
          </div>
          <div className="footer-contact-item">
            <MdEmail /> concierge@luxurystay.com
          </div>
        </div>

        {/* Accommodations */}
        <div className="footer-links-col">
          <h4>Accommodations</h4>
          <Link to="/suites">Presidential Sky Suite</Link>
          <Link to="/suites">Royal Penthouse Villa</Link>
          <Link to="/suites">Executive Ocean Suite</Link>
          <Link to="/suites">Deluxe Garden Sanctuary</Link>
          <Link to="/suites">Heritage Imperial Suite</Link>
          <Link to="/suites" className="footer-explore-all">Explore All Suites →</Link>
        </div>

        {/* Experiences & Dining */}
        <div className="footer-links-col">
          <h4>Gastronomy & Spa</h4>
          <Link to="/dining">L'Étoile Royale (3 Stars)</Link>
          <Link to="/dining">Aura Oceanfront Grill</Link>
          <Link to="/dining">The Velvet & Amber Bar</Link>
          <Link to="/spa">Lotus Hydrotherapy Sanctuary</Link>
          <Link to="/experiences">Yacht & Aerial Charters</Link>
          <Link to="/experiences">Beachfront Cabana Dinners</Link>
        </div>

        {/* Heritage & Guest Services */}
        <div className="footer-links-col">
          <h4>Guest Sanctuary</h4>
          <Link to="/heritage">Our 1928 Heritage</Link>
          <Link to="/heritage">Awards & Accolades</Link>
          <Link to="/contact">Concierge & Location</Link>
          <Link to="/contact">Hotel Policies & FAQ</Link>
          <Link to="/login">Guest Sign In</Link>
          <Link to="/signup">Register Guest Profile</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-copy">
          <p>© {new Date().getFullYear()} LuxuryStay Hospitality Group. All rights reserved. 5-Star Ultra-Luxury Certified.</p>
        </div>
        <div className="footer-accolades-inline">
          <span><MdStars style={{ color: "var(--gold)" }} /> Forbes 5-Star Hotel</span>
          <span>•</span>
          <span>Michelin 3 Keys</span>
          <span>•</span>
          <span>Condé Nast Gold List</span>
          <span>•</span>
          <span>The Leading Hotels of the World</span>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
