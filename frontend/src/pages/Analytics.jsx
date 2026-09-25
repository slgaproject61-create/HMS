import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import api from "../api";

const PIE_COLORS = {
  Available: "#10b981",
  Occupied: "#ef4444",
  Cleaning: "#f59e0b",
  Maintenance: "#3b82f6",
  "Out of Service": "#6b7280",
};

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [occupancy, setOccupancy] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [roomStatus, setRoomStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, occRes, revRes, rsRes] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/analytics/occupancy"),
        api.get("/analytics/revenue"),
        api.get("/analytics/room-status"),
      ]);
      setSummary(sumRes.data);
      setOccupancy(occRes.data);
      setRevenue(revRes.data);
      setRoomStatus(rsRes.data);
    } catch (err) {
      console.error("Analytics fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const kpis = summary
    ? [
        { label: "Occupancy Rate", value: `${summary.occupancyRate}%`, sub: `${summary.occupiedRooms} / ${summary.totalRooms} rooms` },
        { label: "Monthly Revenue", value: `$${summary.monthlyRevenue.toLocaleString()}`, sub: "This month" },
        { label: "Active Reservations", value: summary.activeReservations, sub: `${summary.totalReservations} total` },
        { label: "Guest Satisfaction", value: summary.avgRating ? `${summary.avgRating} ⭐` : "No data", sub: "Avg overall rating" },
      ]
    : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="page-subtitle">Live hotel performance metrics and revenue insights</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading analytics…</p></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {kpis.map((k) => (
              <div className="stat-card" key={k.label}>
                <div className="stat-card-value">{k.value}</div>
                <div className="stat-card-label">{k.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {/* Occupancy Trend */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Occupancy Trend</div>
                  <div className="card-subtitle">Last 7 days</div>
                </div>
              </div>
              {occupancy.length === 0 ? (
                <div className="empty-state" style={{ padding: 30 }}><p>No data yet</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={occupancy} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="occ" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#888" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }} />
                    <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }} labelStyle={{ color: "#C9A84C" }} />
                    <Area type="monotone" dataKey="occupied" name="Occupied" stroke="#C9A84C" fill="url(#occ)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Revenue Chart */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Monthly Revenue</div>
                  <div className="card-subtitle">Last 6 months</div>
                </div>
              </div>
              {revenue.every((r) => r.revenue === 0) ? (
                <div className="empty-state" style={{ padding: 30 }}><p>No revenue data yet — create paid invoices</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#888" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }} />
                    <Tooltip
                      contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }}
                      formatter={(val) => [`$${val.toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
            {/* Room Status Pie */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Room Status</div>
              </div>
              {roomStatus.every((r) => r.count === 0) ? (
                <div className="empty-state" style={{ padding: 30 }}><p>Add rooms to see breakdown</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={roomStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75}
                      label={({ status, count }) => count > 0 ? `${status}: ${count}` : ""}>
                      {roomStatus.map((entry) => (
                        <Cell key={entry.status} fill={PIE_COLORS[entry.status] || "#888"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* KPI Table */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Detailed Metrics</div>
              </div>
              {summary && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Total Rooms", value: summary.totalRooms },
                    { label: "Available Rooms", value: summary.availableRooms },
                    { label: "Occupied Rooms", value: summary.occupiedRooms },
                    { label: "Total Guests in DB", value: summary.totalGuests },
                    { label: "Total Reservations", value: summary.totalReservations },
                    { label: "Total Revenue (All Time)", value: `$${summary.totalRevenue.toLocaleString()}` },
                    { label: "Average Guest Rating", value: summary.avgRating ? `${summary.avgRating} / 5` : "No reviews yet" },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.label}</span>
                      <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 16, color: "var(--gold)" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
