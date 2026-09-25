import React, { useState, useEffect, useCallback } from "react";
import { MdSearch, MdDelete, MdStar, MdRefresh, MdClose, MdReply } from "react-icons/md";
import api from "../api";

const sentimentBadge = {
  Positive: "badge-success",
  Neutral: "badge-warning",
  Negative: "badge-danger",
};

const StarDisplay = ({ rating }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <MdStar key={i} style={{ color: i <= rating ? "var(--gold)" : "var(--border)", fontSize: 16 }} />
    ))}
  </div>
);

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSentiment, setFilterSentiment] = useState("All");
  const [showReply, setShowReply] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterSentiment !== "All") params.sentiment = filterSentiment;
      if (search) params.search = search;
      const { data } = await api.get("/feedback", { params });
      setFeedbacks(data.data || []);
    } catch (err) {
      console.error("Failed to fetch feedback:", err.message);
    } finally {
      setLoading(false);
    }
  }, [search, filterSentiment]);

  useEffect(() => {
    const t = setTimeout(fetchFeedback, 300);
    return () => clearTimeout(t);
  }, [fetchFeedback]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/feedback/${id}`);
      setFeedbacks((fs) => fs.filter((f) => f._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !showReply) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/feedback/${showReply._id}`, { response: replyText });
      setFeedbacks((fs) => fs.map((f) => (f._id === data._id ? data : f)));
      setShowReply(null);
      setReplyText("");
    } catch (err) {
      alert("Reply failed");
    } finally {
      setSaving(false);
    }
  };

  const avgRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((a, f) => a + f.overallRating, 0) / feedbacks.length).toFixed(1)
      : "—";

  const positive = feedbacks.filter((f) => f.sentiment === "Positive").length;
  const negative = feedbacks.filter((f) => f.sentiment === "Negative").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Guest Feedback</h2>
          <p className="page-subtitle">Monitor and respond to guest reviews and satisfaction</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-icon" onClick={fetchFeedback} title="Refresh"><MdRefresh /></button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Average Rating", value: avgRating ? `⭐ ${avgRating}` : "—", color: "var(--gold)" },
          { label: "Total Reviews", value: feedbacks.length },
          { label: "Positive", value: positive, color: "var(--success)" },
          { label: "Negative", value: negative, color: "var(--danger)" },
        ].map((item) => (
          <div key={item.label} className="card" style={{ flex: "1 1 140px", padding: "14px 20px" }}>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 22, color: item.color || "var(--text-primary)" }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <MdSearch />
          <input
            className="search-input"
            placeholder="Search by guest name or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" style={{ width: 140 }} value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value)}>
          <option value="All">All Sentiment</option>
          <option>Positive</option>
          <option>Neutral</option>
          <option>Negative</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading…</p></div>
      ) : feedbacks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <h3>No Feedback Yet</h3>
          <p>Guest reviews will appear here once submitted</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {feedbacks.map((f) => (
            <div key={f._id} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="user-avatar" style={{ width: 36, height: 36, fontSize: 13, background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    {f.guestName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{f.guestName}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : ""}
                      {f.reservationNo ? ` · ${f.reservationNo}` : ""}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <StarDisplay rating={f.overallRating} />
                  <span className={`badge ${sentimentBadge[f.sentiment]}`}>{f.sentiment}</span>
                  <button
                    className="btn btn-sm btn-secondary btn-icon"
                    title="Reply"
                    onClick={() => { setShowReply(f); setReplyText(f.response || ""); }}
                  >
                    <MdReply />
                  </button>
                  <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(f._id)}><MdDelete /></button>
                </div>
              </div>

              {/* Category Ratings */}
              {f.ratings && (
                <div style={{ display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
                  {Object.entries(f.ratings).map(([key, val]) => (
                    <div key={key} style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      <span style={{ textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, " $1")}</span>:&nbsp;
                      <span style={{ color: "var(--gold)", fontWeight: 600 }}>{"★".repeat(val)}</span>
                    </div>
                  ))}
                </div>
              )}

              {f.comment && (
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: f.response ? 10 : 0 }}>
                  "{f.comment}"
                </p>
              )}

              {f.response && (
                <div style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, padding: "10px 14px", marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, marginBottom: 4 }}>
                    Staff Response {f.respondedBy ? `· ${f.respondedBy}` : ""}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{f.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {showReply && (
        <div className="modal-overlay" onClick={() => setShowReply(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reply to {showReply.guestName}</h3>
              <button className="modal-close" onClick={() => setShowReply(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                "{showReply.comment}"
              </p>
              <div className="form-group">
                <label className="form-label">Your Response</label>
                <textarea
                  className="form-textarea"
                  placeholder="Write a professional response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReply(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleReply} disabled={saving}>
                {saving ? "Sending…" : "Send Response"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
