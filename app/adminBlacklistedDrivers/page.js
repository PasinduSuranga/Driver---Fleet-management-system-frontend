"use client";
// Main page component and its dependencies

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../components/adminNavbar";
import ProtectedRoute from "../../components/protectedRoute";

function AdminBlacklistedDriversContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  const [blacklistedDrivers, setBlacklistedDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [unblacklistingId, setUnblacklistingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "", isError: false });
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Fetch data from API

  const fetchBlacklisted = async () => {
    setLoading(true);
    try {
        const res = await fetch("http://localhost:5000/driver/blacklisted");
        const data = await res.json();
        setBlacklistedDrivers(data);
        setFilteredDrivers(data);
    } catch (error) {
        setDialog({ isOpen: true, title: "Error", message: "Failed to fetch blacklisted drivers from the server.", isError: true });
    } finally {
        setLoading(false);
    }
  };

  // Set up side effects on component mount or state change

  useEffect(() => { fetchBlacklisted(); }, []);

  // Set up side effects on component mount or state change

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuId(null);
    };
    if (openMenuId !== null) document.addEventListener('mousedown', handleClickOutside);
    // Render the component UI
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // Set up side effects on component mount or state change

  useEffect(() => {
    if (searchQuery) {
        setFilteredDrivers(blacklistedDrivers.filter(d => d.name?.toLowerCase().includes(searchQuery.toLowerCase())));
    } else {
        setFilteredDrivers(blacklistedDrivers);
    }
  }, [searchQuery, blacklistedDrivers]);

  const handleMenuToggle = (id) => setOpenMenuId(openMenuId === id ? null : id);
  const handleViewDetails = (id) => router.push(`/adminViewDriver?userId=${userId}&driverId=${id}`);

  function formatMobileNumber(number) {
    if (!number) return "";
    const str = number.toString().replace(/\s+/g, '');
    if (str.startsWith('+94')) {
      return str.replace(/(\+94)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4");
    }
    if (str.startsWith('07')) {
      return str.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    }
    return number;
  }

  const handleRemoveFromBlacklist = async (driverId) => {
    setUnblacklistingId(driverId);

    try {
        const response = await fetch("http://localhost:5000/driver/unblacklist", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ driverId }),
        });
        const data = await response.json();

        if (response.ok) {
            setDialog({ isOpen: true, title: "Success", message: data.message, isError: false });
            fetchBlacklisted();
        } else {
            setDialog({ isOpen: true, title: "Error", message: data.message || "Failed to remove from blacklist.", isError: true });
        }
    } catch (error) {
        setDialog({ isOpen: true, title: "Network Error", message: "Unable to reach the server.", isError: true });
    } finally {
        setUnblacklistingId(null);
        setOpenMenuId(null);
    }
  };

  const capitalize = (str) => str ? str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "";
  const toUpper = (str) => str ? str.toUpperCase() : "";

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
          @keyframes menuPop {
            from { opacity: 0; transform: scale(0.93) translateY(6px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes modalPop {
            from { opacity: 0; transform: scale(0.88) translateY(16px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

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
            padding: 40px;
            animation: fadeIn 0.6s ease-out;
            flex-grow: 1;
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
          }

          .header-actions {
            display: flex;
            gap: 12px;
          }

          /* ── Back Button ── */
          .nav-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s;
            color: #ffffff;
          }

          .btn-back {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
          }

          .btn-back:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          }

          .btn-back svg {
            width: 16px;
            height: 16px;
            stroke: #ffffff;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            flex-shrink: 0;
          }

          /* ── Filter Bar ── */
          .filter-bar {
            background: #ffffff;
            padding: 20px 24px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
            display: flex;
            gap: 15px;
            align-items: center;
            margin-bottom: 28px;
            border: 1px solid #e0f2fe;
            animation: fadeIn 0.8s ease-out;
            flex-wrap: wrap;
          }

          .search-input {
            flex: 1;
            min-width: 220px;
            padding: 14px 18px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            outline: none;
            background: #f8fafc;
            color: #1e293b;
            transition: all 0.2s;
            font-weight: 500;
          }

          .search-input::placeholder { color: #94a3b8; }

          .search-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: #ffffff;
          }

          .result-count {
            font-size: 13px;
            font-weight: 600;
            color: #1e40af;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #93c5fd;
            padding: 6px 14px;
            border-radius: 20px;
            white-space: nowrap;
            flex-shrink: 0;
          }

          /* ── Table Card ── */
          /* 1. The Container */
.table-container {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
    overflow: visible; 
    border: 1px solid #e0f2fe;
    animation: fadeIn 1s ease-out;
}

/* 2. Setup the inner table */
.table-container table {
    border-collapse: separate; 
    border-spacing: 0;
    width: 100%;
}

/* 3. Round the TOP corners (Header) */
.table-container thead tr:first-child th:first-child {
    border-top-left-radius: 16px;
}
.table-container thead tr:first-child th:last-child {
    border-top-right-radius: 16px;
}

/* 4. Round the BOTTOM corners (Body) */
.table-container tbody tr:last-child td:first-child {
    border-bottom-left-radius: 16px;
}
.table-container tbody tr:last-child td:last-child {
    border-bottom-right-radius: 16px;
}

/* 5. Keep corners round when hovering over the last row */
.table-container tbody tr:last-child:hover td:first-child {
    border-bottom-left-radius: 16px;
}
.table-container tbody tr:last-child:hover td:last-child {
    border-bottom-right-radius: 16px;
}

          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }

          thead tr {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          }

          th {
            padding: 18px 20px;
            text-align: left;
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
          }

          td {
            padding: 16px 20px;
            border-bottom: 1px solid #f0f9ff;
            color: #1e293b;
            font-size: 14px;
            vertical-align: middle;
          }

          tbody tr:last-child td { border-bottom: none; }

          tbody tr {
            transition: background 0.2s;
            position: relative;
          }

          tbody tr:hover td { background: #f0f9ff; }

          /* ── Driver name cell ── */
          .driver-name-cell {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            font-weight: 700;
            color: #1e293b;
          }

          .driver-name-cell svg {
            width: 14px;
            height: 14px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            flex-shrink: 0;
          }

          /* ── Options Menu ── */
          .options-cell { position: relative; text-align: center; }

          .options-btn {
            background: none;
            border: 2px solid #e2e8f0;
            cursor: pointer;
            padding: 6px 12px;
            color: #64748b;
            transition: all 0.2s;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 700;
            line-height: 1;
            letter-spacing: 2px;
          }

          .options-btn:hover {
            background: #f0f9ff;
            border-color: #bfdbfe;
            color: #1e40af;
          }

          .options-menu {
            position: absolute;
            right: 0;
            bottom: 100%;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.18), 0 0 0 1px rgba(191, 219, 254, 0.5);
            min-width: 230px;
            z-index: 1000;
            overflow: hidden;
            animation: menuPop 0.2s ease both;
          }

          .menu-item {
            padding: 13px 16px;
            cursor: pointer;
            transition: background 0.15s, color 0.15s;
            color: #1e293b;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid #f0f9ff;
          }

          .menu-item:last-child { border-bottom: none; }
          .menu-item:hover { background: #f0f9ff; color: #1e40af; }

          .menu-item svg {
            width: 15px;
            height: 15px;
            stroke: currentColor;
            fill: none;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
            flex-shrink: 0;
          }

          .menu-item-restore { color: #1e3a8a; }
          .menu-item-restore:hover { background: #dbeafe; color: #1e40af; }

          /* ── Empty / Loading ── */
          .empty-msg {
            text-align: center;
            padding: 52px 20px;
            color: #94a3b8;
            font-size: 15px;
          }

          .empty-icon {
            display: flex;
            justify-content: center;
            margin-bottom: 10px;
          }

          .empty-icon svg {
            width: 42px;
            height: 42px;
            stroke: #bfdbfe;
            fill: none;
            stroke-width: 1.3;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          /* ── Modal Overlay ── */
          .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(30, 64, 175, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(8px);
            animation: fadeIn 0.3s ease-out;
          }

          /* ── Dialog ── */
          .dialog-content {
            background: #ffffff;
            padding: 30px;
            border-radius: 16px;
            width: 90%;
            max-width: 440px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25);
            border: 1px solid #e0f2fe;
            animation: modalPop 0.4s ease-out both;
          }

          .dialog-icon-wrap {
            width: 62px;
            height: 62px;
            border-radius: 50%;
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 18px;
          }

          .dialog-icon-wrap svg {
            width: 28px;
            height: 28px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .dialog-title {
            font-size: 22px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 10px;
          }

          .dialog-message {
            font-size: 15px;
            color: #64748b;
            margin-bottom: 4px;
            line-height: 1.6;
          }

          .dialog-button {
            margin-top: 24px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: #ffffff;
            border: none;
            padding: 12px 24px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            transition: all 0.3s;
            width: 100%;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
          }

          .dialog-button:hover {
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          }

          /* ── Loading Overlay ── */
          .loading-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(240, 249, 255, 0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 4000;
            backdrop-filter: blur(4px);
          }

          .spinner {
            width: 46px;
            height: 46px;
            border: 4px solid #bfdbfe;
            border-top-color: #1e40af;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 14px;
          }

          .spinner-small {
            width: 14px;
            height: 14px;
            border: 2px solid #bfdbfe;
            border-top-color: #1e40af;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            display: inline-block;
            margin-right: 4px;
            flex-shrink: 0;
          }

          .loading-text {
            color: #1e40af;
            font-weight: 600;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
          }

          @media (max-width: 900px) {
            .page-container { padding: 24px 16px; }
            .title { font-size: 24px; }
          }
        `}</style>

        {processing && (
          <div className="loading-overlay">
            <div className="spinner" />
            <div className="loading-text">Processing...</div>
          </div>
        )}

        <div className="page-container">

          {/* ── Page Header ── */}
          <div className="page-header">
            <h1 className="title">Blacklisted Drivers</h1>
            <div className="header-actions">
              <button className="nav-btn btn-back" onClick={() => router.push(`/adminDriversDashboard?userId=${userId}`)}>
                <svg viewBox="0 0 24 24">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Drivers
              </button>
            </div>
          </div>

          {/* ── Filter Bar ── */}
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search Blacklisted Driver Name..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="result-count">
              {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Table ── */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Contact</th>
                  <th>License Number</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-msg">
                        <div className="empty-icon">
                          <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M20 21a8 8 0 10-16 0"/>
                          </svg>
                        </div>
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-msg">
                        <div className="empty-icon">
                          <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M20 21a8 8 0 10-16 0"/>
                          </svg>
                        </div>
                        No blacklisted drivers found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((d) => (
                    <tr key={d.driver_id}>
                      <td>
                        <span className="driver-name-cell">
                          <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                          </svg>
                          {capitalize(d.name)}
                        </span>
                      </td>
                      <td style={{ color: '#475569' }}>{formatMobileNumber(d.contact)}</td>
                      <td style={{ color: '#475569' }}>{toUpper(d.license_number)}</td>
                      <td className="options-cell">
                        <div ref={openMenuId === d.driver_id ? menuRef : null}>
                          <button className="options-btn" onClick={() => handleMenuToggle(d.driver_id)}>
                            ···
                          </button>
                          {openMenuId === d.driver_id && (
                            <div className="options-menu">
                              <div className="menu-item" onClick={() => handleViewDetails(d.driver_id)}>
                                <svg viewBox="0 0 24 24">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                                View Details
                              </div>
                              <div
                                className="menu-item menu-item-restore"
                                onClick={() => !unblacklistingId && handleRemoveFromBlacklist(d.driver_id)}
                              >
                                {unblacklistingId === d.driver_id ? (
                                  <>
                                    <span className="spinner-small" />
                                    Removing...
                                  </>
                                ) : (
                                  <>
                                    <svg viewBox="0 0 24 24">
                                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                      <polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                    Remove from Blacklist
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Dialog Modal ── */}
        {dialog.isOpen && (
          <div className="modal-overlay">
            <div className="dialog-content">
              <div className="dialog-icon-wrap">
                {dialog.isError ? (
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                )}
              </div>
              <h3 className="dialog-title">{dialog.title}</h3>
              <p className="dialog-message">{dialog.message}</p>
              <button className="dialog-button" onClick={() => setDialog({ ...dialog, isOpen: false })}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}

export default function AdminBlacklistedDrivers() {
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
      <AdminBlacklistedDriversContent />
    </Suspense>
  );
}