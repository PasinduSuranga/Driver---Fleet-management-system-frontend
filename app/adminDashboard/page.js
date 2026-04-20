"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../components/adminNavbar";
import ProtectedRoute from "../../components/protectedRoute";

const API_BASE_URL = "http://localhost:5000/admin";

// --- CUSTOM ALERT DIALOG COMPONENT ---
const AlertDialog = ({ isOpen, title, message, onClose, type }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-icon">
          {type === "error" ? (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          )}
        </div>
        <h3 className="msg-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <button className="msg-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dialog, setDialog] = useState({ isOpen: false, type: "", title: "", message: "" });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/stats`);
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      } else {
        setDialog({ isOpen: true, type: "error", title: "Error", message: data.error || "Failed to load dashboard statistics." });
      }
    } catch (err) {
      setDialog({ isOpen: true, type: "error", title: "Network Error", message: "Could not reach the server." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const capitalize = (str) => str ? str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "";
  const toUpper = (str) => str ? str.toUpperCase() : "";

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
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes modalPop {
              from { opacity: 0; transform: scale(0.88) translateY(16px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
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
              max-width: 1400px;
              margin: 0 auto;
              padding: 40px 24px 60px;
              width: 100%;
              flex-grow: 1;
              animation: fadeIn 0.6s ease-out;
            }

            /* ── Page Header ── */
            .page-header {
              margin-bottom: 30px;
              animation: slideIn 0.5s ease both;
            }

            .title {
              font-size: 32px;
              font-weight: 800;
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              letter-spacing: -0.5px;
            }

            .subtitle {
              font-size: 14px;
              color: #64748b;
              font-weight: 500;
              margin-top: 6px;
              display: flex;
              align-items: center;
              gap: 6px;
            }

            .subtitle svg {
              width: 14px;
              height: 14px;
              stroke: #3b82f6;
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

            /* ── KPI Grid ── */
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
              gap: 20px;
              margin-bottom: 28px;
            }

            .kpi-card {
              background: #ffffff;
              border-radius: 16px;
              padding: 24px;
              border: 1px solid #e0f2fe;
              box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
              display: flex;
              align-items: center;
              gap: 20px;
              transition: transform 0.2s, box-shadow 0.2s;
              animation: cardIn 0.5s ease both;
            }

            .kpi-card:hover {
              transform: translateY(-3px);
              box-shadow: 0 12px 36px rgba(59, 130, 246, 0.16);
            }

            .kpi-icon {
              width: 56px;
              height: 56px;
              border-radius: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              border: 1px solid #93c5fd;
            }

            .kpi-icon svg {
              width: 24px;
              height: 24px;
              stroke: #1e40af;
              fill: none;
              stroke-width: 1.8;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            .kpi-icon.kpi-secondary {
              background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
              border-color: #bfdbfe;
            }

            .kpi-icon.kpi-secondary svg { stroke: #3b82f6; }

            .kpi-info {
              display: flex;
              flex-direction: column;
            }

            .kpi-value {
              font-size: 28px;
              font-weight: 800;
              color: #1e293b;
              line-height: 1.2;
              letter-spacing: -0.5px;
            }

            .kpi-sub {
              font-size: 15px;
              color: #94a3b8;
              font-weight: 600;
              margin-left: 4px;
            }

            .kpi-label {
              font-size: 12px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              margin-top: 4px;
            }

            /* ── Split Layout ── */
            .split-layout {
              display: grid;
              grid-template-columns: 2fr 1fr;
              gap: 24px;
              margin-bottom: 28px;
            }

            @media (max-width: 1024px) {
              .split-layout { grid-template-columns: 1fr; }
            }

            /* ── Panel ── */
            .panel {
              background: #ffffff;
              border-radius: 16px;
              border: 1px solid #e0f2fe;
              box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
              overflow: hidden;
              display: flex;
              flex-direction: column;
              animation: cardIn 0.6s ease both;
            }

            .panel-header {
              padding: 18px 24px;
              border-bottom: 1px solid #e0f2fe;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              font-size: 16px;
              font-weight: 700;
              color: #1e293b;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
            }

            .panel-header-left {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .panel-header-left svg {
              width: 18px;
              height: 18px;
              stroke: #1e40af;
              fill: none;
              stroke-width: 1.8;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            .view-all-btn {
              background: transparent;
              border: none;
              color: #1e40af;
              font-weight: 600;
              font-family: 'Inter', sans-serif;
              font-size: 13px;
              cursor: pointer;
              padding: 6px 12px;
              border-radius: 8px;
              transition: background 0.2s;
              display: flex;
              align-items: center;
              gap: 4px;
            }

            .view-all-btn:hover { background: #dbeafe; }

            .view-all-btn svg {
              width: 14px;
              height: 14px;
              stroke: #1e40af;
              fill: none;
              stroke-width: 2.5;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            /* ── Table ── */
            .table-wrap { overflow-x: auto; }

            table {
              width: 100%;
              border-collapse: collapse;
              text-align: left;
            }

            th {
              background: #f8fafc;
              padding: 13px 20px;
              font-size: 12px;
              font-weight: 700;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #e0f2fe;
              white-space: nowrap;
            }

            td {
              padding: 14px 20px;
              border-bottom: 1px solid #f0f9ff;
              font-size: 14px;
              color: #1e293b;
              vertical-align: middle;
            }

            tbody tr:last-child td { border-bottom: none; }
            tbody tr { transition: background 0.15s; }
            tbody tr:hover td { background: #f0f9ff; }

            .status-badge {
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              color: #1e40af;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 700;
              border: 1px solid #93c5fd;
              display: inline-flex;
              align-items: center;
              gap: 6px;
            }

            .status-dot {
              width: 7px;
              height: 7px;
              background: #1e40af;
              border-radius: 50%;
              flex-shrink: 0;
            }

            .empty-dispatch {
              text-align: center;
              padding: 48px 20px;
              color: #94a3b8;
              font-size: 14px;
            }

            .empty-dispatch svg {
              width: 40px;
              height: 40px;
              stroke: #bfdbfe;
              fill: none;
              stroke-width: 1.3;
              stroke-linecap: round;
              stroke-linejoin: round;
              margin: 0 auto 10px;
              display: block;
            }

            /* ── Quick Links ── */
            .quick-links-grid {
              padding: 16px;
              display: grid;
              grid-template-columns: 1fr;
              gap: 10px;
            }

            .quick-link-card {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 14px 18px;
              background: #f8fafc;
              border: 2px solid #e0f2fe;
              border-radius: 12px;
              cursor: pointer;
              transition: all 0.2s;
              text-decoration: none;
              color: #1e293b;
            }

            .quick-link-card:hover {
              background: #f0f9ff;
              border-color: #93c5fd;
              transform: translateX(4px);
              box-shadow: 0 4px 14px rgba(59, 130, 246, 0.12);
            }

            .link-left {
              display: flex;
              align-items: center;
              gap: 14px;
            }

            .link-icon {
              width: 36px;
              height: 36px;
              border-radius: 10px;
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              border: 1px solid #93c5fd;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }

            .link-icon svg {
              width: 16px;
              height: 16px;
              stroke: #1e40af;
              fill: none;
              stroke-width: 1.8;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            .link-text {
              font-weight: 600;
              font-size: 14px;
              color: #1e293b;
            }

            .chevron-icon {
              width: 16px;
              height: 16px;
              stroke: #94a3b8;
              fill: none;
              stroke-width: 2.5;
              stroke-linecap: round;
              stroke-linejoin: round;
              transition: stroke 0.2s;
              flex-shrink: 0;
            }

            .quick-link-card:hover .chevron-icon { stroke: #1e40af; }

            /* ── Watchlist / Alert Banners ── */
            .watchlist-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
            }

            .alert-banner {
              display: flex;
              align-items: center;
              gap: 16px;
              padding: 20px 24px;
              background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%);
              border: 1px solid #93c5fd;
              border-left: 5px solid #1e40af;
              border-radius: 14px;
              animation: cardIn 0.7s ease both;
              transition: box-shadow 0.2s;
            }

            .alert-banner:hover {
              box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
            }

            .alert-icon {
              width: 44px;
              height: 44px;
              background: linear-gradient(135deg, #dbeafe, #bfdbfe);
              border: 1px solid #93c5fd;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }

            .alert-icon svg {
              width: 20px;
              height: 20px;
              stroke: #1e40af;
              fill: none;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            .alert-text h4 {
              font-size: 15px;
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 3px;
            }

            .alert-text p {
              font-size: 13px;
              color: #475569;
              margin: 0;
              line-height: 1.5;
            }

            .alert-text strong { color: #1e40af; }

            /* ── Route arrow ── */
            .route-arrow {
              width: 12px;
              height: 12px;
              stroke: #94a3b8;
              fill: none;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-linejoin: round;
              vertical-align: middle;
              margin: 0 3px;
            }

            /* ── Modal Overlay ── */
            .modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(30, 64, 175, 0.15);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              backdrop-filter: blur(8px);
              animation: fadeIn 0.3s ease-out;
            }

            /* ── Dialog ── */
            .modal-content {
              background: #ffffff;
              border-radius: 16px;
              padding: 30px;
              width: 100%;
              max-width: 440px;
              text-align: center;
              box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25);
              border: 1px solid #e0f2fe;
              animation: modalPop 0.4s ease-out both;
              font-family: 'Inter', sans-serif;
            }

            .modal-icon {
              width: 62px;
              height: 62px;
              border-radius: 50%;
              background: linear-gradient(135deg, #dbeafe, #bfdbfe);
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 18px;
            }

            .modal-icon svg {
              width: 28px;
              height: 28px;
              stroke: #1e40af;
              fill: none;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            .msg-title {
              font-size: 22px;
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 10px;
            }

            .modal-message {
              font-size: 15px;
              color: #64748b;
              line-height: 1.6;
              margin-bottom: 4px;
            }

            .msg-btn {
              margin-top: 24px;
              padding: 12px 28px;
              font-size: 15px;
              font-weight: 600;
              font-family: 'Inter', sans-serif;
              color: #ffffff;
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              border: none;
              border-radius: 10px;
              cursor: pointer;
              width: 100%;
              box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
              transition: all 0.3s;
            }

            .msg-btn:hover {
              background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            }

            @media (max-width: 900px) {
              .page-container { padding: 24px 16px 40px; }
              .title { font-size: 24px; }
              .kpi-grid { grid-template-columns: 1fr 1fr; }
            }

            @media (max-width: 560px) {
              .kpi-grid { grid-template-columns: 1fr; }
            }
          `}</style>

          <div className="page-container">

            {/* ── Page Header ── */}
            <div className="page-header">
              <h1 className="title">Command Center</h1>
              <p className="subtitle">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Real-time operational overview
              </p>
            </div>

            {/* ── Loading ── */}
            {loading && (
              <div className="loading-state">
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Loading Dashboard...
              </div>
            )}

            {/* ── Dashboard Content ── */}
            {!loading && stats && (
              <>
                {/* ── ROW 1: KPI Cards ── */}
                <div className="kpi-grid">

                  {/* Live Trips */}
                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <div className="kpi-info">
                      <span className="kpi-value">{stats.ongoingCount}</span>
                      <span className="kpi-label">Live Trips</span>
                    </div>
                  </div>

                  {/* Available Vehicles */}
                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <svg viewBox="0 0 24 24">
                        <rect x="1" y="3" width="15" height="13" rx="1"/>
                        <path d="M16 8h4l3 3v5h-7V8z"/>
                        <circle cx="5.5" cy="18.5" r="2.5"/>
                        <circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                    </div>
                    <div className="kpi-info">
                      <span className="kpi-value">
                        {stats.availableVehicles}
                        <span className="kpi-sub">/ {stats.totalVehicles}</span>
                      </span>
                      <span className="kpi-label">Available Vehicles</span>
                    </div>
                  </div>

                  {/* Available Drivers */}
                  <div className="kpi-card">
                    <div className="kpi-icon kpi-secondary">
                      <svg viewBox="0 0 24 24">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                        <path d="M16 3.13a4 4 0 010 7.75"/>
                      </svg>
                    </div>
                    <div className="kpi-info">
                      <span className="kpi-value">
                        {stats.availableDrivers}
                        <span className="kpi-sub">/ {stats.totalDrivers}</span>
                      </span>
                      <span className="kpi-label">Available Drivers</span>
                    </div>
                  </div>

                  {/* Pending Users */}
                  <div className="kpi-card">
                    <div className="kpi-icon kpi-secondary">
                      <svg viewBox="0 0 24 24">
                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/>
                        <line x1="23" y1="11" x2="17" y2="11"/>
                      </svg>
                    </div>
                    <div className="kpi-info">
                      <span className="kpi-value">{stats.pendingUsers}</span>
                      <span className="kpi-label">Pending Users</span>
                    </div>
                  </div>
                </div>

                {/* ── ROW 2: Split Layout ── */}
                <div className="split-layout">

                  {/* Left: Active Dispatch */}
                  <div className="panel">
                    <div className="panel-header">
                      <div className="panel-header-left">
                        <svg viewBox="0 0 24 24">
                          <rect x="1" y="3" width="15" height="13" rx="1"/>
                          <path d="M16 8h4l3 3v5h-7V8z"/>
                          <circle cx="5.5" cy="18.5" r="2.5"/>
                          <circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                        Today's Active Dispatch
                      </div>
                      <button
                        className="view-all-btn"
                        onClick={() => router.push(`/adminCurrentTrips?userId=${userId}`)}
                      >
                        View All
                        <svg viewBox="0 0 24 24">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Driver & Vehicle</th>
                            <th>Route</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.activeDispatch.length === 0 ? (
                            <tr>
                              <td colSpan="4">
                                <div className="empty-dispatch">
                                  <svg viewBox="0 0 24 24">
                                    <rect x="1" y="3" width="15" height="13" rx="1"/>
                                    <path d="M16 8h4l3 3v5h-7V8z"/>
                                    <circle cx="5.5" cy="18.5" r="2.5"/>
                                    <circle cx="18.5" cy="18.5" r="2.5"/>
                                  </svg>
                                  No active trips right now.
                                </div>
                              </td>
                            </tr>
                          ) : (
                            stats.activeDispatch.map((trip) => (
                              <tr key={trip.assignment_id}>
                                <td style={{ fontWeight: 600 }}>{capitalize(trip.company_name)}</td>
                                <td>
                                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{capitalize(trip.driver_name)}</span>
                                  <br/>
                                  <span style={{ fontSize: 12, color: '#64748b' }}>{toUpper(trip.vehicle_number)}</span>
                                </td>
                                <td style={{ color: '#475569', fontSize: 13 }}>
                                  {capitalize(trip.start_location)}
                                  <svg className="route-arrow" viewBox="0 0 24 24">
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                    <polyline points="12 5 19 12 12 19"/>
                                  </svg>
                                  {capitalize(trip.end_location)}
                                </td>
                                <td>
                                  <span className="status-badge">
                                    <span className="status-dot" />
                                    In Transit
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right: Quick Navigation */}
                  <div className="panel">
                    <div className="panel-header">
                      <div className="panel-header-left">
                        <svg viewBox="0 0 24 24">
                          <rect x="3" y="3" width="7" height="7"/>
                          <rect x="14" y="3" width="7" height="7"/>
                          <rect x="14" y="14" width="7" height="7"/>
                          <rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        Quick Management
                      </div>
                    </div>
                    <div className="quick-links-grid">

                      <div className="quick-link-card" onClick={() => router.push(`/adminNotifications?userId=${userId}`)}>
                        <div className="link-left">
                          <div className="link-icon">
                            <svg viewBox="0 0 24 24">
                              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                              <path d="M13.73 21a2 2 0 01-3.46 0"/>
                            </svg>
                          </div>
                          <span className="link-text">Alerts & Notifications</span>
                        </div>
                        <svg className="chevron-icon" viewBox="0 0 24 24">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>

                      <div className="quick-link-card" onClick={() => router.push(`/adminVehiclesDashboard?userId=${userId}`)}>
                        <div className="link-left">
                          <div className="link-icon">
                            <svg viewBox="0 0 24 24">
                              <rect x="1" y="3" width="15" height="13" rx="1"/>
                              <path d="M16 8h4l3 3v5h-7V8z"/>
                              <circle cx="5.5" cy="18.5" r="2.5"/>
                              <circle cx="18.5" cy="18.5" r="2.5"/>
                            </svg>
                          </div>
                          <span className="link-text">Manage Vehicles</span>
                        </div>
                        <svg className="chevron-icon" viewBox="0 0 24 24">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>

                      <div className="quick-link-card" onClick={() => router.push(`/adminDriversDashboard?userId=${userId}`)}>
                        <div className="link-left">
                          <div className="link-icon">
                            <svg viewBox="0 0 24 24">
                              <circle cx="12" cy="8" r="4"/>
                              <path d="M20 21a8 8 0 10-16 0"/>
                            </svg>
                          </div>
                          <span className="link-text">Manage Drivers</span>
                        </div>
                        <svg className="chevron-icon" viewBox="0 0 24 24">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>

                      <div className="quick-link-card" onClick={() => router.push(`/adminCustomersDashboard?userId=${userId}`)}>
                        <div className="link-left">
                          <div className="link-icon">
                            <svg viewBox="0 0 24 24">
                              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                              <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                          </div>
                          <span className="link-text">Manage Customers</span>
                        </div>
                        <svg className="chevron-icon" viewBox="0 0 24 24">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>

                      <div className="quick-link-card" onClick={() => router.push(`/adminUsers?userId=${userId}`)}>
                        <div className="link-left">
                          <div className="link-icon">
                            <svg viewBox="0 0 24 24">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                          </div>
                          <span className="link-text">Approve Users</span>
                        </div>
                        <svg className="chevron-icon" viewBox="0 0 24 24">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>

                    </div>
                  </div>
                </div>

                {/* ── ROW 3: Watchlist ── */}
                {(stats.blacklistedVehicles > 0 || stats.blacklistedDrivers > 0) && (
                  <div className="watchlist-grid">
                    {stats.blacklistedVehicles > 0 && (
                      <div className="alert-banner">
                        <div className="alert-icon">
                          <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                          </svg>
                        </div>
                        <div className="alert-text">
                          <h4>Blacklisted Vehicles Alert</h4>
                          <p>You have <strong>{stats.blacklistedVehicles}</strong> vehicle(s) currently suspended.</p>
                        </div>
                      </div>
                    )}
                    {stats.blacklistedDrivers > 0 && (
                      <div className="alert-banner">
                        <div className="alert-icon">
                          <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                          </svg>
                        </div>
                        <div className="alert-text">
                          <h4>Blacklisted Drivers Alert</h4>
                          <p>You have <strong>{stats.blacklistedDrivers}</strong> driver(s) currently suspended.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Global Dialog ── */}
          <AlertDialog
            isOpen={dialog.isOpen}
            type={dialog.type}
            title={dialog.title}
            message={dialog.message}
            onClose={() => setDialog({ ...dialog, isOpen: false })}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AdminDashboard() {
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
      <AdminDashboardContent />
    </Suspense>
  );
}