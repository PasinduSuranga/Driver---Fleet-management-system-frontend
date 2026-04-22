"use client";
// Main page component and its dependencies

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../components/adminNavbar";
import ProtectedRoute from "../../components/protectedRoute";

const API_BASE_URL = "http://localhost:5000/notification";

function AdminNotificationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Set up side effects on component mount or state change

  useEffect(() => {
    // Fetch data from API
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/allNotifications`);
        const data = await res.json();
        if (res.ok) {
          setNotifications(data);
        } else {
          setError(data.error || "Failed to load notifications.");
        }
      } catch (err) {
        setError("Network error. Could not reach the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getAlertTheme = (daysLeft) => {
    if (daysLeft < 0)  return { border: "#1e3a8a", bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", text: "#1e40af", iconBg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", iconStroke: "#1e40af", accent: "#1e3a8a" };
    if (daysLeft <= 1) return { border: "#1e40af", bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", text: "#1e40af", iconBg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", iconStroke: "#1e40af", accent: "#1e40af" };
    if (daysLeft <= 7) return { border: "#3b82f6", bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", text: "#1e40af", iconBg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", iconStroke: "#3b82f6", accent: "#3b82f6" };
    return { border: "#93c5fd", bg: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", text: "#1e40af", iconBg: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", iconStroke: "#3b82f6", accent: "#93c5fd" };
  };

  const capitalize = (str) => str ? str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "";
  const toUpper = (str) => str ? str.toUpperCase() : "";

  const groupNotifications = (notifs) => {
    const map = new Map();
    notifs.forEach(notif => {
      const key = `${notif.type}-${notif.entity}-${notif.daysLeft}`;
      if (map.has(key)) {
        const existing = map.get(key);
        if (!existing.docTypes.includes(notif.docType)) {
          existing.docTypes.push(notif.docType);
        }
      } else {
        map.set(key, { ...notif, docTypes: [notif.docType] });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.daysLeft - b.daysLeft);
  };

  const groupedNotifications = groupNotifications(notifications);

  // Render the component UI

  return (
    <ProtectedRoute>
      <div className="admin-layout">
        <Sidebar />
        <div className="admin-main">

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideIn {
              from { opacity: 0; transform: translateX(-20px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes cardIn {
              from { opacity: 0; transform: translateX(-16px); }
              to { opacity: 1; transform: translateX(0); }
            }

            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

            /* ── Layout ── */
            .admin-layout {
              display: flex;
              min-height: 100vh;
              font-family: 'Inter', sans-serif;
            }

            .admin-main {
              margin-left: 250px;
              min-height: 100vh;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
              display: flex;
              flex-direction: column;
              flex: 1;
            }

            @media (max-width: 768px) {
              .admin-main { margin-left: 220px; }
            }

            /* ── Page Container ── */
            .page-container {
              max-width: 900px;
              margin: 0 auto;
              padding: 40px 24px 60px;
              width: 100%;
              flex-grow: 1;
              animation: fadeIn 0.6s ease-out;
            }

            /* ── Page Header ── */
            .page-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              animation: slideIn 0.5s ease-out;
              flex-wrap: wrap;
              gap: 16px;
            }

            .title {
              font-size: 32px;
              font-weight: 800;
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              letter-spacing: -0.5px;
              display: flex;
              align-items: center;
              gap: 12px;
            }

            .title-icon {
              width: 44px;
              height: 44px;
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
              flex-shrink: 0;
            }

            .title-icon svg {
              width: 22px;
              height: 22px;
              stroke: #ffffff;
              fill: none;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            /* ── Back Button ── */
            .back-btn {
              padding: 12px 24px;
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              color: #ffffff;
              border: none;
              border-radius: 12px;
              font-size: 15px;
              font-weight: 600;
              font-family: 'Inter', sans-serif;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 8px;
              box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
              transition: all 0.3s;
            }

            .back-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
              background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
            }

            .back-btn svg {
              width: 16px;
              height: 16px;
              stroke: #ffffff;
              fill: none;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            /* ── Notification Card ── */
            .notification-card {
              background: #ffffff;
              border-radius: 16px;
              padding: 24px 28px;
              box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
              border: 1px solid #e0f2fe;
              margin-bottom: 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              transition: transform 0.2s, box-shadow 0.2s;
              animation: cardIn 0.4s ease both;
            }

            .notification-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 28px rgba(59, 130, 246, 0.15);
            }

            /* ── Card Left ── */
            .card-left {
              display: flex;
              align-items: center;
              gap: 20px;
            }

            .icon-circle {
              width: 54px;
              height: 54px;
              border-radius: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              border: 1px solid #bfdbfe;
            }

            .icon-circle svg {
              width: 24px;
              height: 24px;
              fill: none;
              stroke-width: 1.7;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            .info-title {
              font-size: 18px;
              font-weight: 800;
              color: #1e293b;
              margin-bottom: 5px;
              letter-spacing: -0.2px;
            }

            .info-subtitle {
              font-size: 14px;
              color: #64748b;
              font-weight: 500;
            }

            .doc-highlight {
              font-weight: 700;
              color: #1e40af;
            }

            .type-pill {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #3b82f6;
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              border: 1px solid #93c5fd;
              padding: 3px 8px;
              border-radius: 20px;
              margin-right: 6px;
            }

            /* ── Card Right ── */
            .card-right {
              text-align: right;
              flex-shrink: 0;
              margin-left: 20px;
            }

            .expiry-badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 700;
              letter-spacing: 0.3px;
              margin-bottom: 8px;
              border: 1px solid #93c5fd;
            }

            .expiry-badge svg {
              width: 12px;
              height: 12px;
              stroke: currentColor;
              fill: none;
              stroke-width: 2.2;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            .expiry-date {
              font-size: 12px;
              color: #94a3b8;
              font-weight: 600;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              gap: 5px;
            }

            .expiry-date svg {
              width: 13px;
              height: 13px;
              stroke: #94a3b8;
              fill: none;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            /* ── Loading State ── */
            .loading-state {
              text-align: center;
              padding: 80px 20px;
              color: #64748b;
              font-size: 15px;
              font-weight: 500;
              background: #ffffff;
              border-radius: 16px;
              border: 1px solid #e0f2fe;
              box-shadow: 0 8px 32px rgba(59, 130, 246, 0.08);
            }

            .loading-state svg {
              width: 42px;
              height: 42px;
              stroke: #bfdbfe;
              fill: none;
              stroke-width: 1.3;
              stroke-linecap: round;
              stroke-linejoin: round;
              margin: 0 auto 14px;
              display: block;
            }

            /* ── Error State ── */
            .error-state {
              text-align: center;
              padding: 48px 28px;
              background: #ffffff;
              border-radius: 16px;
              border: 1px solid #e0f2fe;
              box-shadow: 0 8px 32px rgba(59, 130, 246, 0.08);
            }

            .error-state-icon {
              width: 62px;
              height: 62px;
              border-radius: 50%;
              background: linear-gradient(135deg, #dbeafe, #bfdbfe);
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 16px;
            }

            .error-state-icon svg {
              width: 28px;
              height: 28px;
              stroke: #1e40af;
              fill: none;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            .error-state p {
              font-size: 15px;
              font-weight: 600;
              color: #1e40af;
            }

            /* ── Empty State ── */
            .empty-state {
              text-align: center;
              padding: 80px 20px;
              background: #ffffff;
              border-radius: 16px;
              border: 1px solid #e0f2fe;
              box-shadow: 0 8px 32px rgba(59, 130, 246, 0.08);
            }

            .empty-state-icon {
              width: 72px;
              height: 72px;
              border-radius: 50%;
              background: linear-gradient(135deg, #dbeafe, #bfdbfe);
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
            }

            .empty-state-icon svg {
              width: 32px;
              height: 32px;
              stroke: #1e40af;
              fill: none;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            .empty-state h3 {
              font-size: 20px;
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 8px;
            }

            .empty-state p {
              font-size: 14px;
              color: #94a3b8;
            }

            @media (max-width: 600px) {
              .notification-card { flex-direction: column; align-items: flex-start; gap: 16px; }
              .card-right { text-align: left; width: 100%; margin-left: 0; }
              .expiry-date { justify-content: flex-start; }
            }

            @media (max-width: 900px) {
              .page-container { padding: 24px 16px 40px; }
              .title { font-size: 24px; }
            }
          `}</style>

          <div className="page-container">

            {/* ── Page Header ── */}
            <div className="page-header">
              <h1 className="title">
                <div className="title-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 01-3.46 0"/>
                  </svg>
                </div>
                System Notifications
              </h1>
              <button className="back-btn" onClick={() => router.back()}>
                <svg viewBox="0 0 24 24">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
            </div>

            {/* ── Loading ── */}
            {loading && (
              <div className="loading-state">
                <svg viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                Loading Notifications...
              </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
              <div className="error-state">
                <div className="error-state-icon">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <p>{error}</p>
              </div>
            )}

            {/* ── Empty ── */}
            {!loading && !error && groupedNotifications.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3>You're all caught up!</h3>
                <p>There are no pending document expiries.</p>
              </div>
            )}

            {/* ── Notification Cards ── */}
            {!loading && !error && groupedNotifications.length > 0 && (
              <div>
                {groupedNotifications.map((notif, index) => {
                  const theme = getAlertTheme(notif.daysLeft);
                  const docsString = notif.docTypes.join(' & ');
                  const docSuffix = notif.docTypes.length > 1 ? 'Documents' : 'Document';

                  // Render the component UI

                  return (
                    <div
                      key={`${notif.id}-${index}`}
                      className="notification-card"
                      style={{ borderLeft: `5px solid ${theme.border}` }}
                    >
                      {/* ── Left ── */}
                      <div className="card-left">
                        <div className="icon-circle" style={{ background: theme.iconBg }}>
                          {notif.type === 'Vehicle' ? (
                            <svg viewBox="0 0 24 24" style={{ stroke: theme.iconStroke }}>
                              <rect x="1" y="3" width="15" height="13" rx="1"/>
                              <path d="M16 8h4l3 3v5h-7V8z"/>
                              <circle cx="5.5" cy="18.5" r="2.5"/>
                              <circle cx="18.5" cy="18.5" r="2.5"/>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" style={{ stroke: theme.iconStroke }}>
                              <circle cx="12" cy="8" r="4"/>
                              <path d="M20 21a8 8 0 10-16 0"/>
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="info-title">
                            {notif.type === 'Vehicle' ? toUpper(notif.entity) : capitalize(notif.entity)}
                          </div>
                          <div className="info-subtitle">
                            <span className="type-pill">
                              {notif.type === 'Vehicle' ? (
                                <svg style={{ width: 9, height: 9, stroke: 'currentColor', fill: 'none', strokeWidth: 2 }} viewBox="0 0 24 24">
                                  <rect x="1" y="3" width="15" height="13" rx="1"/>
                                  <path d="M16 8h4l3 3v5h-7V8z"/>
                                </svg>
                              ) : (
                                <svg style={{ width: 9, height: 9, stroke: 'currentColor', fill: 'none', strokeWidth: 2 }} viewBox="0 0 24 24">
                                  <circle cx="12" cy="8" r="4"/>
                                  <path d="M20 21a8 8 0 10-16 0"/>
                                </svg>
                              )}
                              {notif.type}
                            </span>
                            <span className="doc-highlight">{docsString}</span> {docSuffix}
                          </div>
                        </div>
                      </div>

                      {/* ── Right ── */}
                      <div className="card-right">
                        <div
                          className="expiry-badge"
                          style={{ background: theme.bg, color: theme.text, borderColor: theme.border }}
                        >
                          {notif.daysLeft < 0 ? (
                            <svg viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" y1="8" x2="12" y2="12"/>
                              <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                          )}
                          {notif.status}
                        </div>
                        <div className="expiry-date">
                          <svg viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          {new Date(notif.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AdminNotificationsPage() {
  // Render the component UI
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        color: '#64748b',
        fontSize: '16px',
        fontWeight: '500'
      }}>
        Loading...
      </div>
    }>
      <AdminNotificationsContent />
    </Suspense>
  );
}