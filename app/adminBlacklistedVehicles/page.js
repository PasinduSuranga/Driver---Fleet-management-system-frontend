"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../components/adminNavbar";
import ProtectedRoute from "../../components/protectedRoute";

function AdminBlacklistedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  const [blacklistedVehicles, setBlacklistedVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "", isError: false });
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const fetchBlacklisted = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/vehicle/blacklisted");
      const data = await res.json();
      setBlacklistedVehicles(data);
      setFilteredVehicles(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlacklisted(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuId(null);
    };
    if (openMenuId !== null) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredVehicles(blacklistedVehicles.filter(v => v.vehicle_number?.toLowerCase().includes(searchQuery.toLowerCase())));
    } else {
      setFilteredVehicles(blacklistedVehicles);
    }
  }, [searchQuery, blacklistedVehicles]);

  const handleMenuToggle = (vehicleNumber) => setOpenMenuId(openMenuId === vehicleNumber ? null : vehicleNumber);
  const handleViewDetails = (vehicleNumber) => router.push(`/adminViewVehicle?userId=${userId}&vehicleNumber=${vehicleNumber}`);

  const handleRemoveFromBlacklist = async (vehicleNumber) => {
    setOpenMenuId(null);
    setProcessing(true);

    try {
      const response = await fetch("http://localhost:5000/vehicle/unblacklist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleNumber }),
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
      setProcessing(false);
    }
  };

  const capitalizeFirstLetter = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  const toUpper = (str) => str ? str.toUpperCase() : "";

  return (
    <ProtectedRoute>
    <div className="ab-layout">
      <Sidebar />
      <div className="ab-main">

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

          @keyframes abFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes abSlideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes abMenuPop {
            from { opacity: 0; transform: scale(0.93) translateY(6px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes abModalPop {
            from { opacity: 0; transform: scale(0.88) translateY(16px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          /* ── Layout ── */
          .ab-layout {
            display: flex;
            min-height: 100vh;
            font-family: 'Inter', sans-serif;
          }

          .ab-main {
            margin-left: 250px;
            min-height: 100vh;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
            display: flex;
            flex-direction: column;
            flex: 1;
          }

          @media (max-width: 768px) {
            .ab-main { margin-left: 220px; }
          }

          /* ── Page Container ── */
          .ab-page {
            padding: 40px;
            animation: abFadeIn 0.5s ease both;
            flex-grow: 1;
          }

          /* ── Page Header ── */
          .ab-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            animation: abSlideIn 0.5s ease both;
            flex-wrap: wrap;
            gap: 16px;
          }

          .ab-header-left {
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .ab-header-icon {
            width: 52px;
            height: 52px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
            flex-shrink: 0;
          }

          .ab-header-icon svg {
            width: 26px;
            height: 26px;
            stroke: #ffffff;
            fill: none;
            stroke-width: 1.7;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .ab-title {
            font-size: 32px;
            font-weight: 800;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
          }

          .ab-subtitle {
            font-size: 13px;
            color: #64748b;
            margin-top: 2px;
            font-weight: 400;
          }

          /* ── Back Button ── */
          .btn-back {
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
          }

          /* ── Filter Bar ── */
          .ab-filter-bar {
            background: #ffffff;
            padding: 20px 24px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
            border: 1px solid #e0f2fe;
            display: flex;
            gap: 14px;
            align-items: center;
            margin-bottom: 28px;
            animation: abFadeIn 0.6s ease both;
            flex-wrap: wrap;
          }

          .ab-search-wrap {
            position: relative;
            flex: 1;
            min-width: 220px;
          }

          .ab-search-wrap svg {
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

          .ab-search-input {
            width: 100%;
            padding: 14px 18px 14px 40px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            outline: none;
            background: #f8fafc;
            color: #1e293b;
            transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          }

          .ab-search-input::placeholder { color: #94a3b8; }

          .ab-search-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: #ffffff;
          }

          .ab-result-count {
            font-size: 13px;
            color: #64748b;
            font-weight: 500;
            white-space: nowrap;
            flex-shrink: 0;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #93c5fd;
            color: #1e40af;
            padding: 6px 14px;
            border-radius: 20px;
          }

          /* ── Table Card ── */
          /* 1. The Container */
.ab-table-card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
    overflow: visible; /* Added so dropdown menus aren't clipped */
    border: 1px solid #e0f2fe;
    animation: abFadeIn 0.7s ease both;
}

/* 2. Setup the inner table to accept border-radius */
.ab-table-card table {
    border-collapse: separate; 
    border-spacing: 0;
    width: 100%;
}

/* 3. Round the TOP corners (Header) */
.ab-table-card thead tr:first-child th:first-child {
    border-top-left-radius: 16px;
}
.ab-table-card thead tr:first-child th:last-child {
    border-top-right-radius: 16px;
}

/* 4. Round the BOTTOM corners (Body) */
.ab-table-card tbody tr:last-child td:first-child {
    border-bottom-left-radius: 16px;
}
.ab-table-card tbody tr:last-child td:last-child {
    border-bottom-right-radius: 16px;
}

/* 5. Keep corners round when hovering over the last row (if you use row hovers) */
.ab-table-card tbody tr:last-child:hover td:first-child {
    border-bottom-left-radius: 16px;
}
.ab-table-card tbody tr:last-child:hover td:last-child {
    border-bottom-right-radius: 16px;
}

          .ab-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }

          .ab-table thead tr {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          }

          .ab-table th {
            padding: 18px 20px;
            text-align: left;
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
          }

          .ab-table td {
            padding: 16px 20px;
            border-bottom: 1px solid #f0f9ff;
            color: #1e293b;
            font-size: 14px;
            vertical-align: middle;
          }

          .ab-table tbody tr:last-child td { border-bottom: none; }

          .ab-table tbody tr {
            transition: background 0.2s;
          }

          .ab-table tbody tr:hover td { background: #f0f9ff; }

          /* ── Blacklisted vehicle number ── */
          .ab-vehicle-num {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            font-weight: 700;
            color: #1e293b;
          }

          .ab-vehicle-num svg {
            width: 14px;
            height: 14px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            flex-shrink: 0;
          }

          /* ── Empty / Loading row ── */
          .ab-table-msg td {
            text-align: center;
            padding: 52px 20px;
            color: #94a3b8;
            font-size: 15px;
          }

          .ab-table-msg-icon {
            display: flex;
            justify-content: center;
            margin-bottom: 10px;
          }

          .ab-table-msg-icon svg {
            width: 42px;
            height: 42px;
            stroke: #bfdbfe;
            fill: none;
            stroke-width: 1.3;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          /* ── Options Menu ── */
          .ab-options-cell { position: relative; text-align: center; }

          .ab-options-btn {
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

          .ab-options-btn:hover {
            background: #f0f9ff;
            border-color: #bfdbfe;
            color: #1e40af;
          }

          .ab-options-menu {
            position: absolute;
            right: 0;
            bottom: 100%;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.18), 0 0 0 1px rgba(191, 219, 254, 0.5);
            min-width: 210px;
            z-index: 1000;
            overflow: hidden;
            animation: abMenuPop 0.2s ease both;
          }

          .ab-menu-item {
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

          .ab-menu-item:last-child { border-bottom: none; }
          .ab-menu-item:hover { background: #f0f9ff; color: #1e40af; }

          .ab-menu-item svg {
            width: 15px;
            height: 15px;
            stroke: currentColor;
            fill: none;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
            flex-shrink: 0;
          }

          .ab-menu-item-restore { color: #1e3a8a; }
          .ab-menu-item-restore:hover { background: #dbeafe; color: #1e40af; }

          /* ── Modal Overlay ── */
          .ab-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(30, 64, 175, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(8px);
            animation: abFadeIn 0.3s ease-out;
            padding: 20px;
          }

          /* ── Dialog ── */
          .ab-dialog {
            background: #ffffff;
            padding: 30px;
            border-radius: 16px;
            width: 100%;
            max-width: 440px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25);
            border: 1px solid #e0f2fe;
            animation: abModalPop 0.4s ease-out both;
            font-family: 'Inter', sans-serif;
          }

          .ab-dialog-icon {
            width: 62px;
            height: 62px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 18px;
          }

          .ab-dialog-icon svg {
            width: 28px;
            height: 28px;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .ab-icon-success {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          }
          .ab-icon-success svg { stroke: #1e40af; }

          .ab-icon-error {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          }
          .ab-icon-error svg { stroke: #1e40af; }

          .ab-dialog-title {
            font-size: 22px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 10px;
          }

          .ab-dialog-message {
            font-size: 15px;
            color: #64748b;
            margin-bottom: 4px;
            line-height: 1.65;
          }

          .ab-dialog-btn {
            margin-top: 24px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: #ffffff;
            border: none;
            padding: 12px 28px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            width: 100%;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
            transition: all 0.3s;
          }

          .ab-dialog-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          }

          /* ── Processing Overlay ── */
          .ab-processing-overlay {
            position: fixed;
            inset: 0;
            background: rgba(240, 249, 255, 0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 4000;
            backdrop-filter: blur(4px);
          }

          .ab-spinner {
            width: 46px;
            height: 46px;
            border: 4px solid #bfdbfe;
            border-top-color: #1e40af;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 14px;
          }

          .ab-processing-text {
            color: #1e40af;
            font-weight: 600;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
          }

          @media (max-width: 900px) {
            .ab-page { padding: 24px 16px; }
            .ab-title { font-size: 24px; }
          }
        `}</style>

        {/* ── Processing Overlay ── */}
        {processing && (
          <div className="ab-processing-overlay">
            <div className="ab-spinner" />
            <div className="ab-processing-text">Processing...</div>
          </div>
        )}

        <div className="ab-page">

          {/* ── Page Header ── */}
          <div className="ab-header">
            <div className="ab-header-left">
              <div className="ab-header-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
              </div>
              <div>
                <div className="ab-title">Blacklisted Vehicles</div>
                <div className="ab-subtitle">Vehicles restricted from fleet operations</div>
              </div>
            </div>

            <button className="btn-back" onClick={() => router.push(`/adminVehiclesDashboard?userId=${userId}`)}>
              <svg viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Vehicles
            </button>
          </div>

          {/* ── Filter Bar ── */}
          <div className="ab-filter-bar">
            <div className="ab-search-wrap">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search blacklisted vehicle number..."
                className="ab-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <span className="ab-result-count">
              {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Table ── */}
          <div className="ab-table-card">
            <table className="ab-table">
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="ab-table-msg">
                    <td colSpan={4}>
                      <div className="ab-table-msg-icon">
                        <svg viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                        </svg>
                      </div>
                      Loading vehicles...
                    </td>
                  </tr>
                ) : filteredVehicles.length === 0 ? (
                  <tr className="ab-table-msg">
                    <td colSpan={4}>
                      <div className="ab-table-msg-icon">
                        <svg viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                        </svg>
                      </div>
                      No blacklisted vehicles found.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((v) => (
                    <tr key={v.vehicle_number}>
                      <td>
                        <span className="ab-vehicle-num">
                          <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                          </svg>
                          {toUpper(v.vehicle_number)}
                        </span>
                      </td>
                      <td style={{ color: '#475569' }}>{v.vehicle_type}</td>
                      <td style={{ color: '#475569' }}>{capitalizeFirstLetter(v.category_name || "Uncategorized")}</td>
                      <td className="ab-options-cell">
                        <div ref={openMenuId === v.vehicle_number ? menuRef : null}>
                          <button className="ab-options-btn" onClick={() => handleMenuToggle(v.vehicle_number)}>
                            ···
                          </button>
                          {openMenuId === v.vehicle_number && (
                            <div className="ab-options-menu">
                              <div className="ab-menu-item" onClick={() => handleViewDetails(v.vehicle_number)}>
                                <svg viewBox="0 0 24 24">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                                View Details
                              </div>
                              <div className="ab-menu-item ab-menu-item-restore" onClick={() => handleRemoveFromBlacklist(v.vehicle_number)}>
                                <svg viewBox="0 0 24 24">
                                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                  <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                Remove from Blacklist
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
          <div className="ab-modal-overlay">
            <div className="ab-dialog">
              <div className={`ab-dialog-icon ${dialog.isError ? 'ab-icon-error' : 'ab-icon-success'}`}>
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
              <div className="ab-dialog-title">{dialog.title}</div>
              <p className="ab-dialog-message">{dialog.message}</p>
              <button className="ab-dialog-btn" onClick={() => setDialog({ ...dialog, isOpen: false })}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}

export default function AdminBlacklistedVehicles() {
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
      <AdminBlacklistedContent />
    </Suspense>
  );
}