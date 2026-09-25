import React, { useState, useEffect, useCallback } from "react";
import {
  MdCleaningServices, MdBuild, MdSearch, MdRefresh,
} from "react-icons/md";
import api from "../api";

/* ── Housekeeping constants ── */
const hkStatusOptions = ["Pending", "In Progress", "Completed", "Skipped"];
const hkStatusBadge = { Pending: "badge-warning", "In Progress": "badge-info", Completed: "badge-success", Skipped: "badge-danger" };
const hkPriorityBadge = { Low: "badge-info", Normal: "badge-success", High: "badge-warning", Urgent: "badge-danger" };

/* ── Maintenance constants ── */
const mtStatusOptions = ["Open", "In Progress", "On Hold", "Resolved", "Closed"];
const mtStatusBadge = { Open: "badge-danger", "In Progress": "badge-warning", "On Hold": "badge-info", Resolved: "badge-success", Closed: "badge-info" };
const mtPriorityBadge = { Low: "badge-info", Normal: "badge-success", High: "badge-warning", Critical: "badge-danger" };

const Operations = () => {
  const [activeTab, setActiveTab] = useState("housekeeping");

  /* ── Housekeeping state ── */
  const [hkTasks, setHkTasks] = useState([]);
  const [hkLoading, setHkLoading] = useState(true);
  const [hkSearch, setHkSearch] = useState("");
  const [hkFilter, setHkFilter] = useState("All");

  /* ── Maintenance state ── */
  const [mtReqs, setMtReqs] = useState([]);
  const [mtLoading, setMtLoading] = useState(true);
  const [mtSearch, setMtSearch] = useState("");
  const [mtFilter, setMtFilter] = useState("All");

  /* ── Fetch housekeeping ── */
  const fetchHK = useCallback(async () => {
    try {
      setHkLoading(true);
      const params = {};
      if (hkFilter !== "All") params.status = hkFilter;
      if (hkSearch) params.search = hkSearch;
      const { data } = await api.get("/housekeeping", { params });
      setHkTasks(data.data || []);
    } catch (err) {
      console.error("Failed to fetch housekeeping:", err.message);
    } finally {
      setHkLoading(false);
    }
  }, [hkFilter, hkSearch]);

  /* ── Fetch maintenance ── */
  const fetchMT = useCallback(async () => {
    try {
      setMtLoading(true);
      const params = {};
      if (mtFilter !== "All") params.status = mtFilter;
      if (mtSearch) params.search = mtSearch;
      const { data } = await api.get("/maintenance", { params });
      setMtReqs(data.data || []);
    } catch (err) {
      console.error("Failed to fetch maintenance:", err.message);
    } finally {
      setMtLoading(false);
    }
  }, [mtFilter, mtSearch]);

  useEffect(() => {
    const t = setTimeout(fetchHK, 300);
    return () => clearTimeout(t);
  }, [fetchHK]);

  useEffect(() => {
    const t = setTimeout(fetchMT, 300);
    return () => clearTimeout(t);
  }, [fetchMT]);

  /* ── Status change handlers ── */
  const handleHkStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/housekeeping/${id}`, { status });
      setHkTasks((ts) => ts.map((t) => (t._id === id ? data : t)));
    } catch { alert("Status update failed"); }
  };

  const handleMtStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/maintenance/${id}`, { status });
      setMtReqs((rs) => rs.map((r) => (r._id === id ? data : r)));
    } catch { alert("Status update failed"); }
  };

  /* ── Summary counts ── */
  const hkCounts = { Pending: 0, "In Progress": 0, Completed: 0 };
  hkTasks.forEach((t) => { if (hkCounts[t.status] !== undefined) hkCounts[t.status]++; });

  const mtCounts = { Open: 0, "In Progress": 0, Resolved: 0 };
  mtReqs.forEach((r) => {
    if (r.status === "Open") mtCounts.Open++;
    else if (r.status === "In Progress") mtCounts["In Progress"]++;
    else if (r.status === "Resolved") mtCounts.Resolved++;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Housekeeping & Maintenance</h2>
          <p className="page-subtitle">Monitor room cleaning schedules and maintenance requests</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-icon" onClick={activeTab === "housekeeping" ? fetchHK : fetchMT} title="Refresh">
            <MdRefresh />
          </button>
        </div>
      </div>

      {/* Tab Toggle */}
      <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 4, marginBottom: 24, width: "fit-content" }}>
        <button
          className={`btn ${activeTab === "housekeeping" ? "btn-primary" : "btn-secondary"}`}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
          onClick={() => setActiveTab("housekeeping")}
        >
          <MdCleaningServices /> Housekeeping
        </button>
        <button
          className={`btn ${activeTab === "maintenance" ? "btn-primary" : "btn-secondary"}`}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
          onClick={() => setActiveTab("maintenance")}
        >
          <MdBuild /> Maintenance
        </button>
      </div>

      {/* ────────────────── HOUSEKEEPING TAB ────────────────── */}
      {activeTab === "housekeeping" && (
        <div>
          {/* Summary pills */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {Object.entries(hkCounts).map(([s, c]) => (
              <div key={s} className="card" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                <span className={`badge ${hkStatusBadge[s]}`}>{s}</span>
                <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 20 }}>{c}</span>
              </div>
            ))}
          </div>

          <div className="search-bar">
            <div className="search-input-wrap">
              <MdSearch />
              <input className="search-input" placeholder="Search by room or assignee..." value={hkSearch} onChange={(e) => setHkSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 160 }} value={hkFilter} onChange={(e) => setHkFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              {hkStatusOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Room #</th><th>Task Type</th><th>Priority</th><th>Assigned To</th><th>Scheduled</th><th>Notes</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {hkLoading ? (
                    <tr><td colSpan={7}><div className="empty-state"><p>Loading…</p></div></td></tr>
                  ) : hkTasks.length === 0 ? (
                    <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon"><MdCleaningServices /></div><h3>No Housekeeping Tasks</h3></div></td></tr>
                  ) : (
                    hkTasks.map((t) => (
                      <tr key={t._id}>
                        <td><strong>#{t.roomNumber}</strong></td>
                        <td>{t.type}</td>
                        <td><span className={`badge ${hkPriorityBadge[t.priority]}`}>{t.priority}</span></td>
                        <td>{t.assignedTo || "—"}</td>
                        <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                          {t.scheduledDate ? new Date(t.scheduledDate).toLocaleDateString() : "—"}
                        </td>
                        <td style={{ fontSize: 12, color: "var(--text-secondary)", maxWidth: 160 }}>
                          {t.notes ? t.notes.slice(0, 50) + (t.notes.length > 50 ? "…" : "") : "—"}
                        </td>
                        <td>
                          <select
                            className="form-select"
                            style={{ width: 130, padding: "4px 8px", fontSize: 12 }}
                            value={t.status}
                            onChange={(e) => handleHkStatus(t._id, e.target.value)}
                          >
                            {hkStatusOptions.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── MAINTENANCE TAB ────────────────── */}
      {activeTab === "maintenance" && (
        <div>
          {/* Summary pills */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {Object.entries(mtCounts).map(([s, c]) => (
              <div key={s} className="card" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                <span className={`badge ${mtStatusBadge[s]}`}>{s}</span>
                <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 20 }}>{c}</span>
              </div>
            ))}
          </div>

          <div className="search-bar">
            <div className="search-input-wrap">
              <MdSearch />
              <input className="search-input" placeholder="Search by title, room, or ticket #..." value={mtSearch} onChange={(e) => setMtSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 160 }} value={mtFilter} onChange={(e) => setMtFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              {mtStatusOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Ticket #</th><th>Title</th><th>Room / Location</th><th>Category</th><th>Priority</th><th>Assigned To</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {mtLoading ? (
                    <tr><td colSpan={7}><div className="empty-state"><p>Loading…</p></div></td></tr>
                  ) : mtReqs.length === 0 ? (
                    <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon"><MdBuild /></div><h3>No Maintenance Requests</h3></div></td></tr>
                  ) : (
                    mtReqs.map((r) => (
                      <tr key={r._id}>
                        <td><span style={{ color: "var(--gold)", fontWeight: 600, fontFamily: "Outfit" }}>{r.ticketNo}</span></td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{r.title}</div>
                          {r.description && <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{r.description.slice(0, 50)}{r.description.length > 50 ? "…" : ""}</div>}
                        </td>
                        <td>{r.roomNumber ? `#${r.roomNumber}` : r.location || "—"}</td>
                        <td><span className="badge badge-info">{r.category}</span></td>
                        <td><span className={`badge ${mtPriorityBadge[r.priority]}`}>{r.priority}</span></td>
                        <td>{r.assignedTo || "—"}</td>
                        <td>
                          <select
                            className="form-select"
                            style={{ width: 130, padding: "4px 8px", fontSize: 12 }}
                            value={r.status}
                            onChange={(e) => handleMtStatus(r._id, e.target.value)}
                          >
                            {mtStatusOptions.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Operations;
