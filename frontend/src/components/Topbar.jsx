import React, { useState } from "react";
import { MdMenu, MdNotifications, MdSearch, MdSettings, MdFullscreen } from "react-icons/md";

const pageTitles = {
  "/dashboard": ["Dashboard", "Welcome back — here's your hotel at a glance"],
  "/users": ["User Management", "Manage staff accounts and access levels"],
  "/guests": ["Guest Profiles", "View and manage all registered guests"],
  "/rooms": ["Room Management", "Monitor room inventory, status and pricing"],
  "/reservations": ["Reservations", "Manage bookings and reservation details"],
  "/checkinout": ["Check-in / Check-out", "Handle guest arrivals and departures"],
  "/billing": ["Billing & Invoices", "Generate and manage guest billing"],
  "/housekeeping": ["Housekeeping", "Schedule and track cleaning tasks"],
  "/maintenance": ["Maintenance", "Track and resolve maintenance requests"],
  "/analytics": ["Reports & Analytics", "Insights, occupancy data, and revenue trends"],
  "/feedback": ["Guest Feedback", "View ratings and guest satisfaction"],
  "/services": ["Guest Services", "Manage additional service requests"],
  "/settings": ["Settings", "System configuration and preferences"],
};

const notifications = [
  { id: 1, color: "var(--warning)", text: <><strong>Room 204</strong> housekeeping overdue by 45 minutes</>, time: "5m ago" },
  { id: 2, color: "var(--success)", text: <><strong>John Smith</strong> checked in to Room 512</>, time: "12m ago" },
  { id: 3, color: "var(--danger)", text: <><strong>Maintenance #47</strong> escalated — HVAC failure in Room 308</>, time: "30m ago" },
  { id: 4, color: "var(--gold)", text: <><strong>New reservation</strong> for tonight — Grand Suite</>, time: "1h ago" },
  { id: 5, color: "var(--info)", text: <><strong>Invoice #1024</strong> sent to guest email</>, time: "2h ago" },
];

const Topbar = ({ collapsed, setCollapsed }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const path = window.location.pathname;
  const [title, subtitle] = pageTitles[path] || ["HMS", "Hotel Management System"];

  const now = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-toggle" onClick={() => setCollapsed((c) => !c)}>
          <MdMenu />
        </button>
        <div className="topbar-breadcrumb">
          <h1>{title}</h1>
          <span>{subtitle}</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-date">{now}</div>

        <button className="topbar-btn" title="Notifications" onClick={() => setShowNotifs((s) => !s)}>
          <MdNotifications />
          <span className="notif-badge" />
        </button>

        {showNotifs && (
          <div className="notifications-panel">
            <div className="notif-header">
              <span className="notif-title">Notifications</span>
              <button
                style={{ background: "none", border: "none", color: "var(--gold)", fontSize: 12, cursor: "pointer" }}
                onClick={() => setShowNotifs(false)}
              >
                Clear all
              </button>
            </div>
            {notifications.map((n) => (
              <div className="notif-item" key={n.id}>
                <span className="notif-dot" style={{ background: n.color }} />
                <div>
                  <div className="notif-text">{n.text}</div>
                  <div className="notif-time">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
