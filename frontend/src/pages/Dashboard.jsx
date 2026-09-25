import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdMeetingRoom, MdPeople, MdEventNote, MdTrendingUp,
  MdCleaningServices, MdBuild,
} from "react-icons/md";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "../api";

const quickLinks = [
  { label: "New Reservation", path: "/reservations", icon: <MdEventNote /> },
  { label: "Check-in Guest", path: "/checkinout", icon: <MdPeople /> },
  { label: "Housekeeping", path: "/housekeeping", icon: <MdCleaningServices /> },
  { label: "Maintenance", path: "/maintenance", icon: <MdBuild /> },
];

const PIE_COLORS = {
  Available: "#10b981",
  Occupied: "#ef4444",
  Cleaning: "#f59e0b",
  Maintenance: "#3b82f6",
  "Out of Service": "#6b7280",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [occupancy, setOccupancy] = useState([]);
  const [roomStatus, setRoomStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [sumRes, occRes, rsRes] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/analytics/occupancy"),
        api.get("/analytics/room-status"),
      ]);
      setSummary(sumRes.data);
      setOccupancy(occRes.data);
      setRoomStatus(rsRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statCards = [
    { icon: <MdMeetingRoom />, value: loading ? "—" : summary?.totalRooms ?? "—", label: "Total Rooms" },
    { icon: <MdPeople />, value: loading ? "—" : summary?.totalGuests ?? "—", label: "Total Guests" },
    { icon: <MdEventNote />, value: loading ? "—" : summary?.activeReservations ?? "—", label: "Active Reservations" },
    {
      icon: <MdTrendingUp />,
      value: loading ? "—" : summary ? `$${summary.monthlyRevenue.toLocaleString()}` : "—",
      label: "Monthly Revenue",
    },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-card-icon" style={{ background: "rgba(255,255,255,0.05)", color: "var(--gold)" }}>
              {card.icon}
            </div>
            <div className="stat-card-value">{card.value}</div>
            <div className="stat-card-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 20 }}>
        {/* Occupancy Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Occupancy Overview</div>
              <div className="card-subtitle">Last 7 days room occupancy trend</div>
            </div>
          </div>
          {occupancy.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <div className="empty-state-icon">📊</div>
              <h3>No Occupancy Data</h3>
              <p>Add rooms and reservations to see occupancy trends</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={occupancy} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#888" }} />
                <YAxis tick={{ fontSize: 11, fill: "#888" }} />
                <Tooltip
                  contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }}
                  labelStyle={{ color: "#C9A84C" }}
                />
                <Area type="monotone" dataKey="occupied" name="Occupied Rooms" stroke="#C9A84C" fill="url(#occGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Quick Actions</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {quickLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", background: "var(--bg-glass)",
                  border: "1px solid var(--border-solid)", borderRadius: "var(--radius-md)",
                  cursor: "pointer", transition: "var(--transition)",
                  color: "var(--text-primary)", fontSize: 13, fontWeight: 500,
                  fontFamily: "Inter, sans-serif", width: "100%", textAlign: "left",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-solid)"; e.currentTarget.style.color = "var(--text-primary)"; }}
              >
                <span style={{ fontSize: 20, color: "var(--gold)" }}>{link.icon}</span>
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Room Status Pie */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Room Status Breakdown</div>
          </div>
          {roomStatus.every((r) => r.count === 0) ? (
            <div className="empty-state" style={{ padding: "30px 20px" }}>
              <div className="empty-state-icon">🏨</div>
              <h3>No Room Data</h3>
              <p>Add rooms via Room Management to see status breakdown</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={roomStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} label={({ status, count }) => count > 0 ? `${status}: ${count}` : ""}>
                  {roomStatus.map((entry) => (
                    <Cell key={entry.status} fill={PIE_COLORS[entry.status] || "#888"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Live Stats */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Live Hotel Stats</div>
          </div>
          {loading ? (
            <div className="empty-state" style={{ padding: "30px 20px" }}>
              <p>Loading stats…</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Occupancy Rate", value: `${summary?.occupancyRate ?? 0}%` },
                { label: "Available Rooms", value: summary?.availableRooms ?? 0 },
                { label: "Total Reservations", value: summary?.totalReservations ?? 0 },
                { label: "Average Rating", value: summary?.avgRating ? `⭐ ${summary.avgRating}` : "No reviews yet" },
                { label: "Total Revenue", value: `$${(summary?.totalRevenue ?? 0).toLocaleString()}` },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.label}</span>
                  <span style={{ fontFamily: "Outfit", fontWeight: 700, color: "var(--gold)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
