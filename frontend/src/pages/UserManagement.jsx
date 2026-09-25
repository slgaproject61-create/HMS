import React, { useState, useEffect, useCallback } from "react";
import { MdSearch, MdAdd, MdEdit, MdDelete, MdPerson, MdClose, MdRefresh } from "react-icons/md";
import api from "../api";

const roles = ["Admin", "Manager", "Receptionist", "Housekeeping", "Maintenance"];

const roleBadgeColors = {
  Admin: "badge-danger",
  Manager: "badge-warning",
  Receptionist: "badge-info",
  Housekeeping: "badge-success",
  Maintenance: "badge-gold",
};

const defaultForm = { name: "", email: "", password: "", role: "Receptionist", phone: "", isActive: true };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users");
      let result = data.data || [];
      if (search) result = result.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
      if (filterRole !== "All") result = result.filter((u) => u.role === filterRole);
      setUsers(result);
    } catch (err) {
      console.error("Failed to fetch users:", err.message);
    } finally {
      setLoading(false);
    }
  }, [search, filterRole]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const openCreate = () => { setEditUser(null); setForm(defaultForm); setError(""); setShowModal(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: "", role: u.role, phone: u.phone || "", isActive: u.isActive }); setError(""); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user account?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((us) => us.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleToggleActive = async (u) => {
    try {
      const { data } = await api.put(`/users/${u._id}`, { isActive: !u.isActive });
      setUsers((us) => us.map((x) => (x._id === data._id ? data : x)));
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed");
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return setError("Name and email are required");
    if (!editUser && !form.password) return setError("Password is required for new users");
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password; // don't send empty password on edit
      if (editUser) {
        const { data } = await api.put(`/users/${editUser._id}`, payload);
        setUsers((us) => us.map((u) => (u._id === data._id ? data : u)));
      } else {
        const { data } = await api.post("/users", payload);
        setUsers((us) => [data, ...us]);
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
          <h2 className="page-title">User Management</h2>
          <p className="page-subtitle">Create and manage staff accounts with role-based access</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-icon" onClick={fetchUsers} title="Refresh"><MdRefresh /></button>
          <button id="btn-add-user" className="btn btn-primary" onClick={openCreate}><MdAdd /> Add User</button>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <MdSearch />
          <input id="user-search" className="search-input" placeholder="Search users by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="All">All Roles</option>
          {roles.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Last Login</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="empty-state"><p>Loading…</p></div></td></tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><MdPerson /></div>
                      <h3>No Users Found</h3>
                      <p>Click "Add User" to create the first staff account</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>{initials(u.name)}</div>
                        {u.name}
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                    <td><span className={`badge ${roleBadgeColors[u.role] || "badge-info"}`}>{u.role}</span></td>
                    <td style={{ color: "var(--text-secondary)" }}>{u.phone || "—"}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never"}
                    </td>
                    <td>
                      <button
                        className={`badge ${u.isActive ? "badge-success" : "badge-danger"}`}
                        style={{ cursor: "pointer", border: "none", fontFamily: "inherit", fontSize: 11 }}
                        onClick={() => handleToggleActive(u)}
                        title={u.isActive ? "Click to deactivate" : "Click to activate"}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sm btn-secondary btn-icon" onClick={() => openEdit(u)} title="Edit"><MdEdit /></button>
                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(u._id)} title="Delete"><MdDelete /></button>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editUser ? "Edit User" : "Add New User"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              {error && <div className="auth-alert auth-alert-error" style={{ marginBottom: 16 }}>{error}</div>}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" placeholder="jane@luxurystay.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">{editUser ? "New Password (leave blank to keep)" : "Password *"}</label>
                  <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                    {roles.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="+1 555 000 0000" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22 }}>
                  <input type="checkbox" id="active-check" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                  <label htmlFor="active-check" style={{ cursor: "pointer" }}>Account Active</label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button id="btn-save-user" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editUser ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
