"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "../../components/protectedRoute";

const API_BASE_URL = "http://localhost:5000/notification";

function NotificationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
    if (daysLeft < 0)  return { border: "#ef4444", bg: "#fef2f2",  text: "#b91c1c", iconBg: "#fee2e2", iconStroke: "#ef4444" };
    if (daysLeft <= 1) return { border: "#f59e0b", bg: "#fffbeb",  text: "#b45309", iconBg: "#fef3c7", iconStroke: "#d97706" };
    if (daysLeft <= 7) return { border: "#84cc16", bg: "#f7fee7",  text: "#4d7c0f", iconBg: "#ecfccb", iconStroke: "#65a30d" };
    return               { border: "#3b82f6", bg: "#eff6ff",  text: "#1d4ed8", iconBg: "#dbeafe", iconStroke: "#2563eb" };
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
        map.set(key, {
          ...notif,
          docTypes: [notif.docType]
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.daysLeft - b.daysLeft);
  };

  const groupedNotifications = groupNotifications(notifications);

  return (
    <ProtectedRoute>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

          @keyframes nfFadeIn {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes nfCardIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
            min-height: 100vh;
            font-family: 'Inter', sans-serif;
          }

          /* ── Page ── */
          .nf-page {
            max-width: 920px;
            margin: 0 auto;
            padding: 120px 24px 60px;
            animation: nfFadeIn 0.5s ease both;
          }

          /* ── Header ── */
          .nf-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
            flex-wrap: wrap;
            gap: 14px;
          }

          .nf-title-wrap {
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .nf-title-icon {
            width: 52px;
            height: 52px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(59,130,246,0.35);
            flex-shrink: 0;
          }

          .nf-title-icon svg {
            width: 26px;
            height: 26px;
            stroke: #ffffff;
            fill: none;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .nf-title {
            font-size: 26px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: -0.5px;
            line-height: 1.2;
          }

          .nf-subtitle {
            font-size: 13px;
            color: #64748b;
            margin-top: 2px;
            font-weight: 400;
          }

          /* ── Back Button ── */
          .nf-back-btn {
            background: #ffffff;
            color: #475569;
            border: 1.5px solid #e2e8f0;
            padding: 10px 20px;
            border-radius: 11px;
            font-size: 14px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background 0.2s, border-color 0.2s, transform 0.15s;
            box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          }

          .nf-back-btn:hover {
            background: #f1f5f9;
            border-color: #cbd5e1;
            transform: translateY(-1px);
          }

          .nf-back-btn svg {
            width: 16px;
            height: 16px;
            stroke: #475569;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          /* ── Count Bar ── */
          .nf-count-bar {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            padding: 12px 18px;
            background: #ffffff;
            border-radius: 12px;
            border: 1.5px solid #e0f2fe;
            box-shadow: 0 2px 8px rgba(59,130,246,0.06);
          }

          .nf-count-bar svg {
            width: 15px;
            height: 15px;
            stroke: #3b82f6;
            fill: none;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .nf-count-text {
            font-size: 13.5px;
            font-weight: 600;
            color: #475569;
          }

          .nf-count-badge {
            margin-left: auto;
            font-size: 12px;
            font-weight: 700;
            color: #1e40af;
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            border: 1px solid #93c5fd;
            padding: 3px 11px;
            border-radius: 20px;
          }

          /* ── Notification Cards ── */
          .nf-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 22px 24px;
            box-shadow: 0 2px 8px rgba(59,130,246,0.06), 0 1px 3px rgba(0,0,0,0.04);
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            transition: transform 0.2s, box-shadow 0.2s;
            animation: nfCardIn 0.4s ease both;
            border: 1px solid #f1f5f9;
          }

          .nf-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(59,130,246,0.1), 0 2px 6px rgba(0,0,0,0.04);
          }

          /* ── Card Left ── */
          .nf-card-left {
            display: flex;
            align-items: center;
            gap: 18px;
            flex: 1;
            min-width: 0;
          }

          .nf-icon-circle {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .nf-icon-circle svg {
            width: 24px;
            height: 24px;
            fill: none;
            stroke-width: 1.7;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .nf-info-title {
            font-size: 17px;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 5px;
            letter-spacing: -0.2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .nf-info-subtitle {
            font-size: 13.5px;
            color: #64748b;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
          }

          .nf-type-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #94a3b8;
            display: inline-block;
            flex-shrink: 0;
          }

          .nf-doc-highlight {
            font-weight: 700;
            color: #475569;
          }

          /* ── Card Right ── */
          .nf-card-right {
            text-align: right;
            flex-shrink: 0;
          }

          .nf-expiry-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 14px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.2px;
            margin-bottom: 8px;
          }

          .nf-expiry-badge svg {
            width: 13px;
            height: 13px;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .nf-expiry-date {
            font-size: 12.5px;
            color: #94a3b8;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 5px;
          }

          .nf-expiry-date svg {
            width: 13px;
            height: 13px;
            stroke: #94a3b8;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          /* ── Loading / Error / Empty ── */
          .nf-state-box {
            text-align: center;
            padding: 72px 24px;
            background: #ffffff;
            border-radius: 18px;
            border: 1.5px solid #e2e8f0;
            box-shadow: 0 4px 20px rgba(59,130,246,0.06);
          }

          .nf-state-box svg {
            display: block;
            margin: 0 auto 16px;
          }

          .nf-state-box h3 {
            font-size: 19px;
            font-weight: 700;
            color: #475569;
            margin-bottom: 8px;
          }

          .nf-state-box p {
            font-size: 14px;
            color: #94a3b8;
            font-weight: 500;
          }

          .nf-loading-text {
            font-size: 15px;
            font-weight: 500;
            color: #64748b;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }

          .nf-loading-text svg {
            width: 18px;
            height: 18px;
            stroke: #3b82f6;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            animation: nfSpin 1s linear infinite;
          }

          @keyframes nfSpin { to { transform: rotate(360deg); } }

          .nf-error-box {
            text-align: center;
            padding: 40px 24px;
            background: #fef2f2;
            border-radius: 16px;
            border: 1.5px solid #fca5a5;
            color: #b91c1c;
            font-weight: 600;
            font-size: 14.5px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }

          .nf-error-box svg {
            width: 20px;
            height: 20px;
            stroke: #ef4444;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            flex-shrink: 0;
          }

          @media (max-width: 640px) {
            .nf-page { padding: 100px 15px 40px; }
            .nf-card { flex-direction: column; align-items: flex-start; }
            .nf-card-right { text-align: left; width: 100%; }
            .nf-expiry-date { justify-content: flex-start; }
            .nf-title { font-size: 20px; }
          }
        `}</style>

        <div className="nf-page">

          {/* ── Header ── */}
          <div className="nf-header">
            <div className="nf-title-wrap">
              <div className="nf-title-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
              </div>
              <div>
                <div className="nf-title">Alerts &amp; Notifications</div>
                <div className="nf-subtitle">Document expiry alerts for vehicles and drivers</div>
              </div>
            </div>

            <button className="nf-back-btn" onClick={() => router.back()}>
              <svg viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div className="nf-state-box">
              <div className="nf-loading-text">
                <svg viewBox="0 0 24 24">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Loading notifications...
              </div>
            </div>
          ) : error ? (
            <div className="nf-error-box">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          ) : groupedNotifications.length === 0 ? (
            <div className="nf-state-box">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <h3>You're all caught up!</h3>
              <p>There are no pending document expiries.</p>
            </div>
          ) : (
            <>
              {/* Count bar */}
              <div className="nf-count-bar">
                <svg viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                <span className="nf-count-text">Active alerts requiring attention</span>
                <span className="nf-count-badge">{groupedNotifications.length} alert{groupedNotifications.length !== 1 ? 's' : ''}</span>
              </div>

              <div>
                {groupedNotifications.map((notif, index) => {
                  const theme = getAlertTheme(notif.daysLeft);
                  const docsString = notif.docTypes.join(' & ');
                  const docSuffix = notif.docTypes.length > 1 ? 'Documents' : 'Document';
                  const isExpired = notif.daysLeft < 0;

                  return (
                    <div
                      key={`${notif.id}-${index}`}
                      className="nf-card"
                      style={{ borderLeft: `5px solid ${theme.border}` }}
                    >
                      {/* Left */}
                      <div className="nf-card-left">
                        <div className="nf-icon-circle" style={{ background: theme.iconBg }}>
                          {notif.type === 'Vehicle' ? (
                            <svg viewBox="0 0 24 24" style={{ stroke: theme.iconStroke }}>
                              <rect x="1" y="3" width="15" height="13" rx="1"/>
                              <path d="M16 8h4l3 3v5h-7V8z"/>
                              <circle cx="5.5" cy="18.5" r="2.5"/>
                              <circle cx="18.5" cy="18.5" r="2.5"/>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" style={{ stroke: theme.iconStroke }}>
                              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                              <circle cx="9" cy="7" r="4"/>
                              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                              <path d="M16 3.13a4 4 0 010 7.75"/>
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="nf-info-title">
                            {notif.type === 'Vehicle' ? toUpper(notif.entity) : capitalize(notif.entity)}
                          </div>
                          <div className="nf-info-subtitle">
                            {notif.type}
                            <span className="nf-type-dot" />
                            <span className="nf-doc-highlight">{docsString}</span>
                            &nbsp;{docSuffix}
                          </div>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="nf-card-right">
                        <div
                          className="nf-expiry-badge"
                          style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}
                        >
                          {isExpired ? (
                            <svg viewBox="0 0 24 24" style={{ stroke: theme.text }}>
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" y1="8" x2="12" y2="12"/>
                              <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" style={{ stroke: theme.text }}>
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                          )}
                          {notif.status}
                        </div>
                        <div className="nf-expiry-date">
                          <svg viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2"/>
                            <path d="M16 2v4M8 2v4M3 10h18"/>
                          </svg>
                          {new Date(notif.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </>
    </ProtectedRoute>
  );
}

export default function NotificationsPage() {
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
      <NotificationsContent />
    </Suspense>
  );
}