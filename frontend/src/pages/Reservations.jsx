import React, { useState, useEffect, useCallback } from "react";
import { MdAdd, MdEdit, MdDelete, MdEventNote, MdClose, MdSearch, MdRefresh } from "react-icons/md";
import api from "../api";

const statusBadge = {
  Confirmed: "badge-success",
  Pending: "badge-warning",
  Cancelled: "badge-danger",
  "Checked-in": "badge-info",
  "Checked-out": "badge-gold",
  "No-show": "badge-danger",
};

const defaultForm = {
  guestName: "", guestEmail: "", guestPhone: "", roomNumber: "", checkIn: "", checkOut: "",
  adults: "1", children: "0", status: "Confirmed", notes: "", source: "Direct", totalPrice: ""
};

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editRes, setEditRes] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== "All") params.status = filterStatus;
      if (search) params.search = search;
      const { data } = await api.get("/reservations", { params });
      setReservations(data.data || []);
    } catch (err) {
      console.error("Failed to fetch reservations:", err.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => {
    const t = setTimeout(fetchReservations, 300);
    return () => clearTimeout(t);
  }, [fetchReservations]);

  const openCreate = () => { setEditRes(null); setForm(defaultForm); setError(""); setShowModal(true); };
  const openEdit = (r) => { setEditRes(r); setForm({ ...r, checkIn: r.checkIn?.split("T")[0] || "", checkOut: r.checkOut?.split("T")[0] || "" }); setError(""); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reservation?")) return;
    try {
      await api.delete(`/reservations/${id}`);
      setReservations((rs) => rs.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleSave = async () => {
    if (!form.guestName || !form.checkIn || !form.checkOut) return setError("Guest name, check-in and check-out are required");
    if (!form.roomNumber) return setError("Room number is required");
    setSaving(true);
    setError("");
    try {
      if (editRes) {
        const { data } = await api.put(`/reservations/${editRes._id}`, form);
        setReservations((rs) => rs.map((r) => (r._id === data._id ? data : r)));
      } else {
        const { data } = await api.post("/reservations", form);
        setReservations((rs) => [data, ...rs]);
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
          <h2 className="page-title">Reservations</h2>
          <p className="page-subtitle">Manage all bookings and reservation details</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-icon" onClick={fetchReservations} title="Refresh"><MdRefresh /></button>
          <button id="btn-add-reservation" className="btn btn-primary" onClick={openCreate}><MdAdd /> New Reservation</button>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <MdSearch />
          <input id="reservation-search" className="search-input" placeholder="Search by guest, room, or confirmation #..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All Statuses</option>
          {Object.keys(statusBadge).map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Confirmation #</th><th>Guest</th><th>Room</th><th>Check-in</th><th>Check-out</th>
                <th>Guests</th><th>Source</th><th>Total</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10}><div className="empty-state"><p>Loading…</p></div></td></tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><MdEventNote /></div>
                      <h3>No Reservations</h3>
                      <p>Create a new reservation to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r._id}>
                    <td><span style={{ color: "var(--gold)", fontWeight: 600, fontFamily: "Outfit" }}>{r.confirmationNo}</span></td>
                    <td><div>{r.guestName}</div>{r.guestEmail && <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{r.guestEmail}</div>}</td>
                    <td>#{r.roomNumber}</td>
                    <td>{r.checkIn?.split("T")[0]}</td>
                    <td>{r.checkOut?.split("T")[0]}</td>
                    <td>{r.adults} adult{r.adults !== 1 ? "s" : ""}{r.children > 0 ? `, ${r.children} child` : ""}</td>
                    <td><span className="badge badge-info">{r.source}</span></td>
                    <td style={{ color: "var(--gold)", fontWeight: 600 }}>{r.totalPrice ? `$${r.totalPrice}` : "—"}</td>
                    <td><span className={`badge ${statusBadge[r.status]}`}>{r.status}</span></td>
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
              <h3 className="modal-title">{editRes ? "Edit Reservation" : "New Reservation"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              {error && <div className="auth-alert auth-alert-error" style={{ marginBottom: 16 }}>{error}</div>}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Guest Name *</label>
                  <input className="form-input" placeholder="John Smith" value={form.guestName} onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Room Number *</label>
                  <input className="form-input" placeholder="204" value={form.roomNumber} onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Guest Email</label>
                  <input className="form-input" type="email" placeholder="guest@email.com" value={form.guestEmail} onChange={(e) => setForm((f) => ({ ...f, guestEmail: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Guest Phone</label>
                  <input className="form-input" placeholder="+1 (555) 000-0000" value={form.guestPhone} onChange={(e) => setForm((f) => ({ ...f, guestPhone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Check-in Date *</label>
                  <input className="form-input" type="date" value={form.checkIn} onChange={(e) => setForm((f) => ({ ...f, checkIn: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Check-out Date *</label>
                  <input className="form-input" type="date" value={form.checkOut} onChange={(e) => setForm((f) => ({ ...f, checkOut: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Adults</label>
                  <input className="form-input" type="number" min="1" value={form.adults} onChange={(e) => setForm((f) => ({ ...f, adults: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Children</label>
                  <input className="form-input" type="number" min="0" value={form.children} onChange={(e) => setForm((f) => ({ ...f, children: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Price ($)</label>
                  <input className="form-input" type="number" placeholder="0" value={form.totalPrice} onChange={(e) => setForm((f) => ({ ...f, totalPrice: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    {Object.keys(statusBadge).map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Booking Source</label>
                  <select className="form-select" value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}>
                    {["Direct", "Online", "Phone", "Travel Agent", "OTA"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Special Notes</label>
                <textarea className="form-textarea" placeholder="Special requests, dietary needs, occasion..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button id="btn-save-reservation" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editRes ? "Save Changes" : "Create Reservation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
