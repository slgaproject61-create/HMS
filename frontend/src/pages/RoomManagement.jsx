import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MdAdd, MdEdit, MdDelete, MdMeetingRoom, MdClose,
  MdGridView, MdTableRows, MdSearch, MdRefresh, MdImage,
  MdLink, MdKingBed, MdVisibility, MdSquareFoot, MdStars
} from "react-icons/md";
import api from "../api";

const roomTypes = ["Standard", "Deluxe", "Executive Suite", "Presidential Suite", "Penthouse"];
const floors = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Penthouse Level"];
const statusOptions = ["Available", "Occupied", "Cleaning", "Maintenance", "Out of Service"];
const bedOptions = ["King Imperial Bed", "King Bed", "California King", "2 Queen Beds", "Queen Bed", "2 Twin Beds"];
const viewOptions = ["Oceanfront", "Panoramic Skyline", "Sea View", "Private Garden Sanctuary", "Courtyard View", "Mountain View"];

const statusBadge = {
  Available: "badge-success",
  Occupied: "badge-danger",
  Cleaning: "badge-warning",
  Maintenance: "badge-info",
  "Out of Service": "badge-danger",
};

const curatedPhotoPresets = [
  { label: "Presidential Suite", url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80" },
  { label: "Penthouse Villa", url: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80" },
  { label: "Oceanfront Deluxe", url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80" },
  { label: "Executive Suite", url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80" },
  { label: "Luxury Bathroom", url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80" },
  { label: "Hotel Lobby", url: "/hotel-lobby.jpg" },
];

const defaultForm = {
  number: "",
  name: "",
  type: "Standard",
  floor: "1",
  status: "Available",
  pricePerNight: "",
  capacity: "2",
  bed: "King Bed",
  view: "Oceanfront",
  size: "850 sq ft",
  tag: "",
  amenities: "High-Speed Wi-Fi, 4K Smart TV, Nespresso Machine, Marble Bath, Concierge Service",
  description: "",
  images: [],
};

/* Convert & optionally compress File to lightweight base64 */
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1280;
        const maxHeight = 960;
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
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
  const [urlInput, setUrlInput] = useState("");
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
    setForm({
      ...defaultForm,
      images: ["/hotel-lobby.jpg"],
    });
    setUrlInput("");
    setError("");
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditRoom(r);
    setForm({
      ...defaultForm,
      ...r,
      floor: r.floor || "1",
      images: r.images && r.images.length > 0 ? r.images : ["/hotel-lobby.jpg"],
      pricePerNight: r.pricePerNight !== undefined ? String(r.pricePerNight) : "",
      capacity: r.capacity !== undefined ? String(r.capacity) : "2",
      name: r.name || "",
      bed: r.bed || "King Bed",
      view: r.view || "Oceanfront",
      size: r.size || "850 sq ft",
      tag: r.tag || "",
      amenities: r.amenities || "",
      description: r.description || "",
    });
    setUrlInput("");
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room from inventory?")) return;
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

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setForm((f) => ({ ...f, images: [...(f.images || []), trimmed] }));
    setUrlInput("");
  };

  const handleAddPreset = (url) => {
    if (form.images && form.images.includes(url)) return;
    setForm((f) => ({ ...f, images: [...(f.images || []), url] }));
  };

  const removeImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (!form.number) return setError("Room number is required");
    if (!form.pricePerNight) return setError("Price per night is required");
    if (isNaN(Number(form.pricePerNight)) || Number(form.pricePerNight) < 0) {
      return setError("Price per night must be a valid positive number");
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        number: String(form.number).trim(),
        name: form.name.trim() || `${form.type} #${form.number}`,
        pricePerNight: Number(form.pricePerNight),
        capacity: Number(form.capacity) || 2,
        images: form.images && form.images.length > 0 ? form.images : ["/hotel-lobby.jpg"],
      };

      if (editRoom) {
        const { data } = await api.put(`/rooms/${editRoom._id}`, payload);
        setRooms((rs) => rs.map((r) => (r._id === data._id ? data : r)));
      } else {
        const { data } = await api.post("/rooms", payload);
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
          <p className="page-subtitle">Configure room inventory, images, luxury amenities, and guest portal visibility</p>
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
          <input className="search-input" id="room-search" placeholder="Search room number, suite name, type..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
            <p>Click "Add Room" to create a new room with images and luxury details. It will automatically be visible to guests on the Suites page.</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {filtered.map((r) => (
              <div className="room-card" key={r._id}>
                {/* Room thumbnail */}
                <div className="room-card-thumb">
                  {r.images && r.images.length > 0 ? (
                    <img src={r.images[0]} alt={r.name || `Room ${r.number}`} />
                  ) : (
                    <div className="room-card-thumb-placeholder"><MdMeetingRoom /></div>
                  )}
                  {r.tag && (
                    <span style={{
                      position: "absolute", top: 10, left: 10,
                      background: "rgba(10, 15, 30, 0.85)", color: "var(--gold, #d4af37)",
                      fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                      border: "1px solid rgba(212, 175, 55, 0.4)", textTransform: "uppercase"
                    }}>
                      <MdStars style={{ verticalAlign: "middle", marginRight: 4 }} />
                      {r.tag}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div className="room-card-number">#{r.number}</div>
                  <span className={`badge ${statusBadge[r.status]}`}>{r.status}</span>
                </div>

                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary, #fff)", margin: "4px 0 2px" }}>
                  {r.name || `${r.type} Suite`}
                </div>

                <div className="room-card-type">
                  {r.type} · Floor {r.floor} · {r.view || "City View"}
                </div>

                <div style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 8px", display: "flex", gap: 10 }}>
                  <span><MdKingBed style={{ verticalAlign: "middle" }} /> {r.bed || "King Bed"}</span>
                  {r.size && <span><MdSquareFoot style={{ verticalAlign: "middle" }} /> {r.size}</span>}
                  <span>👥 {r.capacity || 2} guests</span>
                </div>

                {r.images && r.images.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <span className="room-photo-badge"><MdImage style={{ fontSize: 12 }} />{r.images.length} photo{r.images.length > 1 ? "s" : ""}</span>
                  </div>
                )}

                <div className="room-card-footer">
                  <span className="room-card-price">${r.pricePerNight || "—"}/night</span>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button className="btn btn-sm btn-secondary btn-icon" onClick={() => openEdit(r)} title="Edit Room"><MdEdit /></button>
                    <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(r._id)} title="Delete Room"><MdDelete /></button>
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
              <thead>
                <tr>
                  <th>Room #</th>
                  <th>Suite Name</th>
                  <th>Type</th>
                  <th>Floor</th>
                  <th>Bed &amp; View</th>
                  <th>Status</th>
                  <th>Price/Night</th>
                  <th>Capacity</th>
                  <th>Photos</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10}><div className="empty-state"><div className="empty-state-icon"><MdMeetingRoom /></div><h3>No Rooms Found</h3></div></td></tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r._id}>
                      <td><strong>#{r.number}</strong></td>
                      <td style={{ fontWeight: 600 }}>{r.name || `${r.type} Suite`}</td>
                      <td>{r.type}</td>
                      <td>Floor {r.floor}</td>
                      <td style={{ fontSize: 13 }}>{r.bed || "King Bed"} · {r.view || "City View"}</td>
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
              <h3 className="modal-title">{editRoom ? `Edit Room #${form.number}` : "Add New Room to Inventory"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              {error && <div className="auth-alert auth-alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Room Number *</label>
                  <input className="form-input" placeholder="e.g. 501" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Suite / Room Name (Shown to Guests)</label>
                  <input className="form-input" placeholder="e.g. Presidential Sky Suite, Deluxe Ocean Villa" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
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
                  <input className="form-input" type="number" min="0" placeholder="299" value={form.pricePerNight} onChange={(e) => setForm((f) => ({ ...f, pricePerNight: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity (Max Guests)</label>
                  <input className="form-input" type="number" min="1" max="10" placeholder="2" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bed Type</label>
                  <select className="form-select" value={form.bed} onChange={(e) => setForm((f) => ({ ...f, bed: e.target.value }))}>
                    {bedOptions.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">View / Orientation</label>
                  <select className="form-select" value={form.view} onChange={(e) => setForm((f) => ({ ...f, view: e.target.value }))}>
                    {viewOptions.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Room Size / Area</label>
                  <input className="form-input" placeholder="e.g. 1,450 sq ft or 850 sq ft" value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Special Tag / Badge (Highlighted on Guest Panel)</label>
                  <input className="form-input" placeholder="e.g. Most Exclusive Sanctuary, Guest Favorite &amp; Romantic Haven" value={form.tag} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Amenities &amp; Features (Comma separated)</label>
                <input className="form-input" placeholder="Heated Jacuzzi, Dedicated Butler, Fast Wi-Fi, Nespresso Bar, Walk-in Closet" value={form.amenities} onChange={(e) => setForm((f) => ({ ...f, amenities: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Room Description (Shown to Guests when booking)</label>
                <textarea className="form-textarea" rows="3" placeholder="Describe the ambiance, balcony views, luxury architectural features and butler services..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>

              {/* ── Image Upload & Photo Management Section ── */}
              <div className="room-img-upload-section" style={{ marginTop: 12, padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span className="room-img-upload-label" style={{ fontWeight: 700, fontSize: 14 }}>
                    <MdImage style={{ verticalAlign: "middle", marginRight: 6 }} />
                    Room Photos ({form.images?.length || 0})
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>First image is used as the cover photo</span>
                </div>

                {/* Option A: Drop zone / file upload */}
                <div
                  className={`room-img-dropzone${dragOver ? " drag-over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ marginBottom: 14 }}
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
                  <span className="room-img-dropzone-title">Upload photos from device (click or drag &amp; drop)</span>
                  <span className="room-img-dropzone-sub">JPG, PNG, WEBP — automatically optimized for fast web loading</span>
                </div>

                {/* Option B: Direct Image URL Input */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      className="form-input"
                      placeholder="Or paste an Image URL (e.g. https://images.unsplash.com/... or /hotel-lobby.jpg)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddUrl(); } }}
                    />
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={handleAddUrl} style={{ whiteSpace: "nowrap" }}>
                    <MdLink style={{ marginRight: 4 }} /> Add URL
                  </button>
                </div>

                {/* Option C: One-Click Curated Luxury Presets */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Quick 1-Click Luxury Photo Presets:</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {curatedPhotoPresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleAddPreset(preset.url)}
                        style={{ fontSize: 11, padding: "4px 8px" }}
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Previews */}
                {form.images && form.images.length > 0 && (
                  <div className="room-img-previews" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                    {form.images.map((src, idx) => (
                      <div className="room-img-preview-item" key={idx} style={{ position: "relative", width: 90, height: 65, borderRadius: 6, overflow: "hidden", border: idx === 0 ? "2px solid var(--gold)" : "1px solid rgba(255,255,255,0.2)" }}>
                        <img src={src} alt={`Room photo ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        {idx === 0 && (
                          <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.7)", color: "var(--gold)", fontSize: 9, textAlign: "center", fontWeight: 700 }}>COVER</span>
                        )}
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
                {saving ? "Saving…" : editRoom ? "Save Room Changes" : "Create Room in Inventory"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
