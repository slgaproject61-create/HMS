import React, { useState, useEffect, useCallback } from "react";
import { MdAdd, MdClose, MdSearch, MdReceipt, MdDelete, MdRefresh } from "react-icons/md";
import api from "../api";

const statusBadge = {
  Unpaid: "badge-warning",
  Paid: "badge-success",
  Partial: "badge-info",
  Refunded: "badge-danger",
  Void: "badge-danger",
};

const defaultForm = {
  guestName: "", roomNumber: "", checkIn: "", checkOut: "",
  items: [{ description: "Room Charge", quantity: 1, unitPrice: 0, total: 0 }],
  discount: 0, notes: "", status: "Unpaid", paymentMethod: ""
};

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== "All") params.status = filterStatus;
      if (search) params.search = search;
      const { data } = await api.get("/billing", { params });
      setBills(data.data || []);
    } catch (err) {
      console.error("Failed to fetch bills:", err.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => {
    const t = setTimeout(fetchBills, 300);
    return () => clearTimeout(t);
  }, [fetchBills]);

  const updateItem = (idx, field, val) => {
    setForm((f) => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: val };
      items[idx].total = (parseFloat(items[idx].quantity) || 0) * (parseFloat(items[idx].unitPrice) || 0);
      return { ...f, items };
    });
  };

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { description: "", quantity: 1, unitPrice: 0, total: 0 }] }));
  const removeItem = (idx) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const calcSummary = () => {
    const subtotal = form.items.reduce((s, i) => s + (parseFloat(i.total) || 0), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax - (parseFloat(form.discount) || 0);
    return { subtotal, tax, total };
  };

  const handleSave = async () => {
    if (!form.guestName) return setError("Guest name is required");
    if (!form.items.length) return setError("At least one item is required");
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post("/billing", form);
      setBills((bs) => [data, ...bs]);
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status, paymentMethod) => {
    try {
      const bill = bills.find((b) => b._id === id);
      const amountPaid = status === "Paid" ? bill.total : bill.amountPaid;
      const { data } = await api.put(`/billing/${id}`, { status, paymentMethod, amountPaid });
      setBills((bs) => bs.map((b) => (b._id === id ? data : b)));
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await api.delete(`/billing/${id}`);
      setBills((bs) => bs.filter((b) => b._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const { subtotal, tax, total } = calcSummary();

  const revenue = bills.filter((b) => b.status === "Paid").reduce((s, b) => s + (b.total || 0), 0);
  const outstanding = bills.filter((b) => b.status === "Unpaid").reduce((s, b) => s + (b.total || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Billing &amp; Invoices</h2>
          <p className="page-subtitle">Generate and manage guest billing and invoices</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-icon" onClick={fetchBills} title="Refresh"><MdRefresh /></button>
          <button id="btn-create-bill" className="btn btn-primary" onClick={() => { setForm(defaultForm); setError(""); setShowModal(true); }}>
            <MdAdd /> New Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total Invoices", value: bills.length },
          { label: "Paid Revenue", value: `$${revenue.toLocaleString()}`, color: "var(--success)" },
          { label: "Outstanding", value: `$${outstanding.toLocaleString()}`, color: "var(--warning)" },
          { label: "Paid Invoices", value: bills.filter((b) => b.status === "Paid").length },
        ].map((item) => (
          <div key={item.label} className="card" style={{ flex: "1 1 160px", padding: "14px 20px" }}>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 22, color: item.color || "var(--gold)" }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <MdSearch />
          <input id="billing-search" className="search-input" placeholder="Search by guest name or invoice #..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 140 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All Statuses</option>
          {Object.keys(statusBadge).map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Invoice #</th><th>Guest</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Total</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><div className="empty-state"><p>Loading…</p></div></td></tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><MdReceipt /></div>
                      <h3>No Invoices</h3>
                      <p>Create a new invoice to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr key={b._id}>
                    <td><span style={{ color: "var(--gold)", fontWeight: 600, fontFamily: "Outfit" }}>{b.invoiceNo}</span></td>
                    <td>{b.guestName}</td>
                    <td>{b.roomNumber ? `#${b.roomNumber}` : "—"}</td>
                    <td style={{ fontSize: 12 }}>{b.checkIn ? new Date(b.checkIn).toLocaleDateString() : "—"}</td>
                    <td style={{ fontSize: 12 }}>{b.checkOut ? new Date(b.checkOut).toLocaleDateString() : "—"}</td>
                    <td style={{ color: "var(--gold)", fontWeight: 700, fontFamily: "Outfit" }}>${(b.total || 0).toFixed(2)}</td>
                    <td>
                      <select
                        className="form-select"
                        style={{ width: 110, padding: "4px 8px", fontSize: 12 }}
                        value={b.status}
                        onChange={(e) => handleStatusChange(b._id, e.target.value, b.paymentMethod)}
                      >
                        {Object.keys(statusBadge).map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sm btn-secondary btn-icon" onClick={() => setShowInvoice(b)} title="View Invoice"><MdReceipt /></button>
                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(b._id)}><MdDelete /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Invoice Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h3 className="modal-title">New Invoice</h3>
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
                  <label className="form-label">Room Number</label>
                  <input className="form-input" placeholder="204" value={form.roomNumber} onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Check-in</label>
                  <input className="form-input" type="date" value={form.checkIn} onChange={(e) => setForm((f) => ({ ...f, checkIn: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Check-out</label>
                  <input className="form-input" type="date" value={form.checkOut} onChange={(e) => setForm((f) => ({ ...f, checkOut: e.target.value }))} />
                </div>
              </div>

              {/* Line Items */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label className="form-label" style={{ margin: 0 }}>Line Items</label>
                  <button className="btn btn-sm btn-secondary" onClick={addItem}><MdAdd /> Add Item</button>
                </div>
                {form.items.map((item, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 80px 100px 100px 36px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                    <input className="form-input" placeholder="Description" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} />
                    <input className="form-input" type="number" placeholder="Qty" min="1" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} />
                    <input className="form-input" type="number" placeholder="Unit $" value={item.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} />
                    <input className="form-input" readOnly value={`$${item.total.toFixed(2)}`} style={{ color: "var(--gold)", fontWeight: 600 }} />
                    {form.items.length > 1 && <button className="btn btn-sm btn-danger btn-icon" onClick={() => removeItem(idx)}><MdClose /></button>}
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ background: "var(--bg-glass)", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
                {[
                  { label: "Subtotal", value: `$${subtotal.toFixed(2)}` },
                  { label: "Tax (10%)", value: `$${tax.toFixed(2)}` },
                  { label: "Discount", value: <input className="form-input" type="number" style={{ width: 90 }} value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} /> },
                  { label: "Total", value: `$${total.toFixed(2)}`, bold: true },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{row.label}</span>
                    <span style={{ fontFamily: row.bold ? "Outfit" : undefined, fontWeight: row.bold ? 700 : 500, color: row.bold ? "var(--gold)" : undefined }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Payment notes..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button id="btn-save-bill" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Create Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {showInvoice && (
        <div className="modal-overlay" onClick={() => setShowInvoice(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 className="modal-title">Invoice {showInvoice.invoiceNo}</h3>
              <button className="modal-close" onClick={() => setShowInvoice(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{showInvoice.guestName}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Room #{showInvoice.roomNumber} · {showInvoice.checkIn ? new Date(showInvoice.checkIn).toLocaleDateString() : ""} → {showInvoice.checkOut ? new Date(showInvoice.checkOut).toLocaleDateString() : ""}</div>
              </div>
              {showInvoice.items?.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <span>{item.description} × {item.quantity}</span>
                  <span style={{ color: "var(--gold)", fontWeight: 600 }}>${(item.total || 0).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, padding: "12px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span>Subtotal</span><span>${(showInvoice.subtotal || 0).toFixed(2)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span>Tax</span><span>${(showInvoice.taxAmount || 0).toFixed(2)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontFamily: "Outfit", fontSize: 16, color: "var(--gold)" }}><span>Total</span><span>${(showInvoice.total || 0).toFixed(2)}</span></div>
              </div>
              <div style={{ marginTop: 8 }}>
                <span className={`badge ${statusBadge[showInvoice.status]}`}>{showInvoice.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
