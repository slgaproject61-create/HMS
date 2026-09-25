import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MdHotel,
  MdLogout,
  MdBookOnline,
  MdMenu,
  MdClose,
  MdStars,
} from "react-icons/md";

const LandingNavbar = ({ showBookingsModal, setShowBookingsModal }) => {
  const location = useLocation();
  const { user, logout, isCustomer, isLoggedIn, bookings } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="landing-navbar">
      <div className="landing-nav-container">
        {/* Brand Logo */}
        <Link to="/" className="landing-nav-brand">
          <div className="landing-nav-logo-icon">
            <MdHotel />
          </div>
          <div className="landing-nav-brand-text">
            <span className="brand-name">LuxuryStay</span>
            <span className="brand-sub">5-STAR RESORT & RESIDENCES</span>
          </div>
        </Link>

        {/* Desktop Links: STRICTLY ONE LINE */}
        <div className="landing-nav-links">
          <Link
            to="/suites"
            className={`nav-link-item ${isActive("/suites") ? "active" : ""}`}
          >
            Suites & Villas
          </Link>
          <Link
            to="/dining"
            className={`nav-link-item ${isActive("/dining") ? "active" : ""}`}
          >
            Dining & Bars
          </Link>
          <Link
            to="/spa"
            className={`nav-link-item ${isActive("/spa") ? "active" : ""}`}
          >
            Lotus Spa
          </Link>
          <Link
            to="/experiences"
            className={`nav-link-item ${isActive("/experiences") ? "active" : ""}`}
          >
            Experiences
          </Link>
          <Link
            to="/heritage"
            className={`nav-link-item ${isActive("/heritage") ? "active" : ""}`}
          >
            Our Heritage
          </Link>
          <Link
            to="/contact"
            className={`nav-link-item ${isActive("/contact") ? "active" : ""}`}
          >
            Contact & Concierge
          </Link>
        </div>

        {/* User Auth Actions (Strictly One Line & No Staff Link) */}
        <div className="landing-nav-actions">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="nav-btn-signin">
                Guest Sign In
              </Link>
              <Link to="/signup" className="nav-btn-signup">
                Register
              </Link>
              <Link to="/suites" className="nav-btn-primary">
                Book a Suite
              </Link>
            </>
          ) : isCustomer ? (
            <div className="nav-user-container">
              {setShowBookingsModal && (
                <button
                  type="button"
                  className="nav-bookings-btn"
                  onClick={() => setShowBookingsModal(true)}
                >
                  <MdBookOnline /> My Reservations
                  {bookings && bookings.length > 0 && (
                    <span className="nav-bookings-badge">{bookings.length}</span>
                  )}
                </button>
              )}
              <div className="nav-user-badge">
                <span className="nav-user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : "G"}
                </span>
                <div className="nav-user-info">
                  <strong>{user.name}</strong>
                  <span className="nav-user-role">
                    <MdStars style={{ verticalAlign: "middle", color: "var(--gold)" }} /> VIP Guest
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="nav-logout-btn"
                onClick={logout}
                title="Sign Out"
              >
                <MdLogout />
              </button>
            </div>
          ) : (
            /* If staff happens to be logged in from their session */
            <div className="nav-user-container">
              <Link to="/dashboard" className="nav-btn-primary">
                Dashboard ({user?.role})
              </Link>
              <button
                type="button"
                className="nav-logout-btn"
                onClick={logout}
                title="Sign Out"
              >
                <MdLogout />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="landing-mobile-toggle"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <MdClose /> : <MdMenu />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="landing-mobile-drawer">
          <div className="mobile-drawer-links">
            <Link to="/suites" onClick={() => setMobileOpen(false)}>Suites & Villas</Link>
            <Link to="/dining" onClick={() => setMobileOpen(false)}>Dining & Bars</Link>
            <Link to="/spa" onClick={() => setMobileOpen(false)}>Lotus Spa & Wellness</Link>
            <Link to="/experiences" onClick={() => setMobileOpen(false)}>Experiences</Link>
            <Link to="/heritage" onClick={() => setMobileOpen(false)}>Our Heritage</Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)}>Contact & Concierge</Link>
            <hr className="mobile-divider" />
            {!isLoggedIn ? (
              <div className="mobile-auth-actions">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="mobile-btn-login">Guest Sign In</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="mobile-btn-register">Register Account</Link>
              </div>
            ) : (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="mobile-btn-logout">
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
