import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MdHotel,
  MdEmail,
  MdLock,
  MdPerson,
  MdPhone,
  MdArrowBack,
  MdCheckCircle,
  MdStars,
  MdRoomService,
  MdRestaurant,
  MdSpa,
  MdVisibility,
  MdVisibilityOff,
  MdCardGiftcard,
  MdKingBed,
} from "react-icons/md";

const Login = ({ initialTab = "customer-login" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Tab state: "customer-login" | "customer-signup"
  const [activeTab, setActiveTab] = useState(
    location.state?.tab || initialTab || "customer-login"
  );

  // Guest Form states
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerConfirmPassword, setCustomerConfirmPassword] = useState("");
  const [customerPreferences, setCustomerPreferences] = useState("");

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const redirectMessage = location.state?.message || "";
  const redirectTo = location.state?.from || "/";
  const bookingRoom = location.state?.resumeBooking || location.state?.room || null;

  // Handle URL params for mode/tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("mode") === "signup" || location.pathname === "/signup") {
      setActiveTab("customer-signup");
    } else {
      setActiveTab("customer-login");
    }
  }, [location]);

  // Handle Customer / Guest Login
  const handleCustomerLogin = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!customerEmail || !customerPassword) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: customerEmail.trim(),
        password: customerPassword,
      });

      login(data.user, data.token);
      setLoading(false);
      setSuccessMsg(`Welcome back, ${data.user.name}!`);

      setTimeout(() => {
        if (bookingRoom) {
          navigate("/suites", { state: { resumeBooking: bookingRoom } });
        } else if (data.user.role !== "Customer") {
          navigate("/dashboard");
        } else {
          navigate(redirectTo === "/login" ? "/" : redirectTo);
        }
      }, 500);
    } catch (err) {
      setLoading(false);
      if (!err.response) {
        setError("Unable to connect to server. Please ensure the backend is running and VITE_API_URL is set in Vercel.");
      } else {
        setError(err.response.data?.message || "Invalid credentials. Please check your email and password.");
      }
    }
  };

  // Handle Guest Registration
  const handleCustomerSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!customerName || !customerEmail || !customerPassword) {
      setError("Please fill out all required fields.");
      return;
    }

    if (customerPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (customerPassword !== customerConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/register-guest", {
        name: customerName.trim(),
        email: customerEmail.trim(),
        password: customerPassword,
        phone: customerPhone.trim(),
        preferences: customerPreferences.trim() || "High Floor, Ocean View",
      });

      login(data.user, data.token);
      setLoading(false);
      setSuccessMsg("Welcome to LuxuryStay! Your VIP guest profile is now active.");

      setTimeout(() => {
        if (bookingRoom) {
          navigate("/suites", { state: { resumeBooking: bookingRoom } });
        } else {
          navigate(redirectTo === "/login" ? "/" : redirectTo);
        }
      }, 700);
    } catch (err) {
      setLoading(false);
      if (!err.response) {
        setError("Unable to connect to server. Please ensure the backend is running and VITE_API_URL is set in Vercel.");
      } else {
        setError(err.response.data?.message || "Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="guest-auth-page">
      <div className="guest-auth-container">
        {/* Left Hero Visual Column */}
        <div className="guest-auth-visual">
          <div
            className="guest-auth-visual-bg"
            style={{ backgroundImage: "url(/hotel-lobby.jpg)" }}
          >
            <div className="guest-auth-visual-overlay" />
          </div>

          <div className="guest-auth-visual-content">
            <div className="guest-visual-top">
              <Link to="/" className="guest-back-home-btn">
                <MdArrowBack /> Return to Hotel Overview
              </Link>
              <div className="guest-brand-badge">
                <div className="brand-logo-circle">
                  <MdHotel />
                </div>
                <div>
                  <h3>LuxuryStay</h3>
                  <span>5-Star Seaside Resort</span>
                </div>
              </div>
            </div>

            <div className="guest-visual-body">
              <span className="visual-gold-kicker">WHERE OPULENCE MEETS COMFORT</span>
              <h1>
                Bespoke Luxury, <br />
                Unforgettable Memories.
              </h1>
              <p>
                Join the LuxuryStay Guest Circle to unlock exclusive suite reservations,
                complimentary champagne arrivals, and customized concierge itineraries.
              </p>

              <div className="guest-privileges-grid">
                <div className="privilege-card">
                  <div className="privilege-icon"><MdCardGiftcard /></div>
                  <div>
                    <h4>250 Welcome Points</h4>
                    <p>Instant rewards credited on signup</p>
                  </div>
                </div>
                <div className="privilege-card">
                  <div className="privilege-icon"><MdKingBed /></div>
                  <div>
                    <h4>Guaranteed Late Checkout</h4>
                    <p>Relax until 4:00 PM for all VIP guests</p>
                  </div>
                </div>
                <div className="privilege-card">
                  <div className="privilege-icon"><MdRoomService /></div>
                  <div>
                    <h4>24/7 Dedicated Butler</h4>
                    <p>Bespoke concierge for every stay</p>
                  </div>
                </div>
                <div className="privilege-card">
                  <div className="privilege-icon"><MdRestaurant /></div>
                  <div>
                    <h4>Priority Michelin Dining</h4>
                    <p>Preferred tables at all three venues</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="guest-visual-quote">
              <div className="stars-row">★★★★★</div>
              <p>"An unrivaled hospitality experience. The staff anticipated our every wish and the ocean views were pure poetry."</p>
              <span className="quote-author">— Lord & Lady Abernathy, Verified Suite Guests</span>
            </div>
          </div>
        </div>

        {/* Right Form Card Column (White & Gold Luxury Theme) */}
        <div className="guest-auth-form-side">
          <div className="guest-auth-card">
            {redirectMessage && (
              <div className="auth-notice-banner">
                <MdCheckCircle className="notice-icon" />
                <div>
                  <strong>Reservation In Progress</strong>
                  <p>{redirectMessage}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="guest-alert guest-alert-error">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="guest-alert guest-alert-success">
                <MdCheckCircle /> {successMsg}
              </div>
            )}

            {/* Clean Guest Tabs: Only Sign In & Register */}
            <div className="guest-tabs-bar">
              <button
                type="button"
                className={`guest-tab ${activeTab === "customer-login" ? "active" : ""}`}
                onClick={() => { setActiveTab("customer-login"); setError(""); setSuccessMsg(""); }}
              >
                Guest Sign In
              </button>
              <button
                type="button"
                className={`guest-tab ${activeTab === "customer-signup" ? "active" : ""}`}
                onClick={() => { setActiveTab("customer-signup"); setError(""); setSuccessMsg(""); }}
              >
                Register New Guest
              </button>
            </div>

            {/* TAB 1: GUEST SIGN IN */}
            {activeTab === "customer-login" && (
              <div className="guest-form-panel">
                <div className="form-heading">
                  <h2>Welcome Back, Esteemed Guest</h2>
                  <p>Sign in to your guest account to manage reservations and access your privileges.</p>
                </div>

                <form onSubmit={handleCustomerLogin} className="guest-main-form">
                  <div className="form-group">
                    <label className="guest-label" htmlFor="cust-email">Email Address</label>
                    <div className="guest-input-wrap">
                      <MdEmail className="guest-input-icon" />
                      <input
                        id="cust-email"
                        type="email"
                        className="guest-input"
                        placeholder="e.g. yourname@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="guest-label-split">
                      <label className="guest-label" htmlFor="cust-pwd">Password</label>
                      <span className="guest-link-muted">Forgot password?</span>
                    </div>
                    <div className="guest-input-wrap">
                      <MdLock className="guest-input-icon" />
                      <input
                        id="cust-pwd"
                        type={showPassword ? "text" : "password"}
                        className="guest-input"
                        placeholder="Enter your password"
                        value={customerPassword}
                        onChange={(e) => setCustomerPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="guest-eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                      >
                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="btn-guest-login"
                    type="submit"
                    className="guest-btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Authenticating..." : "Sign In & Access Sanctuary"}
                  </button>

                  <div className="guest-switch-box">
                    Don't have a guest profile yet?{" "}
                    <button
                      type="button"
                      className="guest-switch-link"
                      onClick={() => { setActiveTab("customer-signup"); setError(""); setSuccessMsg(""); }}
                    >
                      Register Now
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: GUEST REGISTRATION */}
            {activeTab === "customer-signup" && (
              <div className="guest-form-panel">
                <div className="form-heading">
                  <h2>Create Your Guest Profile</h2>
                  <p>Register as a distinguished guest to book suites, earn loyalty points, and receive bespoke care.</p>
                </div>

                <form onSubmit={handleCustomerSignup} className="guest-main-form">
                  <div className="form-group">
                    <label className="guest-label" htmlFor="cust-name">Full Legal Name</label>
                    <div className="guest-input-wrap">
                      <MdPerson className="guest-input-icon" />
                      <input
                        id="cust-name"
                        type="text"
                        className="guest-input"
                        placeholder="e.g. Arthur Pendelton"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="guest-label" htmlFor="cust-reg-email">Email Address</label>
                      <div className="guest-input-wrap">
                        <MdEmail className="guest-input-icon" />
                        <input
                          id="cust-reg-email"
                          type="email"
                          className="guest-input"
                          placeholder="guest@example.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="guest-label" htmlFor="cust-reg-phone">Mobile Phone</label>
                      <div className="guest-input-wrap">
                        <MdPhone className="guest-input-icon" />
                        <input
                          id="cust-reg-phone"
                          type="tel"
                          className="guest-input"
                          placeholder="+1 (555) 000-0000"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="guest-label" htmlFor="cust-reg-pwd">Password</label>
                      <div className="guest-input-wrap">
                        <MdLock className="guest-input-icon" />
                        <input
                          id="cust-reg-pwd"
                          type={showPassword ? "text" : "password"}
                          className="guest-input"
                          placeholder="Min 6 characters"
                          value={customerPassword}
                          onChange={(e) => setCustomerPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="guest-label" htmlFor="cust-reg-confirm">Confirm Password</label>
                      <div className="guest-input-wrap">
                        <MdLock className="guest-input-icon" />
                        <input
                          id="cust-reg-confirm"
                          type={showPassword ? "text" : "password"}
                          className="guest-input"
                          placeholder="Re-type password"
                          value={customerConfirmPassword}
                          onChange={(e) => setCustomerConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="guest-label" htmlFor="cust-reg-pref">Stay Preferences (Optional)</label>
                    <input
                      id="cust-reg-pref"
                      type="text"
                      className="guest-input"
                      placeholder="e.g. High floor, hypoallergenic pillows, quiet botanical wing"
                      value={customerPreferences}
                      onChange={(e) => setCustomerPreferences(e.target.value)}
                    />
                  </div>

                  <div className="guest-terms-note">
                    By registering, you accept LuxuryStay’s <span>Guest Privileges Charter</span> and <span>Privacy Policy</span>.
                  </div>

                  <button
                    id="btn-guest-register"
                    type="submit"
                    className="guest-btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Creating Profile..." : "Complete Registration & Sign In"}
                  </button>

                  <div className="guest-switch-box">
                    Already registered as a guest?{" "}
                    <button
                      type="button"
                      className="guest-switch-link"
                      onClick={() => { setActiveTab("customer-login"); setError(""); setSuccessMsg(""); }}
                    >
                      Sign In here
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
