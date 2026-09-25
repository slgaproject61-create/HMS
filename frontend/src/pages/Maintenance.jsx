import React, { useState, useEffect, useCallback } from "react";
import { MdAdd, MdEdit, MdDelete, MdClose, MdSearch, MdBuild, MdWarning, MdRefresh } from "react-icons/md";
import api from "../api";

const categories = ["Electrical", "Plumbing", "HVAC", "Furniture", "IT/Electronics", "Structural", "Other"];
const priorities = ["Low", "Normal", "High", "Critical"];
const statusOptions = ["Open", "In Progress", "On Hold", "Resolved", "Closed"];

const priorityBadge = { Low: "badge-info", Normal: "badge-success", High: "badge-warning", Critical: "badge-danger" };
const statusBadge = { Open: "badge-danger", "In Progress": "badge-warning", "On Hold": "badge-info", Resolved: "badge-success", Closed: "badge-info" };

const defaultForm = { title: "", roomNumber: "", location: "", category: "Other", priority: "Normal", status: "Open", description: "", assignedTo: "", reportedBy: "" };

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editReq, setEditReq] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== "All") params.status = filterStatus;
      if (filterPriority !== "All") params.priority = filterPriority;
      if (search) params.search = search;
      const { data } = await api.get("/maintenance", { params });
      setRequests(data.data || []);
    } catch (err) {
      console.error("Failed to fetch maintenance:", err.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, search]);

  useEffect(() => {
    const t = setTimeout(fetchRequests, 300);
    return () => clearTimeout(t);
  }, [fetchRequests]);

  const counts = { Open: 0, "In Progress": 0, "On Hold": 0, Resolved: 0, Closed: 0 };
  requests.forEach((r) => { if (counts[r.status] !== undefined) counts[r.status]++; });

  const openCreate = () => { setEditReq(null); setForm(defaultForm); setError(""); setShowModal(true); };
  const openEdit = (r) => { setEditReq(r); setForm({ ...r }); setError(""); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this maintenance request?")) return;
    try {
      await api.delete(`/maintenance/${id}`);
      setRequests((rs) => rs.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await api.put(`/maintenance/${id}`, { status });
      setRequests((rs) => rs.map((r) => (r._id === id ? data : r)));
    } catch (err) {
      alert("Status update failed");
    }
  };

  const handleSave = async () => {
    if (!form.title) return setError("Title is required");
    setSaving(true);
    setError("");
    try {
      if (editReq) {
        const { data } = await api.put(`/maintenance/${editReq._id}`, form);
        setRequests((rs) => rs.map((r) => (r._id === data._id ? data : r)));
      } else {
        const { data } = await api.post("/maintenance", form);
        setRequests((rs) => [data, ...rs]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Maintenance</h2>
          <p className="page-subtitle">Track and resolve all maintenance requests and issues</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-icon" onClick={fetchRequests} title="Refresh"><MdRefresh /></button>
          <button id="btn-add-maintenance" className="btn btn-primary" onClick={openCreate}><MdAdd /> New Request</button>
        </div>
      </div>

      {/* Status Summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(counts).map(([s, c]) => (
          <div key={s} className="card" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <span className={`badge ${statusBadge[s]}`}>{s}</span>
            <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 20 }}>{c}</span>
          </div>
        ))}
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <MdSearch />
          <input className="search-input" placeholder="Search by title, room, or ticket #..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 140 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All Statuses</option>
          {statusOptions.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width: 130 }} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="All">All Priority</option>
          {priorities.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Ticket #</th><th>Title</th><th>Room</th><th>Category</th><th>Priority</th><th>Assigned To</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><div className="empty-state"><p>Loading…</p></div></td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon"><MdBuild /></div><h3>No Requests</h3><p>Create a maintenance request to get started</p></div></td></tr>
              ) : (
                requests.map((r) => (
                  <tr key={r._id}>
                    <td><span style={{ color: "var(--gold)", fontWeight: 600, fontFamily: "Outfit" }}>{r.ticketNo}</span></td>
                    <td><div style={{ fontWeight: 500 }}>{r.title}</div>{r.description && <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{r.description.slice(0, 50)}{r.description.length > 50 ? "…" : ""}</div>}</td>
                    <td>{r.roomNumber ? `#${r.roomNumber}` : r.location || "—"}</td>
                    <td><span className="badge badge-info">{r.category}</span></td>
                    <td><span className={`badge ${priorityBadge[r.priority]}`}>{r.priority}</span></td>
                    <td>{r.assignedTo || "—"}</td>
                    <td>
                      <select
                        className="form-select"
                        style={{ width: 130, padding: "4px 8px", fontSize: 12 }}
                        value={r.status}
                        onChange={(e) => handleStatusChange(r._id, e.target.value)}
                      >
                        {statusOptions.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sm btn-secondary btn-icon" onClick={() => openEdit(r)}><MdEdit /></button>
                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(r._id)}><MdDelete /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editReq ? "Edit Request" : "New Maintenance Request"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              {error && <div className="auth-alert auth-alert-error" style={{ marginBottom: 16 }}>{error}</div>}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" placeholder="AC unit not cooling" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Room Number</label>
                  <input className="form-input" placeholder="304" value={form.roomNumber} onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                    {priorities.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    {statusOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned To</label>
                  <input className="form-input" placeholder="Technician name" value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reported By</label>
                  <input className="form-input" placeholder="Staff name or guest" value={form.reportedBy} onChange={(e) => setForm((f) => ({ ...f, reportedBy: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location (if not a room)</label>
                  <input className="form-input" placeholder="Lobby, Pool, etc." value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Detailed description of the issue..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editReq ? "Save Changes" : "Create Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
