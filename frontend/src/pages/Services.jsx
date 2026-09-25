import React, { useState, useEffect, useCallback } from "react";
import { MdAdd, MdEdit, MdDelete, MdClose, MdSearch, MdRoomService, MdRefresh } from "react-icons/md";
import api from "../api";

const categories = ["Food & Beverage", "Spa & Wellness", "Business", "Transport", "Recreation", "Laundry", "Other"];

const categoryBadge = {
  "Food & Beverage": "badge-warning",
  "Spa & Wellness": "badge-success",
  "Business": "badge-info",
  "Transport": "badge-gold",
  "Recreation": "badge-info",
  "Laundry": "badge-info",
  "Other": "badge-info",
};

const defaultForm = {
  name: "", category: "Other", description: "", price: "", unit: "per request", available: true, tags: ""
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterCategory !== "All") params.category = filterCategory;
      const { data } = await api.get("/services", { params });
      let result = data.data || [];
      if (search) result = result.filter((s) =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
      );
      setServices(result);
    } catch (err) {
      console.error("Failed to fetch services:", err.message);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, search]);

  useEffect(() => {
    const t = setTimeout(fetchServices, 300);
    return () => clearTimeout(t);
  }, [fetchServices]);

  const openCreate = () => { setEditService(null); setForm(defaultForm); setError(""); setShowModal(true); };
  const openEdit = (s) => { setEditService(s); setForm({ ...s, tags: (s.tags || []).join(", ") }); setError(""); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await api.delete(`/services/${id}`);
      setServices((ss) => ss.filter((s) => s._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleToggleAvailable = async (s) => {
    try {
      const { data } = await api.put(`/services/${s._id}`, { available: !s.available });
      setServices((ss) => ss.map((sv) => (sv._id === data._id ? data : sv)));
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleSave = async () => {
    if (!form.name) return setError("Service name is required");
    if (!form.price && form.price !== 0) return setError("Price is required");
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [] };
      if (editService) {
        const { data } = await api.put(`/services/${editService._id}`, payload);
        setServices((ss) => ss.map((s) => (s._id === data._id ? data : s)));
      } else {
        const { data } = await api.post("/services", payload);
        setServices((ss) => [data, ...ss]);
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
          <h2 className="page-title">Hotel Services</h2>
          <p className="page-subtitle">Manage and track all hotel amenities and guest service offerings</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-icon" onClick={fetchServices} title="Refresh"><MdRefresh /></button>
          <button id="btn-add-service" className="btn btn-primary" onClick={openCreate}><MdAdd /> Add Service</button>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <MdSearch />
          <input className="search-input" placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 180 }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="All">All Categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading…</p></div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><MdRoomService /></div>
          <h3>No Services Found</h3>
          <p>Add hotel services to the catalog</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {services.map((s) => (
            <div key={s._id} className="card" style={{ padding: "18px 20px", opacity: s.available ? 1 : 0.6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span className={`badge ${categoryBadge[s.category] || "badge-info"}`}>{s.category}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-sm btn-secondary btn-icon" onClick={() => openEdit(s)} title="Edit"><MdEdit /></button>
                  <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(s._id)} title="Delete"><MdDelete /></button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.name}</div>
              {s.description && (
                <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>{s.description}</p>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 18, color: "var(--gold)" }}>
                    {s.price === 0 ? "Free" : `$${s.price}`}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", marginLeft: 4 }}>{s.unit}</span>
                </div>
                <button
                  className={`btn btn-sm ${s.available ? "btn-success" : "btn-secondary"}`}
                  onClick={() => handleToggleAvailable(s)}
                  style={{ fontSize: 11, padding: "4px 10px" }}
                >
                  {s.available ? "Available" : "Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editService ? "Edit Service" : "Add New Service"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              {error && <div className="auth-alert auth-alert-error" style={{ marginBottom: 16 }}>{error}</div>}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Service Name *</label>
                  <input className="form-input" placeholder="Airport Transfer" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price ($) *</label>
                  <input className="form-input" type="number" min="0" placeholder="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input className="form-input" placeholder="per request" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} />
                </div>
                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22 }}>
                  <input type="checkbox" id="avail-check" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} />
                  <label htmlFor="avail-check" style={{ cursor: "pointer", fontWeight: 500 }}>Available to Guests</label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Describe this service..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-input" placeholder="luxury, premium, 24/7" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editService ? "Save Changes" : "Add Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
