import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MdDashboard, MdPeople, MdPerson, MdMeetingRoom, MdEventNote,
  MdReceipt, MdBuild, MdBarChart, MdStarRate, MdRoomService,
  MdSettings, MdHotel, MdChevronLeft, MdChevronRight,
} from "react-icons/md";

const navSections = [
  {
    label: "Main",
    items: [
      { to: "/dashboard", icon: <MdDashboard />, label: "Dashboard" },
    ],
  },
  {
    label: "People",
    items: [
      { to: "/users", icon: <MdPeople />, label: "User Management" },
      { to: "/guests", icon: <MdPerson />, label: "Guest Profiles" },
    ],
  },
  {
    label: "Rooms & Bookings",
    items: [
      { to: "/rooms", icon: <MdMeetingRoom />, label: "Room Management" },
      { to: "/reservations", icon: <MdEventNote />, label: "Reservations" },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/billing", icon: <MdReceipt />, label: "Billing & Invoices" },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/operations", icon: <MdBuild />, label: "Housekeeping & Maintenance" },
      { to: "/services", icon: <MdRoomService />, label: "Guest Services" },
    ],
  },
  {
    label: "Insights",
    items: [
      { to: "/analytics", icon: <MdBarChart />, label: "Reports & Analytics" },
      { to: "/feedback", icon: <MdStarRate />, label: "Guest Feedback" },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/settings", icon: <MdSettings />, label: "Settings" },
    ],
  },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U";

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <MdHotel />
        </div>
        <div className="sidebar-logo-text">
          <h2>LuxuryStay</h2>
          <span>HMS Portal</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item${isActive ? " active" : ""}`
                }
                title={collapsed ? item.label : ""}
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span className="nav-item-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={handleLogout} title="Logout">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="name">{user?.name || "Staff Member"}</div>
            <div className="role">{user?.role || "Staff"} · Logout</div>
          </div>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          position: "absolute",
          bottom: 90,
          right: -14,
          width: 28,
          height: 28,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--text-secondary)",
          fontSize: 16,
          transition: "var(--transition)",
          zIndex: 101,
        }}
      >
        {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
      </button>
    </aside>
  );
};

export default Sidebar;
