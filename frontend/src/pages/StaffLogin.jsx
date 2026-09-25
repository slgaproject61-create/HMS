import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import {
  MdHotel,
  MdShield,
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdArrowBack,
  MdSecurity,
  MdVerified,
  MdAdminPanelSettings,
  MdPeople,
  MdMeetingRoom,
  MdBarChart,
} from "react-icons/md";

const FEATURES = [
  { icon: <MdAdminPanelSettings />, label: "Admin Control", desc: "Full system management" },
  { icon: <MdPeople />,            label: "Staff Roster",   desc: "Team & role oversight"  },
  { icon: <MdMeetingRoom />,       label: "Room Ops",       desc: "Live inventory control" },
  { icon: <MdBarChart />,          label: "Analytics",      desc: "Revenue & occupancy"    },
];

const StaffLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [time, setTime]                 = useState(new Date());

  // Live clock for the portal
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (d) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const fmtDate = (d) =>
    d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your work email and security password.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });
      if (data.user.role === "Customer") {
        setError("Access Denied: This portal is restricted to authorized hotel staff only.");
        setLoading(false);
        return;
      }
      login(data.user, data.token);
      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setLoading(false);
      if (!err.response) {
        setError("Unable to connect to server. Please ensure the backend is running and VITE_API_URL is set in Vercel.");
      } else {
        setError(err.response.data?.message || "Authentication failed. Invalid staff credentials.");
      }
    }
  };

  return (
    <div className="sl-wrapper">
      {/* Animated ambient orbs */}
      <div className="sl-orb sl-orb-1" />
      <div className="sl-orb sl-orb-2" />
      <div className="sl-orb sl-orb-3" />

      <div className="sl-layout">
        {/* ── LEFT PANEL ─────────────────────────── */}
        <div className="sl-left">
          <div className="sl-left-inner">
            {/* Brand */}
            <div className="sl-brand">
              <div className="sl-brand-icon">
                <MdHotel />
              </div>
              <div className="sl-brand-text">
                <span className="sl-brand-name">LuxuryStay</span>
                <span className="sl-brand-sub">Hospitality Group</span>
              </div>
            </div>

            {/* Live Clock */}
            <div className="sl-clock-block">
              <div className="sl-clock-time">{fmt(time)}</div>
              <div className="sl-clock-date">{fmtDate(time)}</div>
            </div>

            {/* Hero text */}
            <div className="sl-hero">
              <div className="sl-hero-kicker">STAFF &amp; OPERATIONS PORTAL</div>
              <h1 className="sl-hero-title">
                Hotel Management<br />
                <span className="sl-hero-gold">Command Center</span>
              </h1>
              <p className="sl-hero-desc">
                Authorized access for managers, receptionists, housekeeping,
                and administrative personnel. All sessions are monitored and encrypted.
              </p>
            </div>

            {/* Feature pills */}
            <div className="sl-features">
              {FEATURES.map((f) => (
                <div key={f.label} className="sl-feature-pill">
                  <span className="sl-feature-icon">{f.icon}</span>
                  <div>
                    <div className="sl-feature-label">{f.label}</div>
                    <div className="sl-feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Security badge */}
            <div className="sl-security-strip">
              <MdSecurity className="sl-sec-icon" />
              <span>256-bit SSL encrypted · All access logged · Zero-trust architecture</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (FORM) ──────────────────── */}
        <div className="sl-right">
          <div className="sl-card">
            {/* Card header */}
            <div className="sl-card-head">
              <div className="sl-shield-badge">
                <MdShield />
              </div>
              <h2 className="sl-card-title">Staff Authentication</h2>
              <p className="sl-card-subtitle">
                Enter your employee credentials to access the operations console.
              </p>
            </div>

            {/* Auth banner */}
            <div className="sl-auth-banner">
              <MdVerified className="sl-auth-banner-icon" />
              <div>
                <strong>Authorized Personnel Only</strong>
                <p>This portal is monitored 24/7 for security compliance.</p>
              </div>
            </div>

            {/* Error */}
            {error && <div className="sl-error">{error}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit} className="sl-form" noValidate>
              <div className="sl-field">
                <label className="sl-label" htmlFor="sl-email">Work Email Address</label>
                <div className="sl-input-wrap">
                  <MdEmail className="sl-input-icon" />
                  <input
                    id="sl-email"
                    type="email"
                    className="sl-input"
                    placeholder="employee@luxurystay.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="sl-field">
                <label className="sl-label" htmlFor="sl-password">Security Password</label>
                <div className="sl-input-wrap">
                  <MdLock className="sl-input-icon" />
                  <input
                    id="sl-password"
                    type={showPassword ? "text" : "password"}
                    className="sl-input"
                    placeholder="Enter your security password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="sl-eye"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex="-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
              </div>

              <button
                id="btn-staff-submit"
                type="submit"
                className={`sl-submit${loading ? " sl-submit-loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="sl-spinner" />
                    Verifying Credentials…
                  </>
                ) : (
                  <>
                    <MdAdminPanelSettings className="sl-btn-icon" />
                    Authenticate &amp; Enter Console
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="sl-card-footer">
              <p>
                New staff accounts must be provisioned by the{" "}
                <strong>System Administrator</strong> via the Admin Panel.
              </p>
            </div>
          </div>

          {/* Back link */}
          <Link to="/" className="sl-back-link">
            <MdArrowBack />
            Return to Public Hotel Site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
