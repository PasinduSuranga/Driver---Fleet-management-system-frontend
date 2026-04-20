"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../components/adminNavbar";
import ProtectedRoute from "../../components/protectedRoute";

function AdminVehiclesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  const [allVehicles, setAllVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [filters, setFilters] = useState({
    search: "", type: "", availability: "", category: "", expiry: ""
  });

  const [dialog, setDialog] = useState({
    isOpen: false, title: "", message: "", isError: false
  });

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const vRes = await fetch("http://localhost:5000/vehicle/vehicles");
      const vData = await vRes.json();
      setAllVehicles(vData);
      setFilteredVehicles(vData);

      const cRes = await fetch("http://localhost:5000/category/categories");
      const cData = await cRes.json();
      setCategories(cData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId !== null) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    let result = allVehicles;

    if (filters.search) {
      result = result.filter(v => v.vehicle_number?.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters.type) {
      result = result.filter(v => v.vehicle_type === filters.type);
    }
    if (filters.availability !== "") {
      result = result.filter(v => String(v.availability) === filters.availability);
    }
    if (filters.category) {
      result = result.filter(v => String(v.category_id) === filters.category);
    }
    if (filters.expiry) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      result = result.filter(v => {
        const checkDate = (dateStr) => {
          if (!dateStr) return false;
          const d = new Date(dateStr);
          d.setHours(0, 0, 0, 0);
          return d;
        };
        const licenseDate = checkDate(v.license_expiry_date);
        const insuranceDate = checkDate(v.insurance_expiry_date);

        const matchCondition = (d) => {
          if (!d) return false;
          if (filters.expiry === "expired") return d < today;
          if (filters.expiry === "today") return d.getTime() === today.getTime();
          if (filters.expiry === "month") return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          return false;
        };
        return matchCondition(licenseDate) || matchCondition(insuranceDate);
      });
    }
    setFilteredVehicles(result);
  }, [filters, allVehicles]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleMenuToggle = (vehicleNumber) => setOpenMenuId(openMenuId === vehicleNumber ? null : vehicleNumber);

  const handleViewDetails = (vehicleNumber) => {
    router.push(`/adminViewVehicle?userId=${userId}&vehicleNumber=${vehicleNumber}`);
  };

  const handleAddToBlacklist = async (vehicleNumber) => {
    setOpenMenuId(null);
    setProcessing(true);

    try {
      const response = await fetch("http://localhost:5000/vehicle/blacklist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleNumber }),
      });
      const data = await response.json();

      if (response.ok) {
        setDialog({ isOpen: true, title: "Success", message: data.message, isError: false });
        fetchData();
      } else {
        setDialog({ isOpen: true, title: "Error", message: data.message || "Failed to add to blacklist.", isError: true });
      }
    } catch (error) {
      setDialog({ isOpen: true, title: "Network Error", message: "Unable to reach the server. Please try again.", isError: true });
    } finally {
      setProcessing(false);
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
  const capitalizeFirstLetter = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  const toUpper = (str) => str ? str.toUpperCase() : "";

  return (
    <ProtectedRoute>
    <div className="av-layout">
      <Sidebar />
      <div className="av-main">

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

          @keyframes avFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes avSlideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes avMenuPop {
            from { opacity: 0; transform: scale(0.93) translateY(6px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes avModalPop {
            from { opacity: 0; transform: scale(0.88) translateY(16px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          /* ── Layout ── */
          .av-layout {
            display: flex;
            min-height: 100vh;
            font-family: 'Inter', sans-serif;
          }

          .av-main {
            margin-left: 250px;
            min-height: 100vh;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
            display: flex;
            flex-direction: column;
            flex: 1;
          }

          @media (max-width: 768px) {
            .av-main { margin-left: 220px; }
          }

          /* ── Page Container ── */
          .av-page {
            padding: 40px;
            animation: avFadeIn 0.5s ease both;
            flex-grow: 1;
          }

          /* ── Page Header ── */
          .av-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            animation: avSlideIn 0.5s ease both;
            flex-wrap: wrap;
            gap: 16px;
          }

          .av-header-left {
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .av-header-icon {
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

          .av-header-icon svg {
            width: 26px;
            height: 26px;
            stroke: #ffffff;
            fill: none;
            stroke-width: 1.7;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .av-title {
            font-size: 32px;
            font-weight: 800;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
          }

          .av-subtitle {
            font-size: 13px;
            color: #64748b;
            margin-top: 2px;
            font-weight: 400;
          }

          /* ── Blacklist Button ── */
          .btn-blacklist {
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
            letter-spacing: 0.1px;
          }

          .btn-blacklist:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
          }

          .btn-blacklist svg {
            width: 16px;
            height: 16px;
            stroke: #ffffff;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          /* ── Filter Bar ── */
          .av-filter-bar {
            background: #ffffff;
            padding: 20px 24px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
            border: 1px solid #e0f2fe;
            display: flex;
            gap: 14px;
            flex-wrap: wrap;
            align-items: center;
            margin-bottom: 28px;
            animation: avFadeIn 0.6s ease both;
          }

          .av-search-wrap {
            position: relative;
            flex: 1;
            min-width: 200px;
          }

          .av-search-wrap svg {
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

          .av-search-input {
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

          .av-search-input::placeholder { color: #94a3b8; }

          .av-search-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: #ffffff;
          }

          .av-filter-select {
            padding: 14px 18px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            outline: none;
            background: #f8fafc;
            color: #475569;
            cursor: pointer;
            min-width: 165px;
            font-weight: 500;
            transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          }

          .av-filter-select:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: #ffffff;
          }

          /* 1. The Container */
.av-table-card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
    overflow: visible; /* Changed from hidden so menus can break out */
    border: 1px solid #e0f2fe;
    animation: avFadeIn 0.7s ease both;
}

/* 2. Setup the inner table to accept border-radius */
.av-table-card table {
    border-collapse: separate; 
    border-spacing: 0;
    width: 100%;
}

/* 3. Round the TOP corners (Header) */
.av-table-card thead tr:first-child th:first-child {
    border-top-left-radius: 16px;
}
.av-table-card thead tr:first-child th:last-child {
    border-top-right-radius: 16px;
}

/* 4. Round the BOTTOM corners (Body) */
.av-table-card tbody tr:last-child td:first-child {
    border-bottom-left-radius: 16px;
}
.av-table-card tbody tr:last-child td:last-child {
    border-bottom-right-radius: 16px;
}

          .av-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }

          .av-table thead tr {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          }

          .av-table th {
            padding: 18px 20px;
            text-align: left;
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
          }

          .av-table td {
            padding: 16px 20px;
            border-bottom: 1px solid #f0f9ff;
            color: #1e293b;
            font-size: 14px;
            vertical-align: middle;
          }

          .av-table tbody tr:last-child td { border-bottom: none; }

          .av-table tbody tr {
            transition: background 0.2s;
          }

          .av-table tbody tr:hover td { background: #f0f9ff; }

          /* ── Empty / Loading row ── */
          .av-table-msg td {
            text-align: center;
            padding: 52px 20px;
            color: #94a3b8;
            font-size: 15px;
          }

          .av-table-msg-icon {
            display: flex;
            justify-content: center;
            margin-bottom: 10px;
          }

          .av-table-msg-icon svg {
            width: 42px;
            height: 42px;
            stroke: #bfdbfe;
            fill: none;
            stroke-width: 1.3;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          /* ── Status Badge ── */
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.3px;
            border: 1px solid #93c5fd;
          }

          .status-badge svg {
            width: 10px;
            height: 10px;
            stroke: currentColor;
            fill: none;
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .status-available {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1e40af;
            border-color: #93c5fd;
          }

          .status-unavailable {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            color: #475569;
            border-color: #cbd5e1;
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
          .av-options-cell { position: relative; text-align: center; }

          .av-options-btn {
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

          .av-options-btn:hover {
            background: #f0f9ff;
            border-color: #bfdbfe;
            color: #1e40af;
          }

          .av-options-menu {
            position: absolute;
            right: 0;
            bottom: 100%;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.18), 0 0 0 1px rgba(191, 219, 254, 0.5);
            min-width: 196px;
            z-index: 1000;
            animation: avMenuPop 0.2s ease both;
          }

          .av-menu-item {
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

          .av-menu-item:last-child { border-bottom: none; }
          .av-menu-item:hover { background: #f0f9ff; color: #1e40af; }

          .av-menu-item svg {
            width: 15px;
            height: 15px;
            stroke: currentColor;
            fill: none;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
            flex-shrink: 0;
          }

          .av-menu-item-danger { color: #1e3a8a; }
          .av-menu-item-danger:hover { background: #dbeafe; color: #1e40af; }

          /* ── Modal Overlay ── */
          .av-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(30, 64, 175, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(8px);
            animation: avFadeIn 0.3s ease-out;
            padding: 20px;
          }

          /* ── Dialog ── */
          .av-dialog {
            background: #ffffff;
            padding: 30px;
            border-radius: 16px;
            width: 100%;
            max-width: 440px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25);
            border: 1px solid #e0f2fe;
            animation: avModalPop 0.4s ease-out both;
            font-family: 'Inter', sans-serif;
          }

          .av-dialog-icon {
            width: 62px;
            height: 62px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 18px;
          }

          .av-dialog-icon svg {
            width: 28px;
            height: 28px;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .av-dialog-icon-success {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          }
          .av-dialog-icon-success svg { stroke: #1e40af; }

          .av-dialog-icon-error {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          }
          .av-dialog-icon-error svg { stroke: #1e40af; }

          .av-dialog-title {
            font-size: 22px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 10px;
          }

          .av-dialog-message {
            font-size: 15px;
            color: #64748b;
            margin-bottom: 4px;
            line-height: 1.65;
          }

          .av-dialog-btn {
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

          .av-dialog-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          }

          /* ── Processing Overlay ── */
          .av-processing-overlay {
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

          .av-spinner {
            width: 46px;
            height: 46px;
            border: 4px solid #bfdbfe;
            border-top-color: #1e40af;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 14px;
          }

          .av-processing-text {
            color: #1e40af;
            font-weight: 600;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
          }

          @media (max-width: 900px) {
            .av-page { padding: 24px 16px; }
            .av-title { font-size: 24px; }
            .av-filter-bar { gap: 10px; }
          }
        `}</style>

        {/* ── Processing Overlay ── */}
        {processing && (
          <div className="av-processing-overlay">
            <div className="av-spinner" />
            <div className="av-processing-text">Processing...</div>
          </div>
        )}

        <div className="av-page">

          {/* ── Page Header ── */}
          <div className="av-header">
            <div className="av-header-left">
              <div className="av-header-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="1" y="3" width="15" height="13" rx="1"/>
                  <path d="M16 8h4l3 3v5h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <div>
                <div className="av-title">Active Vehicles</div>
                <div className="av-subtitle">Manage and monitor your fleet vehicles</div>
              </div>
            </div>

            <div>
              <button className="btn-blacklist" onClick={() => router.push(`/adminBlacklistedVehicles?userId=${userId}`)}>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
                Blacklisted Vehicles
              </button>
            </div>
          </div>

          {/* ── Filter Bar ── */}
          <div className="av-filter-bar">
            <div className="av-search-wrap">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                name="search"
                placeholder="Search vehicle number..."
                className="av-search-input"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>

            <select name="type" className="av-filter-select" onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="Own Fleet">Own Fleet</option>
              <option value="Out Source">Out Source</option>
            </select>

            <select name="availability" className="av-filter-select" onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="1">Available</option>
              <option value="0">Unavailable</option>
            </select>

            <select name="category" className="av-filter-select" onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>{capitalizeFirstLetter(cat.category_name)}</option>
              ))}
            </select>

            <select name="expiry" className="av-filter-select" onChange={handleFilterChange}>
              <option value="">All Expiry Status</option>
              <option value="expired">Expired</option>
              <option value="today">Expiring Today</option>
              <option value="month">Expiring This Month</option>
            </select>
          </div>

          {/* ── Table ── */}
          <div className="av-table-card">
            <table className="av-table">
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Type</th>
                  <th>Category</th>
                  {showExpiryColumns && <th>License Expiry</th>}
                  {showExpiryColumns && <th>Insurance Expiry</th>}
                  <th>Status</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="av-table-msg">
                    <td colSpan={showExpiryColumns ? 7 : 5}>
                      <div className="av-table-msg-icon">
                        <svg viewBox="0 0 24 24">
                          <rect x="1" y="3" width="15" height="13" rx="1"/>
                          <path d="M16 8h4l3 3v5h-7V8z"/>
                          <circle cx="5.5" cy="18.5" r="2.5"/>
                          <circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                      </div>
                      Loading vehicles...
                    </td>
                  </tr>
                ) : filteredVehicles.length === 0 ? (
                  <tr className="av-table-msg">
                    <td colSpan={showExpiryColumns ? 7 : 5}>
                      <div className="av-table-msg-icon">
                        <svg viewBox="0 0 24 24">
                          <rect x="1" y="3" width="15" height="13" rx="1"/>
                          <path d="M16 8h4l3 3v5h-7V8z"/>
                          <circle cx="5.5" cy="18.5" r="2.5"/>
                          <circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                      </div>
                      No vehicles found.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((v) => (
                    <tr key={v.vehicle_number}>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{toUpper(v.vehicle_number)}</td>
                      <td style={{ color: '#475569' }}>{v.vehicle_type}</td>
                      <td style={{ color: '#475569' }}>{capitalizeFirstLetter(v.category_name || "Uncategorized")}</td>
                      {showExpiryColumns && (
                        <td>
                          <span className={isExpiring(v.license_expiry_date) ? "expiry-highlight" : ""} style={!isExpiring(v.license_expiry_date) ? {color:'#475569'} : {}}>
                            {formatDate(v.license_expiry_date)}
                          </span>
                        </td>
                      )}
                      {showExpiryColumns && (
                        <td>
                          <span className={isExpiring(v.insurance_expiry_date) ? "expiry-highlight" : ""} style={!isExpiring(v.insurance_expiry_date) ? {color:'#475569'} : {}}>
                            {formatDate(v.insurance_expiry_date)}
                          </span>
                        </td>
                      )}
                      <td>
                        <span className={`status-badge ${v.availability === 1 ? 'status-available' : 'status-unavailable'}`}>
                          {v.availability === 1 ? (
                            <>
                              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                              Available
                            </>
                          ) : (
                            <>
                              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              Unavailable
                            </>
                          )}
                        </span>
                      </td>
                      <td className="av-options-cell">
                        <div ref={openMenuId === v.vehicle_number ? menuRef : null}>
                          <button className="av-options-btn" onClick={() => handleMenuToggle(v.vehicle_number)}>
                            ···
                          </button>
                          {openMenuId === v.vehicle_number && (
                            <div className="av-options-menu">
                              <div className="av-menu-item" onClick={() => handleViewDetails(v.vehicle_number)}>
                                <svg viewBox="0 0 24 24">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                                View Details
                              </div>
                              <div className="av-menu-item av-menu-item-danger" onClick={() => handleAddToBlacklist(v.vehicle_number)}>
                                <svg viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                                </svg>
                                Add to Blacklist
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
          <div className="av-modal-overlay">
            <div className="av-dialog">
              <div className={`av-dialog-icon ${dialog.isError ? 'av-dialog-icon-error' : 'av-dialog-icon-success'}`}>
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
              <div className="av-dialog-title">{dialog.title}</div>
              <p className="av-dialog-message">{dialog.message}</p>
              <button className="av-dialog-btn" onClick={() => setDialog({ ...dialog, isOpen: false })}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}

export default function AdminVehicles() {
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
      <AdminVehiclesContent />
    </Suspense>
  );
}