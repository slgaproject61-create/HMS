import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MdAdd, MdEdit, MdDelete, MdMeetingRoom, MdClose,
  MdGridView, MdTableRows, MdSearch, MdRefresh, MdImage,
} from "react-icons/md";
import api from "../api";

const roomTypes = ["Standard", "Deluxe", "Executive Suite", "Presidential Suite", "Penthouse"];
const floors = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const statusOptions = ["Available", "Occupied", "Cleaning", "Maintenance", "Out of Service"];

const statusBadge = {
  Available: "badge-success",
  Occupied: "badge-danger",
  Cleaning: "badge-warning",
  Maintenance: "badge-info",
  "Out of Service": "badge-danger",
};

const defaultForm = {
  number: "", type: "Standard", floor: "1", status: "Available",
  pricePerNight: "", capacity: "2", amenities: "", description: "", images: [],
};

/* Convert File → base64 data-URL */
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  /* ── Fetch rooms ── */
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== "All") params.status = filterStatus;
      if (search) params.search = search;
      const { data } = await api.get("/rooms", { params });
      setRooms(data.data || []);
    } catch (err) {
      console.error("Failed to fetch rooms:", err.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => {
    const t = setTimeout(fetchRooms, 300);
    return () => clearTimeout(t);
  }, [fetchRooms]);

  const filtered = rooms;

  const openCreate = () => {
    setEditRoom(null);
    setForm(defaultForm);
    setError("");
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditRoom(r);
    setForm({ ...r, floor: r.floor || "1", images: r.images || [] });
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      await api.delete(`/rooms/${id}`);
      setRooms((rs) => rs.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  /* ── Image handling ── */
  const handleImageFiles = async (files) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!validFiles.length) return;
    const base64s = await Promise.all(validFiles.map(fileToBase64));
    setForm((f) => ({ ...f, images: [...(f.images || []), ...base64s] }));
  };

  const handleFileChange = (e) => handleImageFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (!form.number) return setError("Room number is required");
    if (!form.pricePerNight) return setError("Price per night is required");
    setSaving(true);
    setError("");
    try {
      if (editRoom) {
        const { data } = await api.put(`/rooms/${editRoom._id}`, form);
        setRooms((rs) => rs.map((r) => (r._id === data._id ? data : r)));
      } else {
        const { data } = await api.post("/rooms", form);
        setRooms((rs) => [data, ...rs]);
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
          <h2 className="page-title">Room Management</h2>
          <p className="page-subtitle">Manage room inventory, status, pricing, and amenities</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-icon" onClick={fetchRooms} title="Refresh"><MdRefresh /></button>
          <button className={`btn ${view === "grid" ? "btn-primary" : "btn-secondary"} btn-icon`} onClick={() => setView("grid")} title="Grid view"><MdGridView /></button>
          <button className={`btn ${view === "list" ? "btn-primary" : "btn-secondary"} btn-icon`} onClick={() => setView("list")} title="List view"><MdTableRows /></button>
          <button id="btn-add-room" className="btn btn-primary" onClick={openCreate}><MdAdd /> Add Room</button>
        </div>
      </div>

      {/* Stats bar */}
      {rooms.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {statusOptions.map((s) => {
            const count = rooms.filter((r) => r.status === s).length;
            return (
              <div key={s} className="card" style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <span className={`badge ${statusBadge[s]}`}>{s}</span>
                <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 18 }}>{count}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="search-bar">
        <div className="search-input-wrap">
          <MdSearch />
          <input className="search-input" id="room-search" placeholder="Search room number..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All Statuses</option>
          {statusOptions.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading rooms…</p></div>
      ) : view === "grid" ? (
        filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><MdMeetingRoom /></div>
            <h3>No Rooms Found</h3>
            <p>Click "Add Room" to add your first room to the inventory</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {filtered.map((r) => (
              <div className="room-card" key={r._id}>
                {/* Room thumbnail */}
                <div className="room-card-thumb">
                  {r.images && r.images.length > 0 ? (
                    <img src={r.images[0]} alt={`Room ${r.number}`} />
                  ) : (
                    <div className="room-card-thumb-placeholder"><MdMeetingRoom /></div>
                  )}
                </div>

                <div className="room-card-number">#{r.number}</div>
                <div className="room-card-type">{r.type} · Floor {r.floor}</div>
                <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span className={`badge ${statusBadge[r.status]}`}>{r.status}</span>
                  {r.images && r.images.length > 0 && (
                    <span className="room-photo-badge"><MdImage style={{ fontSize: 12 }} />{r.images.length} photo{r.images.length > 1 ? "s" : ""}</span>
                  )}
                </div>
                <div className="room-card-footer">
                  <span className="room-card-price">${r.pricePerNight || "—"}/night</span>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button className="btn btn-sm btn-secondary btn-icon" onClick={() => openEdit(r)}><MdEdit /></button>
                    <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(r._id)}><MdDelete /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Room #</th><th>Type</th><th>Floor</th><th>Status</th><th>Price/Night</th><th>Capacity</th><th>Photos</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon"><MdMeetingRoom /></div><h3>No Rooms Found</h3></div></td></tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r._id}>
                      <td><strong>#{r.number}</strong></td>
                      <td>{r.type}</td>
                      <td>Floor {r.floor}</td>
                      <td><span className={`badge ${statusBadge[r.status]}`}>{r.status}</span></td>
                      <td style={{ color: "var(--gold)", fontWeight: 600 }}>${r.pricePerNight || "—"}</td>
                      <td>{r.capacity} guests</td>
                      <td>
                        {r.images && r.images.length > 0
                          ? <span className="room-photo-badge"><MdImage style={{ fontSize: 12 }} />{r.images.length}</span>
                          : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                        }
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
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editRoom ? "Edit Room" : "Add New Room"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              {error && <div className="auth-alert auth-alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Room Number *</label>
                  <input className="form-input" placeholder="101" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Room Type</label>
                  <select className="form-select" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                    {roomTypes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Floor</label>
                  <select className="form-select" value={form.floor} onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}>
                    {floors.map((fl) => <option key={fl} value={fl}>Floor {fl}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    {statusOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price Per Night ($) *</label>
                  <input className="form-input" type="number" placeholder="299" value={form.pricePerNight} onChange={(e) => setForm((f) => ({ ...f, pricePerNight: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity (guests)</label>
                  <input className="form-input" type="number" placeholder="2" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Amenities</label>
                <input className="form-input" placeholder="King bed, Ocean view, Jacuzzi, Mini bar..." value={form.amenities} onChange={(e) => setForm((f) => ({ ...f, amenities: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Room description..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>

              {/* ── Image Upload Section ── */}
              <div className="room-img-upload-section" style={{ marginTop: 8 }}>
                <span className="room-img-upload-label">Room Photos</span>

                {/* Drop zone */}
                <div
                  className={`room-img-dropzone${dragOver ? " drag-over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <MdImage className="room-img-dropzone-icon" />
                  <span className="room-img-dropzone-title">Click or drag &amp; drop room photos</span>
                  <span className="room-img-dropzone-sub">PNG, JPG, WEBP — multiple files supported</span>
                </div>

                {/* Previews */}
                {form.images && form.images.length > 0 && (
                  <div className="room-img-previews">
                    {form.images.map((src, idx) => (
                      <div className="room-img-preview-item" key={idx}>
                        <img src={src} alt={`Room photo ${idx + 1}`} />
                        <button
                          type="button"
                          className="room-img-remove-btn"
                          onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                          title="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button id="btn-save-room" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editRoom ? "Save Changes" : "Add Room"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
