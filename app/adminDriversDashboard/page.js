"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../components/adminNavbar";
import ProtectedRoute from "../../components/protectedRoute";

function AdminDriversContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  const [allDrivers, setAllDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [blacklistingId, setBlacklistingId] = useState(null);

  const [filters, setFilters] = useState({
    search: "", availability: "", expiry: ""
  });

  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "", isError: false });
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
        const res = await fetch("http://localhost:5000/driver/list");
        const data = await res.json();
        setAllDrivers(data);
        setFilteredDrivers(data);
    } catch (error) {
        setDialog({ isOpen: true, title: "Error", message: "Failed to fetch drivers from the server.", isError: true });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuId(null);
    };
    if (openMenuId !== null) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    let result = allDrivers;

    if (filters.search) {
        result = result.filter(d => d.name?.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters.availability !== "") {
        result = result.filter(d => String(d.is_available) === filters.availability);
    }
    if (filters.expiry) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        result = result.filter(d => {
            if (!d.expiry_date) return false;
            const expDate = new Date(d.expiry_date);
            expDate.setHours(0, 0, 0, 0);

            if (filters.expiry === "expired") return expDate < today;
            if (filters.expiry === "today") return expDate.getTime() === today.getTime();
            if (filters.expiry === "month") return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
            return false;
        });
    }
    setFilteredDrivers(result);
  }, [filters, allDrivers]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
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

  const handleAddToBlacklist = async (driverId) => {
    setBlacklistingId(driverId);

    try {
        const response = await fetch("http://localhost:5000/driver/blacklist", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ driverId }),
        });
        const data = await response.json();

        if (response.ok) {
            setDialog({ isOpen: true, title: "Success", message: data.message, isError: false });
            fetchData();
        } else {
            setDialog({ isOpen: true, title: "Error", message: data.message || "Failed to add to blacklist.", isError: true });
        }
    } catch (error) {
        setDialog({ isOpen: true, title: "Network Error", message: "Unable to reach the server.", isError: true });
    } finally {
        setBlacklistingId(null);
        setOpenMenuId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const isExpiring = (dateStr) => {
    if (!filters.expiry || !dateStr) return false;
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (filters.expiry === "expired") return d < today;
    if (filters.expiry === "today") return d.getTime() === today.getTime();
    if (filters.expiry === "month") return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    return false;
  };

  const showExpiryColumns = filters.expiry !== "";
  const capitalize = (str) => str ? str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "";

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

          /* ── Nav Button ── */
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

          .btn-blacklist {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
          }

          .btn-blacklist:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          }

          .btn-blacklist svg {
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
            flex-wrap: wrap;
            align-items: center;
            margin-bottom: 28px;
            border: 1px solid #e0f2fe;
            animation: fadeIn 0.8s ease-out;
          }

          .search-input,
          .filter-select {
            padding: 14px 18px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            outline: none;
            background: #f8fafc;
            color: #475569;
            transition: all 0.2s;
            font-weight: 500;
          }

          .search-input {
            flex: 1;
            min-width: 200px;
            color: #1e293b;
          }

          .filter-select {
            min-width: 180px;
            cursor: pointer;
          }

          .search-input::placeholder { color: #94a3b8; }

          .search-input:focus,
          .filter-select:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: #ffffff;
          }

          /* ── Table Card ── */
          /* 1. The Container */
.table-container {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
    overflow: visible; /* Dropdowns are free! */
    border: 1px solid #e0f2fe;
    animation: fadeIn 1s ease-out;
}

/* 2. Setup the inner table to accept border-radius */
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

/* 5. Keep corners round when hovering over the last row (if you use row hovers) */
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

          /* ── Status Badge ── */
          .status-badge {
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }

          .status-available {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1e40af;
            border: 1px solid #93c5fd;
          }

          .status-unavailable {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            color: #475569;
            border: 1px solid #cbd5e1;
          }

          /* ── Expiry Highlight ── */
          .expiry-highlight {
            color: #1e40af;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            padding: 5px 12px;
            border-radius: 8px;
            border: 1px solid #93c5fd;
            font-weight: 600;
            display: inline-block;
            font-size: 13px;
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
            min-width: 196px;
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

          .menu-item-blacklist { color: #1e3a8a; }
          .menu-item-blacklist:hover { background: #dbeafe; color: #1e40af; }

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

          @media (max-width: 900px) {
            .page-container { padding: 24px 16px; }
            .title { font-size: 24px; }
            .filter-bar { gap: 10px; }
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
            <h1 className="title">Active Drivers</h1>
            <div className="header-actions">
              <button className="nav-btn btn-blacklist" onClick={() => router.push(`/adminBlacklistedDrivers?userId=${userId}`)}>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
                Blacklisted Drivers
              </button>
            </div>
          </div>

          {/* ── Filter Bar ── */}
          <div className="filter-bar">
            <input
              type="text"
              name="search"
              placeholder="Search Driver Name..."
              className="search-input"
              value={filters.search}
              onChange={handleFilterChange}
            />
            <select name="availability" className="filter-select" onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="1">Available</option>
              <option value="0">Unavailable</option>
            </select>
            <select name="expiry" className="filter-select" onChange={handleFilterChange}>
              <option value="">All License Expiry</option>
              <option value="expired">Expired</option>
              <option value="today">Expiring Today</option>
              <option value="month">Expiring This Month</option>
            </select>
          </div>

          {/* ── Table ── */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Contact</th>
                  <th>License Number</th>
                  {showExpiryColumns && <th>License Expiry</th>}
                  <th>Status</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={showExpiryColumns ? 6 : 5}>
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
                    <td colSpan={showExpiryColumns ? 6 : 5}>
                      <div className="empty-msg">
                        <div className="empty-icon">
                          <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M20 21a8 8 0 10-16 0"/>
                          </svg>
                        </div>
                        No drivers found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((d) => (
                    <tr key={d.driver_id}>
                      <td style={{ fontWeight: '600', color: '#1e293b' }}>{capitalize(d.name)}</td>
                      <td style={{ color: '#475569' }}>{formatMobileNumber(d.contact)}</td>
                      <td style={{ color: '#475569' }}>{(d.license_number || "").toUpperCase()}</td>
                      {showExpiryColumns && (
                        <td>
                          <span className={isExpiring(d.expiry_date) ? "expiry-highlight" : ""} style={!isExpiring(d.expiry_date) ? { color: '#475569' } : {}}>
                            {formatDate(d.expiry_date)}
                          </span>
                        </td>
                      )}
                      <td>
                        <span className={`status-badge ${d.is_available === 1 ? 'status-available' : 'status-unavailable'}`}>
                          {d.is_available === 1 ? (
                            <>
                              <svg style={{ width: '10px', height: '10px', stroke: 'currentColor', fill: 'none', strokeWidth: '2.5', strokeLinecap: 'round' }} viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Available
                            </>
                          ) : (
                            <>
                              <svg style={{ width: '10px', height: '10px', stroke: 'currentColor', fill: 'none', strokeWidth: '2.5', strokeLinecap: 'round' }} viewBox="0 0 24 24">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                              Unavailable
                            </>
                          )}
                        </span>
                      </td>
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
                                className="menu-item menu-item-blacklist"
                                onClick={() => !blacklistingId && handleAddToBlacklist(d.driver_id)}
                              >
                                {blacklistingId === d.driver_id ? (
                                  <>
                                    <span className="spinner-small" />
                                    Blacklisting...
                                  </>
                                ) : (
                                  <>
                                    <svg viewBox="0 0 24 24">
                                      <circle cx="12" cy="12" r="10"/>
                                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                                    </svg>
                                    Add to Blacklist
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

export default function AdminDrivers() {
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
      <AdminDriversContent />
    </Suspense>
  );
}