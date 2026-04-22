"use client";
// Main page component and its dependencies

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../components/adminNavbar";
import ProtectedRoute from "../../components/protectedRoute";

const API_BASE_URL = "http://localhost:5000/assignment";

// --- CUSTOM ALERT DIALOG COMPONENT ---
const AlertDialog = ({ isOpen, title, message, onClose, onConfirm, type }) => {
  if (!isOpen) return null;
  // Render the component UI
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
        <div className="msg-title">{title}</div>
        <p className="modal-message">{message}</p>
        <button
          className="msg-btn"
          onClick={() => { onClose(); if (onConfirm) onConfirm(); }}>
          OK
        </button>
      </div>
    </div>
  );
};

function AdminTripsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";

  const [activeTab, setActiveTab] = useState("ongoing");
  const [ongoingJobs, setOngoingJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [cancelledJobs, setCancelledJobs] = useState([]); // <-- ADDED

  const [dialog, setDialog] = useState({ isOpen: false, type: "", title: "", message: "", onConfirm: null });

  const [ongoingSearch, setOngoingSearch] = useState("");
  const [completedSearch, setCompletedSearch] = useState("");
  const [completedMonth, setCompletedMonth] = useState("");
  const [cancelledSearch, setCancelledSearch] = useState(""); // <-- ADDED
  const [cancelledMonth, setCancelledMonth] = useState(""); // <-- ADDED

  const showAlert = (type, title, message, onConfirm = null) => {
    setDialog({ isOpen: true, type, title, message, onConfirm });
  };

  // Fetch data from API

  const fetchOngoing = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/ongoing`);
      const data = await res.json();
      if (!res.ok) return showAlert("error", "Error", data.error || "Failed to load ongoing assignments.");
      setOngoingJobs(Array.isArray(data) ? data : []);
    } catch (err) { showAlert("error", "Error", "Failed to load ongoing assignments."); }
  };

  // Fetch data from API

  const fetchCompleted = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/completed`);
      const data = await res.json();
      if (!res.ok) return showAlert("error", "Error", data.error || "Failed to load completed assignments.");
      setCompletedJobs(Array.isArray(data) ? data : []);
    } catch (err) { showAlert("error", "Error", "Failed to load completed assignments."); }
  };

  // --- ADDED FETCH FUNCTION FOR CANCELLED ---
  // Fetch data from API
  const fetchCancelled = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/cancelled`);
      const data = await res.json();
      if (!res.ok) return showAlert("error", "Error", data.error || "Failed to load cancelled assignments.");
      setCancelledJobs(Array.isArray(data) ? data : []);
    } catch (err) { showAlert("error", "Error", "Failed to load cancelled assignments."); }
  };

  // Set up side effects on component mount or state change

  useEffect(() => {
    if (activeTab === "ongoing") fetchOngoing();
    else if (activeTab === "completed") fetchCompleted();
    else if (activeTab === "cancelled") fetchCancelled(); // <-- ADDED
  }, [activeTab]);

  const filteredOngoing = ongoingJobs.filter(job => {
    const q = ongoingSearch.toLowerCase();
    return !q ||
      (job.vehicle_number || '').toLowerCase().includes(q) ||
      (job.driver_name || '').toLowerCase().includes(q) ||
      (job.company_name || '').toLowerCase().includes(q);
  });

  const filteredCompleted = completedJobs.filter(job => {
    const q = completedSearch.toLowerCase();
    const matchSearch = !q ||
      (job.vehicle_number || '').toLowerCase().includes(q) ||
      (job.driver_name || '').toLowerCase().includes(q) ||
      (job.company_name || '').toLowerCase().includes(q);
    const matchMonth = !completedMonth ||
      new Date(job.est_e_TD).toISOString().slice(0, 7) === completedMonth;
    return matchSearch && matchMonth;
  });

  // --- ADDED FILTER LOGIC FOR CANCELLED ---
  const filteredCancelled = cancelledJobs.filter(job => {
    const q = cancelledSearch.toLowerCase();
    const matchSearch = !q ||
      (job.vehicle_number || '').toLowerCase().includes(q) ||
      (job.driver_name || '').toLowerCase().includes(q) ||
      (job.company_name || '').toLowerCase().includes(q);
    const matchMonth = !cancelledMonth ||
      new Date(job.est_s_TD).toISOString().slice(0, 7) === cancelledMonth;
    return matchSearch && matchMonth;
  });

  const handleCancelAssignment = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/cancel/${id}`, { method: "PUT" });
      const data = await res.json();
      if (res.ok) {
        showAlert("success", "Success", data.message, fetchOngoing);
      } else {
        showAlert("error", "Error", data.error);
      }
    } catch (err) {
      showAlert("error", "Error", "Failed to cancel assignment.");
    }
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const toUpper = (str) => {
    if (!str) return "";
    return str.toUpperCase();
  };

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
          .dashboard-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            width: 100%;
            flex-grow: 1;
          }

          /* ── Header ── */
          .dash-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            animation: slideIn 0.5s ease both;
          }

          .dash-title {
            font-size: 32px;
            font-weight: 800;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
          }

          /* ── Tabs ── */
          .tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            border-bottom: 2px solid #bfdbfe;
            padding-bottom: 0;
            flex-wrap: wrap;
          }

          .tab-btn {
            background: transparent;
            border: none;
            font-size: 15px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            color: #64748b;
            padding: 12px 20px;
            cursor: pointer;
            border-radius: 10px 10px 0 0;
            transition: background 0.2s, color 0.2s;
            position: relative;
            bottom: -2px;
            border-bottom: 2px solid transparent;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
          }

          .tab-btn svg {
            width: 15px;
            height: 15px;
            stroke: currentColor;
            fill: none;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .tab-btn.active {
            background: #ffffff;
            color: #1e40af;
            border-bottom: 2px solid #ffffff;
            box-shadow: 0 -4px 12px rgba(59, 130, 246, 0.08);
          }

          .tab-btn:hover:not(.active) {
            background: #f0f9ff;
            color: #1e40af;
          }

          /* ── Card ── */
          .card {
            background: #ffffff;
            border-radius: 16px;
            padding: 28px;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
            border: 1px solid #e0f2fe;
            animation: fadeIn 0.5s ease both;
            overflow-x: auto;
          }

          /* ── Table ── */
          /* 1. The Table Setup */
          .data-table {
            width: 100%;
            /* CRITICAL CHANGE: Must be 'separate' for border-radius to work on cells */
            border-collapse: separate; 
            border-spacing: 0;
            text-align: left;
          }

          /* 2. Round the TOP corners (Header) */
          .data-table thead tr:first-child th:first-child {
            border-top-left-radius: 16px;
          }
          .data-table thead tr:first-child th:last-child {
            border-top-right-radius: 16px;
          }

          /* 3. Round the BOTTOM corners (Body) */
          .data-table tbody tr:last-child td:first-child {
            border-bottom-left-radius: 16px;
          }
          .data-table tbody tr:last-child td:last-child {
            border-bottom-right-radius: 16px;
          }

          /* 4. Keep corners round when hovering over the last row (if you use row hovers) */
          .data-table tbody tr:last-child:hover td:first-child {
            border-bottom-left-radius: 16px;
          }
          .data-table tbody tr:last-child:hover td:last-child {
            border-bottom-right-radius: 16px;
          }

          .data-table thead tr {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          }

          .data-table th {
            padding: 16px 18px;
            color: #ffffff;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
          }

          .data-table td {
            padding: 16px 18px;
            border-bottom: 1px solid #f0f9ff;
            color: #1e293b;
            font-size: 14px;
            vertical-align: middle;
          }

          .data-table tbody tr:last-child td { border-bottom: none; }

          .data-table tbody tr {
            transition: background 0.2s;
          }

          .data-table tbody tr:hover td { background: #f0f9ff; }

          /* ── Cancel Button ── */
          .cancel-action-btn {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: #ffffff;
            border: none;
            padding: 9px 16px;
            border-radius: 9px;
            font-size: 13px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            transition: all 0.3s;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
          }

          .cancel-action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35);
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          }

          .cancel-action-btn svg {
            width: 13px;
            height: 13px;
            stroke: #ffffff;
            fill: none;
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
            flex-shrink: 0;
          }

          /* ── Badges ── */
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.3px;
          }

          .badge svg {
            width: 10px;
            height: 10px;
            stroke: currentColor;
            fill: none;
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .badge.ongoing {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1e40af;
            border: 1px solid #93c5fd;
          }

          .badge.completed {
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            color: #065f46;
            border: 1px solid #6ee7b7;
          }

          .badge.cancelled {
            background: linear-gradient(135deg, #fee2e2, #fecaca);
            color: #b91c1c;
            border: 1px solid #fca5a5;
          }

          /* ── Filter Bar ── */
          .filter-bar {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            padding: 16px 20px;
            background: #f8fafc;
            border-radius: 12px;
            border: 2px solid #e0f2fe;
          }

          .filter-search-wrap {
            position: relative;
            flex: 1;
            min-width: 200px;
          }

          .filter-search-wrap svg {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            width: 15px;
            height: 15px;
            stroke: #94a3b8;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            pointer-events: none;
          }

          .filter-search-input {
            width: 100%;
            padding: 12px 16px 12px 40px;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
            color: #1e293b;
            background: #ffffff;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            outline: none;
            transition: all 0.2s;
          }

          .filter-search-input::placeholder { color: #94a3b8; }

          .filter-search-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: #ffffff;
          }

          .filter-month-wrap {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
          }

          .filter-month-label {
            font-size: 13px;
            font-weight: 600;
            color: #475569;
            white-space: nowrap;
          }

          .filter-month-input {
            padding: 11px 14px;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            outline: none;
            background: #ffffff;
            color: #475569;
            transition: all 0.2s;
          }

          .filter-month-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .filter-clear-btn {
            padding: 11px 18px;
            font-size: 13px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            color: #475569;
            background: #ffffff;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .filter-clear-btn:hover {
            background: #f0f9ff;
            border-color: #bfdbfe;
            color: #1e40af;
          }

          /* ── Empty Row ── */
          .empty-row td {
            text-align: center;
            padding: 48px 20px;
            color: #94a3b8;
            font-size: 14px;
          }

          .empty-icon {
            display: flex;
            justify-content: center;
            margin-bottom: 10px;
          }

          .empty-icon svg {
            width: 40px;
            height: 40px;
            stroke: #bfdbfe;
            fill: none;
            stroke-width: 1.3;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          /* ── Value Highlights ── */
          .value-positive {
            font-weight: 700;
            color: #1e40af;
          }

          .value-neutral {
            font-weight: 700;
            color: #1e293b;
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
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          }

          @media (max-width: 900px) {
            .dashboard-container { padding: 24px 16px; }
            .dash-title { font-size: 24px; }
          }
        `}</style>

        <div className="dashboard-container">

          {/* ── Header ── */}
          <div className="dash-header">
            <h1 className="dash-title">Assignments Overview</h1>
          </div>

          {/* ── Tabs ── */}
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'ongoing' ? 'active' : ''}`}
              onClick={() => setActiveTab('ongoing')}
            >
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Ongoing Assignments
            </button>
            <button
              className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              <svg viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Completed Assignments
            </button>
            {/* ── ADDED CANCELLED TAB BUTTON ── */}
            <button
              className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
              onClick={() => setActiveTab('cancelled')}
            >
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Cancelled Assignments
            </button>
          </div>

          {/* ── Card ── */}
          <div className="card">

            {/* ── ONGOING TAB ── */}
            {activeTab === 'ongoing' && (
              <>
                <div className="filter-bar">
                  <div className="filter-search-wrap">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      type="text"
                      className="filter-search-input"
                      placeholder="Search by vehicle number, driver or customer..."
                      value={ongoingSearch}
                      onChange={e => setOngoingSearch(e.target.value)}
                    />
                  </div>
                  {ongoingSearch && (
                    <button className="filter-clear-btn" onClick={() => setOngoingSearch('')}>Clear</button>
                  )}
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Start Date</th>
                      <th>Customer</th>
                      <th>Driver & Vehicle</th>
                      <th>Route</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right', minWidth: '120px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOngoing.length === 0 ? (
                      <tr className="empty-row">
                        <td colSpan="6">
                          <div className="empty-icon">
                            <svg viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                          </div>
                          No ongoing assignments match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredOngoing.map(job => (
                        <tr key={job.assignment_id}>
                          <td style={{ fontSize: 13, color: '#475569' }}>
                            {new Date(job.est_s_TD).toLocaleString()}
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {capitalizeFirstLetter(job.company_name)}
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>
                              {capitalizeFirstLetter(job.driver_name)}
                            </span>
                            <br/>
                            <span style={{ fontSize: 12, color: '#64748b' }}>
                              {toUpper(job.vehicle_number)}
                            </span>
                          </td>
                          <td style={{ fontSize: 13, color: '#475569' }}>
                            {capitalizeFirstLetter(job.start_location)}
                            {' '}
                            <svg style={{ width: 12, height: 12, stroke: '#94a3b8', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', verticalAlign: 'middle', margin: '0 2px' }} viewBox="0 0 24 24">
                              <line x1="5" y1="12" x2="19" y2="12"/>
                              <polyline points="12 5 19 12 12 19"/>
                            </svg>
                            {' '}
                            {capitalizeFirstLetter(job.end_location)}
                          </td>
                          <td>
                            <span className="badge ongoing">
                              <svg viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                              </svg>
                              In Transit
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="cancel-action-btn"
                              onClick={() => handleCancelAssignment(job.assignment_id)}
                            >
                              <svg viewBox="0 0 24 24">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            )}

            {/* ── COMPLETED TAB ── */}
            {activeTab === 'completed' && (
              <>
                <div className="filter-bar">
                  <div className="filter-search-wrap">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      type="text"
                      className="filter-search-input"
                      placeholder="Search by vehicle number, driver name or customer..."
                      value={completedSearch}
                      onChange={e => setCompletedSearch(e.target.value)}
                    />
                  </div>
                  <div className="filter-month-wrap">
                    <span className="filter-month-label">Month:</span>
                    <input
                      type="month"
                      className="filter-month-input"
                      value={completedMonth}
                      onChange={e => setCompletedMonth(e.target.value)}
                    />
                  </div>
                  {(completedSearch || completedMonth) && (
                    <button
                      className="filter-clear-btn"
                      onClick={() => { setCompletedSearch(''); setCompletedMonth(''); }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Completed Date</th>
                      <th>Customer & Route</th>
                      <th>Driver Details</th>
                      <th>Total KMS</th>
                      <th>Customer Billed</th>
                      <th>Driver Pay</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompleted.length === 0 ? (
                      <tr className="empty-row">
                        <td colSpan="7">
                          <div className="empty-icon">
                            <svg viewBox="0 0 24 24">
                              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                              <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                          </div>
                          No completed assignments match your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCompleted.map(job => (
                        <tr key={job.assignment_id}>
                          <td style={{ fontSize: 13, color: '#475569' }}>
                            {new Date(job.est_e_TD).toLocaleDateString()}
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>
                              {capitalizeFirstLetter(job.company_name)}
                            </span>
                            <br/>
                            <span style={{ fontSize: 12, color: '#64748b' }}>
                              {capitalizeFirstLetter(job.start_location)}
                              {' '}
                              <svg style={{ width: 10, height: 10, stroke: '#94a3b8', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', verticalAlign: 'middle', margin: '0 2px' }} viewBox="0 0 24 24">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                                <polyline points="12 5 19 12 12 19"/>
                              </svg>
                              {' '}
                              {capitalizeFirstLetter(job.end_location)}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>
                              {capitalizeFirstLetter(job.driver_name)}
                            </span>
                            <br/>
                            <span style={{ fontSize: 12, color: '#64748b' }}>
                              {toUpper(job.vehicle_number)}
                            </span>
                          </td>
                          <td className="value-neutral">{job.totalKMS} km</td>
                          <td className="value-positive">Rs {job.company_payment}</td>
                          <td className="value-positive">Rs {job.driver_payment}</td>
                          <td>
                            <span className="badge completed">
                              <svg viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            )}

            {/* ── ADDED: CANCELLED TAB ── */}
            {activeTab === 'cancelled' && (
              <>
                <div className="filter-bar">
                  <div className="filter-search-wrap">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      type="text"
                      className="filter-search-input"
                      placeholder="Search by vehicle number, driver name or customer..."
                      value={cancelledSearch}
                      onChange={e => setCancelledSearch(e.target.value)}
                    />
                  </div>
                  <div className="filter-month-wrap">
                    <span className="filter-month-label">Month:</span>
                    <input
                      type="month"
                      className="filter-month-input"
                      value={cancelledMonth}
                      onChange={e => setCancelledMonth(e.target.value)}
                    />
                  </div>
                  {(cancelledSearch || cancelledMonth) && (
                    <button
                      className="filter-clear-btn"
                      onClick={() => { setCancelledSearch(''); setCancelledMonth(''); }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Assignment Date</th>
                      <th>Customer & Route</th>
                      <th>Driver Details</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCancelled.length === 0 ? (
                      <tr className="empty-row">
                        <td colSpan="4">
                          <div className="empty-icon">
                            <svg viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="15" y1="9" x2="9" y2="15"/>
                              <line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                          </div>
                          No cancelled assignments match your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCancelled.map(job => (
                        <tr key={job.assignment_id}>
                          <td style={{ fontSize: 13, color: '#475569' }}>
                            {new Date(job.est_s_TD).toLocaleDateString()}
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>
                              {capitalizeFirstLetter(job.company_name)}
                            </span>
                            <br/>
                            <span style={{ fontSize: 12, color: '#64748b' }}>
                              {capitalizeFirstLetter(job.start_location)}
                              {' '}
                              <svg style={{ width: 10, height: 10, stroke: '#94a3b8', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', verticalAlign: 'middle', margin: '0 2px' }} viewBox="0 0 24 24">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                                <polyline points="12 5 19 12 12 19"/>
                              </svg>
                              {' '}
                              {capitalizeFirstLetter(job.end_location)}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>
                              {capitalizeFirstLetter(job.driver_name)}
                            </span>
                            <br/>
                            <span style={{ fontSize: 12, color: '#64748b' }}>
                              {toUpper(job.vehicle_number)}
                            </span>
                          </td>
                          <td>
                            <span className="badge cancelled">
                              <svg viewBox="0 0 24 24">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                              Cancelled
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            )}

          </div>
        </div>

        {/* ── Global Alert Dialog ── */}
        <AlertDialog
          isOpen={dialog.isOpen}
          type={dialog.type}
          title={dialog.title}
          message={dialog.message}
          onClose={() => setDialog({ ...dialog, isOpen: false })}
          onConfirm={dialog.onConfirm}
        />
      </div>
    </div>
    </ProtectedRoute>
  );
}

export default function AdminTrips() {
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
      <AdminTripsContent />
    </Suspense>
  );
}