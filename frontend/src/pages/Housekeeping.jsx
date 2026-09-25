import React, { useState, useEffect, useCallback } from "react";
import { MdAdd, MdEdit, MdDelete, MdClose, MdSearch, MdCleaningServices, MdRefresh } from "react-icons/md";
import api from "../api";

const priorities = ["Low", "Normal", "High", "Urgent"];
const taskTypes = ["Daily Clean", "Deep Clean", "Turndown", "Inspection", "Post Checkout"];
const statusOptions = ["Pending", "In Progress", "Completed", "Skipped"];

const priorityBadge = { Low: "badge-info", Normal: "badge-success", High: "badge-warning", Urgent: "badge-danger" };
const statusBadge = { Pending: "badge-warning", "In Progress": "badge-info", Completed: "badge-success", Skipped: "badge-danger" };

const defaultForm = { roomNumber: "", type: "Daily Clean", assignedTo: "", priority: "Normal", status: "Pending", scheduledDate: "", notes: "" };

const Housekeeping = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== "All") params.status = filterStatus;
      if (search) params.search = search;
      const { data } = await api.get("/housekeeping", { params });
      setTasks(data.data || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => {
    const t = setTimeout(fetchTasks, 300);
    return () => clearTimeout(t);
  }, [fetchTasks]);

  const counts = { Pending: 0, "In Progress": 0, Completed: 0 };
  tasks.forEach((t) => { if (counts[t.status] !== undefined) counts[t.status]++; });

  const openCreate = () => { setEditTask(null); setForm(defaultForm); setError(""); setShowModal(true); };
  const openEdit = (t) => { setEditTask(t); setForm({ ...t, scheduledDate: t.scheduledDate?.split("T")[0] || "" }); setError(""); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/housekeeping/${id}`);
      setTasks((ts) => ts.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await api.put(`/housekeeping/${id}`, { status });
      setTasks((ts) => ts.map((t) => (t._id === id ? data : t)));
    } catch (err) {
      alert("Status update failed");
    }
  };

  const handleSave = async () => {
    if (!form.roomNumber) return setError("Room number is required");
    setSaving(true);
    setError("");
    try {
      if (editTask) {
        const { data } = await api.put(`/housekeeping/${editTask._id}`, form);
        setTasks((ts) => ts.map((t) => (t._id === data._id ? data : t)));
      } else {
        const { data } = await api.post("/housekeeping", form);
        setTasks((ts) => [data, ...ts]);
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
          <h2 className="page-title">Housekeeping</h2>
          <p className="page-subtitle">Schedule and track room cleaning and inspection tasks</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-icon" onClick={fetchTasks} title="Refresh"><MdRefresh /></button>
          <button id="btn-add-housekeeping" className="btn btn-primary" onClick={openCreate}><MdAdd /> New Task</button>
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
          <input className="search-input" placeholder="Search by room or assignee..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All Statuses</option>
          {statusOptions.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Room #</th><th>Task Type</th><th>Priority</th><th>Assigned To</th><th>Scheduled</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="empty-state"><p>Loading…</p></div></td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon"><MdCleaningServices /></div><h3>No Tasks</h3><p>Create a housekeeping task to get started</p></div></td></tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t._id}>
                    <td><strong>#{t.roomNumber}</strong></td>
                    <td>{t.type}</td>
                    <td><span className={`badge ${priorityBadge[t.priority]}`}>{t.priority}</span></td>
                    <td>{t.assignedTo || "—"}</td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t.scheduledDate ? new Date(t.scheduledDate).toLocaleDateString() : "—"}</td>
                    <td>
                      <select
                        className="form-select"
                        style={{ width: 130, padding: "4px 8px", fontSize: 12 }}
                        value={t.status}
                        onChange={(e) => handleStatusChange(t._id, e.target.value)}
                      >
                        {statusOptions.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sm btn-secondary btn-icon" onClick={() => openEdit(t)}><MdEdit /></button>
                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(t._id)}><MdDelete /></button>
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
              <h3 className="modal-title">{editTask ? "Edit Task" : "New Housekeeping Task"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              {error && <div className="auth-alert auth-alert-error" style={{ marginBottom: 16 }}>{error}</div>}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Room Number *</label>
                  <input className="form-input" placeholder="101" value={form.roomNumber} onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Task Type</label>
                  <select className="form-select" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                    {taskTypes.map((t) => <option key={t}>{t}</option>)}
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
                  <input className="form-input" placeholder="Staff name" value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Scheduled Date</label>
                  <input className="form-input" type="date" value={form.scheduledDate} onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" placeholder="Special instructions..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editTask ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Housekeeping;
