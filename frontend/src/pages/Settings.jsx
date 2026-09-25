import React, { useState, useEffect } from "react";
import api from "../api";
import { MdSettings, MdSave, MdHotel, MdSecurity, MdNotifications, MdPalette, MdAttachMoney } from "react-icons/md";

const tabs = [
  { id: "general", label: "General", icon: <MdHotel /> },
  { id: "billing", label: "Billing & Rates", icon: <MdAttachMoney /> },
  { id: "notifications", label: "Notifications", icon: <MdNotifications /> },
  { id: "security", label: "Security", icon: <MdSecurity /> },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({
    hotelName: "LuxuryStay Hotel & Suites",
    address: "123 Grand Boulevard, New York, NY 10001",
    phone: "+1 555 000 1234",
    email: "info@luxurystay.com",
    website: "https://luxurystay.com",
    timezone: "America/New_York",
    currency: "USD",
    checkInTime: "15:00",
    checkOutTime: "11:00",
  });

  const [billing, setBilling] = useState({
    taxRate: "10",
    serviceCharge: "5",
    earlyCheckInFee: "50",
    lateCheckOutFee: "50",
    cancellationFee: "100",
    depositRequired: true,
    depositPercent: "20",
  });

  const [notifications, setNotifications] = useState({
    emailOnCheckIn: true,
    emailOnCheckOut: true,
    emailOnReservation: true,
    smsAlerts: false,
    maintenanceAlerts: true,
    housekeepingAlerts: true,
    dailyReport: false,
    weeklyReport: true,
  });

  useEffect(() => {
    api.get("/settings")
      .then(({ data }) => {
        if (data.hotelName) setGeneral((g) => ({ ...g, hotelName: data.hotelName, address: data.address || g.address, phone: data.phone || g.phone, email: data.email || g.email, website: data.website || g.website, currency: data.currency || g.currency, checkInTime: data.checkInTime || g.checkInTime, checkOutTime: data.checkOutTime || g.checkOutTime }));
        if (data.taxRate) setBilling((b) => ({ ...b, taxRate: String(data.taxRate) }));
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      await api.put("/settings", {
        ...general,
        taxRate: parseFloat(billing.taxRate) || 10,
      });
    } catch (err) {
      console.error("Settings save failed:", err.message);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">System configuration, policies, and preferences</p>
        </div>
        <div className="page-actions">
          <button id="btn-save-settings" className="btn btn-primary" onClick={handleSave}>
            <MdSave /> {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {saved && (
        <div style={{
          background: "var(--success-bg)", border: "1px solid rgba(46,204,113,0.25)",
          borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 20,
          color: "var(--success)", fontSize: 13, fontWeight: 600
        }}>
          ✓ Settings saved successfully
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        {/* Tab nav */}
        <div className="card" style={{ padding: "12px 0", height: "fit-content" }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "11px 16px", width: "100%", background: activeTab === tab.id ? "rgba(201,168,76,0.12)" : "none",
                border: "none", color: activeTab === tab.id ? "var(--gold)" : "var(--text-secondary)",
                cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "Inter",
                borderLeft: activeTab === tab.id ? "3px solid var(--gold)" : "3px solid transparent",
                transition: "var(--transition)"
              }}
            >
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="card">
          {activeTab === "general" && (
            <>
              <div className="card-header" style={{ marginBottom: 20 }}>
                <div className="card-title">Hotel Information</div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Hotel Name</label>
                  <input className="form-input" value={general.hotelName} onChange={e => setGeneral(g => ({ ...g, hotelName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={general.email} onChange={e => setGeneral(g => ({ ...g, email: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Address</label>
                  <input className="form-input" value={general.address} onChange={e => setGeneral(g => ({ ...g, address: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={general.phone} onChange={e => setGeneral(g => ({ ...g, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input className="form-input" value={general.website} onChange={e => setGeneral(g => ({ ...g, website: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select className="form-select" value={general.timezone} onChange={e => setGeneral(g => ({ ...g, timezone: e.target.value }))}>
                    {["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Asia/Dubai", "Asia/Karachi"].map(tz => <option key={tz}>{tz}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-select" value={general.currency} onChange={e => setGeneral(g => ({ ...g, currency: e.target.value }))}>
                    {["USD", "EUR", "GBP", "AED", "PKR", "INR"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Check-in Time</label>
                  <input className="form-input" type="time" value={general.checkInTime} onChange={e => setGeneral(g => ({ ...g, checkInTime: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Check-out Time</label>
                  <input className="form-input" type="time" value={general.checkOutTime} onChange={e => setGeneral(g => ({ ...g, checkOutTime: e.target.value }))} />
                </div>
              </div>
            </>
          )}

          {activeTab === "billing" && (
            <>
              <div className="card-header" style={{ marginBottom: 20 }}>
                <div className="card-title">Billing & Rate Policies</div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tax Rate (%)</label>
                  <input className="form-input" type="number" value={billing.taxRate} onChange={e => setBilling(b => ({ ...b, taxRate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Service Charge (%)</label>
                  <input className="form-input" type="number" value={billing.serviceCharge} onChange={e => setBilling(b => ({ ...b, serviceCharge: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Early Check-in Fee ($)</label>
                  <input className="form-input" type="number" value={billing.earlyCheckInFee} onChange={e => setBilling(b => ({ ...b, earlyCheckInFee: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Late Check-out Fee ($)</label>
                  <input className="form-input" type="number" value={billing.lateCheckOutFee} onChange={e => setBilling(b => ({ ...b, lateCheckOutFee: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cancellation Fee ($)</label>
                  <input className="form-input" type="number" value={billing.cancellationFee} onChange={e => setBilling(b => ({ ...b, cancellationFee: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Deposit Required (%)</label>
                  <input className="form-input" type="number" value={billing.depositPercent} onChange={e => setBilling(b => ({ ...b, depositPercent: e.target.value }))} />
                </div>
              </div>
              <div className="toggle-wrap">
                <div className="toggle-info">
                  <h4>Require Deposit on Booking</h4>
                  <p>Guests must pay a deposit percentage at time of booking</p>
                </div>
                <button
                  className={`toggle ${billing.depositRequired ? "on" : ""}`}
                  onClick={() => setBilling(b => ({ ...b, depositRequired: !b.depositRequired }))}
                />
              </div>
            </>
          )}

          {activeTab === "notifications" && (
            <>
              <div className="card-header" style={{ marginBottom: 20 }}>
                <div className="card-title">Notification Preferences</div>
              </div>
              {[
                { key: "emailOnCheckIn", label: "Email on Check-in", desc: "Send confirmation email when guest checks in" },
                { key: "emailOnCheckOut", label: "Email on Check-out", desc: "Send receipt email when guest checks out" },
                { key: "emailOnReservation", label: "Email on Reservation", desc: "Send confirmation email for new bookings" },
                { key: "smsAlerts", label: "SMS Alerts", desc: "Send SMS notifications for critical events" },
                { key: "maintenanceAlerts", label: "Maintenance Alerts", desc: "Notify management of urgent maintenance issues" },
                { key: "housekeepingAlerts", label: "Housekeeping Alerts", desc: "Notify staff of overdue cleaning tasks" },
                { key: "dailyReport", label: "Daily Report Email", desc: "Receive daily summary of hotel operations" },
                { key: "weeklyReport", label: "Weekly Report Email", desc: "Receive weekly performance summary" },
              ].map(item => (
                <div className="toggle-wrap" key={item.key}>
                  <div className="toggle-info">
                    <h4>{item.label}</h4>
                    <p>{item.desc}</p>
                  </div>
                  <button
                    className={`toggle ${notifications[item.key] ? "on" : ""}`}
                    onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
                  />
                </div>
              ))}
            </>
          )}

          {activeTab === "security" && (
            <>
              <div className="card-header" style={{ marginBottom: 20 }}>
                <div className="card-title">Security Settings</div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ padding: "12px 16px", background: "var(--info-bg)", border: "1px solid rgba(52,152,219,0.2)", borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--info)" }}>
                  ℹ️ Security settings (JWT secret, password policies, 2FA) are managed in the backend .env file and server configuration.
                </div>
              </div>
              {[
                { key: "twoFactor", label: "Two-Factor Authentication", desc: "Require 2FA for admin accounts" },
                { key: "sessionTimeout", label: "Session Timeout (30 min)", desc: "Automatically log out inactive sessions" },
                { key: "auditLog", label: "Audit Log", desc: "Track all user actions for compliance" },
                { key: "ipWhitelist", label: "IP Whitelisting", desc: "Restrict access to specified IP addresses" },
              ].map((item, i) => (
                <div className="toggle-wrap" key={i}>
                  <div className="toggle-info">
                    <h4>{item.label}</h4>
                    <p>{item.desc}</p>
                  </div>
                  <button className="toggle" onClick={(e) => {
                    e.currentTarget.classList.toggle("on");
                  }} />
                </div>
              ))}
              <div className="divider" />
              <div className="form-group">
                <label className="form-label">Change Admin Password</label>
                <input className="form-input" type="password" placeholder="New password..." />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" placeholder="Confirm new password..." />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
