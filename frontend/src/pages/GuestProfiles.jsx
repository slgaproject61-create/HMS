import React, { useState, useEffect, useCallback } from "react";
import { MdSearch, MdAdd, MdEdit, MdDelete, MdPerson, MdClose, MdStar, MdRefresh } from "react-icons/md";
import api from "../api";

const loyaltyTiers = ["Standard", "Silver", "Gold", "Platinum"];
const idTypes = ["Passport", "National ID", "Driver's License", "Other"];

const tierBadge = {
  Standard: "badge-info",
  Silver: "badge-info",
  Gold: "badge-gold",
  Platinum: "badge-success",
};

const defaultForm = {
  name: "", email: "", phone: "", nationality: "",
  idType: "Passport", idNumber: "", loyaltyTier: "Standard",
  preferences: "", isVIP: false, notes: ""
};

const GuestProfiles = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editGuest, setEditGuest] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");

  const fetchGuests = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterTier !== "All") params.tier = filterTier;
      const { data } = await api.get("/guests", { params });
      setGuests(data.data || []);
    } catch (err) {
      console.error("Failed to fetch guests:", err.message);
    } finally {
      setLoading(false);
    }
  }, [search, filterTier]);

  useEffect(() => {
    const t = setTimeout(fetchGuests, 300);
    return () => clearTimeout(t);
  }, [fetchGuests]);

  const openCreate = () => { setEditGuest(null); setForm(defaultForm); setError(""); setShowModal(true); };
  const openEdit = (g) => { setEditGuest(g); setForm({ ...g }); setError(""); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this guest profile?")) return;
    try {
      await api.delete(`/guests/${id}`);
      setGuests((gs) => gs.filter((g) => g._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleSave = async () => {
    if (!form.name) return setError("Name is required");
    if (!form.email) return setError("Email is required");
    setSaving(true);
    setError("");
    try {
      if (editGuest) {
        const { data } = await api.put(`/guests/${editGuest._id}`, form);
        setGuests((gs) => gs.map((g) => (g._id === data._id ? data : g)));
      } else {
        const { data } = await api.post("/guests", form);
        setGuests((gs) => [data, ...gs]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const initials = (name = "") => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Guest Profiles</h2>
          <p className="page-subtitle">Manage all registered guest information and preferences</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-icon" onClick={fetchGuests} title="Refresh"><MdRefresh /></button>
          <button id="btn-add-guest" className="btn btn-primary" onClick={openCreate}>
            <MdAdd /> Add Guest
          </button>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <MdSearch />
          <input id="guest-search" className="search-input" placeholder="Search guests by name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={filterTier} onChange={(e) => setFilterTier(e.target.value)}>
          <option value="All">All Tiers</option>
          {loyaltyTiers.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th><th>Nationality</th>
                <th>Loyalty</th><th>Stays</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><div className="empty-state"><p>Loading…</p></div></td></tr>
              ) : guests.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><MdPerson /></div>
                      <h3>No Guests Found</h3>
                      <p>Guest profiles will appear here once added or synced</p>
                    </div>
                  </td>
                </tr>
              ) : (
                guests.map((g) => (
                  <tr key={g._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 11, background: "linear-gradient(135deg, var(--info), #1a6baa)" }}>
                          {initials(g.name)}
                        </div>
                        <div>
                          <div>{g.name}</div>
                          {g.isVIP && <div style={{ fontSize: 10, color: "var(--gold)" }}>⭐ VIP Guest</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{g.email}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{g.phone || "—"}</td>
                    <td>{g.nationality || "—"}</td>
                    <td><span className={`badge ${tierBadge[g.loyaltyTier]}`}>{g.loyaltyTier}</span></td>
                    <td style={{ fontFamily: "Outfit", fontWeight: 700 }}>{g.totalStays}</td>
                    <td><span className={`badge ${g.isVIP ? "badge-gold" : "badge-success"}`}>{g.isVIP ? "VIP" : "Regular"}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sm btn-secondary btn-icon" onClick={() => openEdit(g)}><MdEdit /></button>
                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(g._id)}><MdDelete /></button>
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
              <h3 className="modal-title">{editGuest ? "Edit Guest Profile" : "New Guest Profile"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              {error && <div className="auth-alert auth-alert-error" style={{ marginBottom: 16 }}>{error}</div>}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="John Smith" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" placeholder="john@example.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="+1 555 000 0000" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nationality</label>
                  <input className="form-input" placeholder="American" value={form.nationality} onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">ID Type</label>
                  <select className="form-select" value={form.idType} onChange={(e) => setForm((f) => ({ ...f, idType: e.target.value }))}>
                    {idTypes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ID Number</label>
                  <input className="form-input" placeholder="A1234567" value={form.idNumber} onChange={(e) => setForm((f) => ({ ...f, idNumber: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Loyalty Tier</label>
                  <select className="form-select" value={form.loyaltyTier} onChange={(e) => setForm((f) => ({ ...f, loyaltyTier: e.target.value }))}>
                    {loyaltyTiers.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22 }}>
                  <input type="checkbox" id="vip-check" checked={form.isVIP} onChange={(e) => setForm((f) => ({ ...f, isVIP: e.target.checked }))} />
                  <label htmlFor="vip-check" style={{ color: "var(--gold)", fontWeight: 600, cursor: "pointer" }}>⭐ Mark as VIP Guest</label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Preferences / Notes</label>
                <textarea className="form-textarea" placeholder="e.g. Non-smoking room, high floor, extra pillows..." value={form.preferences} onChange={(e) => setForm((f) => ({ ...f, preferences: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button id="btn-save-guest" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editGuest ? "Save Changes" : "Create Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestProfiles;
