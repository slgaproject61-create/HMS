import React, { useState, useEffect, useCallback } from "react";
import { MdLogin, MdLogout, MdSearch, MdClose, MdKey, MdRefresh } from "react-icons/md";
import api from "../api";

const tabs = ["Check-in", "Check-out"];

const CheckInOut = () => {
  const [activeTab, setActiveTab] = useState("Check-in");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null);
  const [form, setForm] = useState({ idVerified: false, keyIssued: false, notes: "", earlyCheckin: false });
  const [checkOutForm, setCheckOutForm] = useState({ notes: "", keyReturned: false });

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === "Check-in" ? "Confirmed" : "Checked-in";
      const params = { status: statusFilter };
      if (search) params.search = search;
      const { data } = await api.get("/reservations", { params });
      setReservations(data.data || []);
    } catch (err) {
      console.error("Failed to fetch reservations:", err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    const t = setTimeout(fetchReservations, 300);
    return () => clearTimeout(t);
  }, [fetchReservations]);

  const handleCheckIn = async () => {
    if (!selectedRes) return;
    setSaving(true);
    try {
      await api.put(`/reservations/${selectedRes._id}`, {
        status: "Checked-in",
        notes: (selectedRes.notes || "") + (form.notes ? `\nCheck-in: ${form.notes}` : ""),
      });
      setShowModal(false);
      setSelectedRes(null);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedRes) return;
    setSaving(true);
    try {
      await api.put(`/reservations/${selectedRes._id}`, {
        status: "Checked-out",
        notes: (selectedRes.notes || "") + (checkOutForm.notes ? `\nCheck-out: ${checkOutForm.notes}` : ""),
      });
      setShowCheckOut(false);
      setSelectedRes(null);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed");
    } finally {
      setSaving(false);
    }
  };

  const filtered = reservations.filter((r) =>
    r.guestName?.toLowerCase().includes(search.toLowerCase()) ||
    r.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.confirmationNo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Check-in / Check-out</h2>
          <p className="page-subtitle">Manage guest arrivals and departures smoothly</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-icon" onClick={fetchReservations} title="Refresh"><MdRefresh /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab${activeTab === tab ? " active" : ""}`}
            onClick={() => { setActiveTab(tab); setSearch(""); }}
          >
            {tab === "Check-in" ? <MdLogin style={{ marginRight: 5 }} /> : <MdLogout style={{ marginRight: 5 }} />}
            {tab}
          </button>
        ))}
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <MdSearch />
          <input
            className="search-input"
            placeholder="Search by guest name, room, or confirmation #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Confirmation #</th>
                <th>Guest Name</th>
                <th>Room #</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Guests</th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><div className="empty-state"><p>Loading…</p></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        {activeTab === "Check-in" ? <MdLogin /> : <MdLogout />}
                      </div>
                      <h3>No {activeTab === "Check-in" ? "Arrivals" : "Departures"} Today</h3>
                      <p>
                        {activeTab === "Check-in"
                          ? "Confirmed reservations awaiting check-in will appear here"
                          : "Checked-in guests awaiting check-out will appear here"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <span style={{ color: "var(--gold)", fontWeight: 600, fontFamily: "Outfit" }}>
                        {r.confirmationNo}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.guestName}</div>
                      {r.guestEmail && <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{r.guestEmail}</div>}
                    </td>
                    <td><strong>#{r.roomNumber}</strong></td>
                    <td style={{ fontSize: 12 }}>{r.checkIn?.split("T")[0]}</td>
                    <td style={{ fontSize: 12 }}>{r.checkOut?.split("T")[0]}</td>
                    <td>
                      {r.adults} adult{r.adults !== 1 ? "s" : ""}
                      {r.children > 0 ? `, ${r.children} child` : ""}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)", maxWidth: 150 }}>
                      {r.notes ? r.notes.slice(0, 60) + (r.notes.length > 60 ? "…" : "") : "—"}
                    </td>
                    <td>
                      {activeTab === "Check-in" ? (
                        <button
                          id={`btn-checkin-${r._id}`}
                          className="btn btn-sm btn-primary"
                          style={{ background: "var(--success)", borderColor: "var(--success)" }}
                          onClick={() => { setSelectedRes(r); setForm({ idVerified: false, keyIssued: false, notes: "", earlyCheckin: false }); setShowModal(true); }}
                        >
                          <MdLogin /> Check In
                        </button>
                      ) : (
                        <button
                          id={`btn-checkout-${r._id}`}
                          className="btn btn-sm btn-secondary"
                          onClick={() => { setSelectedRes(r); setCheckOutForm({ notes: "", keyReturned: false }); setShowCheckOut(true); }}
                        >
                          <MdLogout /> Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check-In Modal */}
      {showModal && selectedRes && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Check-in – {selectedRes.guestName}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div className="card" style={{ padding: "12px 16px", marginBottom: 16, background: "rgba(201,168,76,0.1)", border: "1px solid var(--gold)" }}>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  <div><span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Room</span><div style={{ fontWeight: 700, color: "var(--gold)", fontFamily: "Outfit" }}>#{selectedRes.roomNumber}</div></div>
                  <div><span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Confirmation</span><div style={{ fontWeight: 600 }}>{selectedRes.confirmationNo}</div></div>
                  <div><span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Check-out</span><div>{selectedRes.checkOut?.split("T")[0]}</div></div>
                  <div><span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Guests</span><div>{selectedRes.adults} adult{selectedRes.adults !== 1 ? "s" : ""}</div></div>
                </div>
              </div>
              <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" id="id-verified" checked={form.idVerified} onChange={(e) => setForm((f) => ({ ...f, idVerified: e.target.checked }))} />
                  <label htmlFor="id-verified" style={{ cursor: "pointer", fontWeight: 500 }}>ID Verified</label>
                </div>
                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" id="key-issued" checked={form.keyIssued} onChange={(e) => setForm((f) => ({ ...f, keyIssued: e.target.checked }))} />
                  <label htmlFor="key-issued" style={{ cursor: "pointer", fontWeight: 500 }}><MdKey style={{ verticalAlign: "middle" }} /> Key Issued</label>
                </div>
                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" id="early-checkin" checked={form.earlyCheckin} onChange={(e) => setForm((f) => ({ ...f, earlyCheckin: e.target.checked }))} />
                  <label htmlFor="early-checkin" style={{ cursor: "pointer", fontWeight: 500 }}>Early Check-in</label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" placeholder="Any notes for check-in..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                id="btn-confirm-checkin"
                className="btn btn-primary"
                style={{ background: "var(--success)", borderColor: "var(--success)" }}
                onClick={handleCheckIn}
                disabled={saving}
              >
                {saving ? "Processing…" : "Confirm Check-in"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-Out Modal */}
      {showCheckOut && selectedRes && (
        <div className="modal-overlay" onClick={() => setShowCheckOut(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Check-out – {selectedRes.guestName}</h3>
              <button className="modal-close" onClick={() => setShowCheckOut(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div className="card" style={{ padding: "12px 16px", marginBottom: 16, background: "rgba(99,102,241,0.1)", border: "1px solid #6366f1" }}>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  <div><span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Room</span><div style={{ fontWeight: 700, fontFamily: "Outfit" }}>#{selectedRes.roomNumber}</div></div>
                  <div><span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Guest</span><div style={{ fontWeight: 600 }}>{selectedRes.guestName}</div></div>
                  <div><span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Confirmation</span><div>{selectedRes.confirmationNo}</div></div>
                </div>
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <input type="checkbox" id="key-returned" checked={checkOutForm.keyReturned} onChange={(e) => setCheckOutForm((f) => ({ ...f, keyReturned: e.target.checked }))} />
                <label htmlFor="key-returned" style={{ cursor: "pointer", fontWeight: 500 }}><MdKey style={{ verticalAlign: "middle" }} /> Key Returned</label>
              </div>
              <div className="form-group">
                <label className="form-label">Departure Notes</label>
                <textarea className="form-textarea" placeholder="Any departure notes..." value={checkOutForm.notes} onChange={(e) => setCheckOutForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCheckOut(false)}>Cancel</button>
              <button
                id="btn-confirm-checkout"
                className="btn btn-primary"
                onClick={handleCheckOut}
                disabled={saving}
              >
                {saving ? "Processing…" : "Confirm Check-out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInOut;
