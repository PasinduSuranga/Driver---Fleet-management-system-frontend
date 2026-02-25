'use client';

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/userHeader"; 

export default function DriversDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  // Data States
  const [allDrivers, setAllDrivers] = useState([]); // Stores raw list from DB
  const [filteredDrivers, setFilteredDrivers] = useState([]); // Stores filtered list
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); // Action loading state

  // Filter States
  const [filters, setFilters] = useState({
    search: "",
    status: "", // "1" (Available) / "0" (Unavailable)
    expiry: ""  // expired / today / month
  });

  // Dialog State
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    isError: false
  });

  // Options Menu State
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // --- 1. INITIAL DATA FETCH ---
  const fetchData = async () => {
    setLoading(true);
    try {
        const res = await fetch("http://localhost:5000/driver/list");
        const data = await res.json();
        setAllDrivers(data);
        setFilteredDrivers(data); 
    } catch (error) {
        console.error("Error fetching drivers:", error);
        setDialog({
            isOpen: true,
            title: "Connection Error",
            message: "Failed to fetch driver data.",
            isError: true
        });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // --- 2. LIVE FRONTEND FILTERING LOGIC ---
  useEffect(() => {
    let result = allDrivers;

    // Filter by Search (Driver ID or Name)
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        result = result.filter(d => 
            (d.name && d.name.toLowerCase().includes(searchTerm)) ||
            (d.driver_id && String(d.driver_id).toLowerCase().includes(searchTerm))
        );
    }

    // Filter by Status (is_available: 1 = Available, 0 = Unavailable)
    if (filters.status !== "") {
        result = result.filter(d => {
            // Safely convert to string to handle Number(1) vs String("1")
            return String(d.is_available) === filters.status;
        });
    }

    // Filter by License Expiry
    if (filters.expiry) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to midnight

        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        result = result.filter(d => {
            if (!d.expiry_date) return false;
            
            const expiryDate = new Date(d.expiry_date);
            expiryDate.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day comparison

            if (filters.expiry === "expired") {
                // Strictly earlier than today
                return expiryDate < today;
            }
            if (filters.expiry === "today") {
                // Exact match of time value after removing hours
                return expiryDate.getTime() === today.getTime();
            }
            if (filters.expiry === "month") {
                // Same month and same year
                return expiryDate.getMonth() === currentMonth && expiryDate.getFullYear() === currentYear;
            }
            return false;
        });
    }

    setFilteredDrivers(result);
  }, [filters, allDrivers]); 

  // --- HANDLERS ---
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleMenuToggle = (driverId) => {
    setOpenMenuId(openMenuId === driverId ? null : driverId);
  };

  const handleViewDetails = (driverId) => {
    router.push(`/viewDriver?userId=${userId}&driverId=${driverId}`);
  };

  const handleUpdateDetails = (driverId) => {
    router.push(`/updateDriver?userId=${userId}&driverId=${driverId}`);
  };

  // --- BLACKLIST HANDLER ---
  const handleAddToBlacklist = async (driverId) => {
    setOpenMenuId(null);
    setProcessing(true);

    try {
        const response = await fetch("http://localhost:5000/driver/blacklist", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ driverId }),
        });

        const data = await response.json();

        if (response.ok) {
            setDialog({
                isOpen: true,
                title: "Success",
                message: data.message,
                isError: false
            });
            fetchData(); // Refresh list to remove blacklisted driver
        } else {
            setDialog({
                isOpen: true,
                title: "Error",
                message: data.message || "Failed to blacklist driver.",
                isError: true
            });
        }
    } catch (error) {
        console.error("Blacklist Error:", error);
        setDialog({
            isOpen: true,
            title: "Network Error",
            message: "Unable to reach the server. Please try again.",
            isError: true
        });
    } finally {
        setProcessing(false);
    }
  };

  // --- HELPERS ---
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
    
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    if (filters.expiry === "month") return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    
    return false;
  };

  const showExpiryColumn = filters.expiry !== "";

function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .page-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
            padding: 120px 40px 40px;
            animation: fadeIn 0.6s ease-out;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            animation: slideIn 0.5s ease-out;
        }

        .title {
            font-size: 32px;
            font-weight: 800;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header-actions {
            display: flex;
            gap: 12px;
        }

        .nav-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s;
            color: white;
        }

        .btn-back {
            background: white;
            color: #3b82f6;
            border: 2px solid #bfdbfe;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }
        .btn-back:hover { 
            background: #f0f9ff; 
            transform: translateX(-3px); 
            border-color: #3b82f6;
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.2);
        }

        .btn-add {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        }
        .btn-add:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4); 
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
        }

        /* --- FILTERS BAR --- */
        .filter-bar {
            background: white;
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            align-items: center;
            margin-bottom: 30px;
            border: 1px solid #e0f2fe;
            animation: fadeIn 0.8s ease-out;
        }

        .search-input {
            padding: 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            flex: 1;
            min-width: 250px;
            font-size: 14px;
            outline: none;
            transition: all 0.2s;
            background: #f8fafc;
            color: #1e293b;
        }

        .search-input::placeholder {
            color: #94a3b8;
        }

        .search-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: white;
        }

        .filter-select {
            padding: 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            background: #f8fafc;
            font-size: 14px;
            cursor: pointer;
            outline: none;
            min-width: 180px;
            transition: all 0.2s;
            color: #475569;
        }

        .filter-select:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: white;
        }

        /* --- TABLE STYLES --- */
        .table-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
            overflow: visible; 
            border: 1px solid #e0f2fe;
            animation: fadeIn 1s ease-out;
        }

        table { 
            width: 100%; 
            border-collapse: collapse; 
        }
        
        th { 
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            padding: 18px 20px; 
            text-align: left; 
            color: white;
            font-size: 14px; 
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        th:first-child {
            border-top-left-radius: 16px;
        }
        
        th:last-child {
            border-top-right-radius: 16px;
        }
        
        td { 
            padding: 16px 20px; 
            border-bottom: 1px solid #f0f9ff; 
            color: #1e293b; 
            font-size: 14px; 
        }

        tbody tr {
            transition: all 0.2s;
            position: relative;
        }

        tbody tr:hover {
            background: #f0f9ff;
        }

        tbody tr:last-child td:first-child {
            border-bottom-left-radius: 16px;
        }

        tbody tr:last-child td:last-child {
            border-bottom-right-radius: 16px;
        }
        
        .status-badge {
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
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

        .expiry-highlight {
            color: #1e40af;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            padding: 6px 12px;
            border-radius: 8px;
            border: 1px solid #93c5fd;
            font-weight: 600;
            display: inline-block;
        }

        /* --- OPTIONS MENU STYLES --- */
        .options-cell {
            position: relative;
        }

        .options-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px 12px;
            font-size: 20px;
            color: #64748b;
            transition: all 0.2s;
            border-radius: 8px;
            font-weight: bold;
        }

        .options-btn:hover {
            background: #f0f9ff;
            color: #3b82f6;
        }

        .options-menu {
            position: absolute;
            right: 0;
            bottom: 100%;
            margin-bottom: 8px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
            border: 1px solid #e0f2fe;
            min-width: 200px;
            z-index: 1000;
            overflow: hidden;
            animation: slideIn 0.2s ease-out;
        }

        .menu-item {
            padding: 12px 16px;
            cursor: pointer;
            transition: all 0.2s;
            color: #1e293b;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid #f0f9ff;
        }

        .menu-item:last-child {
            border-bottom: none;
        }

        .menu-item:hover {
            background: #f0f9ff;
            color: #3b82f6;
        }

        .menu-icon {
            font-size: 16px;
            width: 20px;
            text-align: center;
            color: #64748b;
        }

        .menu-item:hover .menu-icon {
            color: #3b82f6;
        }

        /* --- LOADING OVERLAY --- */
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(240, 249, 255, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 4000;
            backdrop-filter: blur(8px);
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #e0f2fe;
            border-top: 5px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 15px;
        }

        .loading-text {
            color: #1e40af;
            font-weight: 600;
            font-size: 16px;
        }

        /* --- DIALOG STYLES --- */
        .dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(30, 64, 175, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            backdrop-filter: blur(8px);
            animation: fadeIn 0.2s ease-out;
        }

        .dialog-content {
            background: white;
            padding: 30px;
            border-radius: 16px;
            width: 90%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25);
            border: 1px solid #e0f2fe;
            animation: slideIn 0.3s ease-out;
        }

        .dialog-icon {
            font-size: 48px;
            margin-bottom: 15px;
            display: block;
        }

        .dialog-icon.error {
            color: #64748b;
        }

        .dialog-icon.success {
            color: #3b82f6;
        }

        .dialog-title {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 10px;
        }

        .dialog-message {
            font-size: 15px;
            color: #64748b;
            margin-bottom: 25px;
            line-height: 1.5;
        }

        .dialog-button {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.2s;
            width: 100%;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }

        .dialog-button:hover {
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .page-container {
                padding: 100px 20px 30px;
            }

            .page-header {
                flex-direction: column;
                gap: 15px;
                align-items: flex-start;
            }

            .header-actions {
                width: 100%;
                flex-direction: column;
            }

            .nav-btn {
                width: 100%;
                justify-content: center;
            }

            .filter-bar {
                padding: 20px;
            }

            .search-input {
                width: 100%;
            }

            .filter-select {
                width: 100%;
            }

            .table-container {
                overflow-x: auto;
            }

            table {
                min-width: 600px;
            }
        }

        @media (max-width: 480px) {
            .title {
                font-size: 24px;
            }

            th, td {
                padding: 12px 15px;
                font-size: 13px;
            }
        }
      `}</style>

      {/* Header */}
      <Header userId={userId} />

      {/* --- LOADING SPINNER OVERLAY --- */}
      {processing && (
        <div className="loading-overlay">
            <div className="spinner"></div>
            <div className="loading-text">Processing...</div>
        </div>
      )}

      <div className="page-container">
        <div className="page-header">
            <h1 className="title">Driver Management</h1>
            <div className="header-actions">
                <button className="nav-btn btn-add" onClick={() => router.push(`/addDriver?userId=${userId}`)}>
                    <span>+</span> Add Driver
                </button>
                <button className="nav-btn btn-back" onClick={() => router.push(`/userDashboard?userId=${userId}`)}>
                    <span>←</span> Back
                </button>
            </div>
        </div>

        {/* --- FILTERS --- */}
        <div className="filter-bar">
            {/* 1. Search */}
            <input 
                type="text" 
                name="search"
                placeholder="Search Driver Name or ID..." 
                className="search-input"
                value={filters.search}
                onChange={handleFilterChange}
            />

            {/* 2. Filter by Status */}
            <select name="status" className="filter-select" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Statuses</option>
                <option value="1">Available</option>
                <option value="0">Unavailable</option>
            </select>

            {/* 3. Filter by Expiry */}
            <select name="expiry" className="filter-select" value={filters.expiry} onChange={handleFilterChange}>
                <option value="">All Expiry Status</option>
                <option value="expired">License Expired</option>
                <option value="today">Expiring Today</option>
                <option value="month">Expiring This Month</option>
            </select>
        </div>

        {/* --- DATA TABLE --- */}
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Driver ID</th>
                        <th>Name</th>
                        {showExpiryColumn && <th>License Expiry</th>}
                        <th>Status</th>
                        <th style={{width: '80px', textAlign: 'center'}}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={showExpiryColumn ? 5 : 4} style={{textAlign: "center", color: "#64748b"}}>Loading...</td></tr>
                    ) : filteredDrivers.length === 0 ? (
                        <tr><td colSpan={showExpiryColumn ? 5 : 4} style={{textAlign: "center", color: "#64748b"}}>No drivers found.</td></tr>
                    ) : (
                        filteredDrivers.map((d) => (
                            <tr key={d.driver_id}>
                                <td>{d.driver_id}</td>
                                <td>{capitalizeFirstLetter(d.name)}</td>
                                {showExpiryColumn && (
                                    <td>
                                        <span className={isExpiring(d.expiry_date) ? "expiry-highlight" : ""}>
                                            {formatDate(d.expiry_date)}
                                        </span>
                                    </td>
                                )}
                                <td>
                                    <span className={`status-badge ${String(d.is_available) === '1' ? 'status-available' : 'status-unavailable'}`}>
                                        {String(d.is_available) === '1' ? 'Available' : 'Unavailable'}
                                    </span>
                                </td>
                                <td className="options-cell">
                                    <div ref={openMenuId === d.driver_id ? menuRef : null}>
                                        <button 
                                            className="options-btn"
                                            onClick={() => handleMenuToggle(d.driver_id)}
                                        >
                                            ⋮
                                        </button>
                                        {openMenuId === d.driver_id && (
                                            <div className="options-menu">
                                                <div 
                                                    className="menu-item"
                                                    onClick={() => handleViewDetails(d.driver_id)}
                                                >
                                                    <span className="menu-icon">👁</span>
                                                    View Details
                                                </div>
                                                <div 
                                                    className="menu-item"
                                                    onClick={() => handleUpdateDetails(d.driver_id)}
                                                >
                                                    <span className="menu-icon">✎</span>
                                                    Update Details
                                                </div>
                                                <div 
                                                    className="menu-item"
                                                    onClick={() => handleAddToBlacklist(d.driver_id)}
                                                >
                                                    <span className="menu-icon">⊗</span>
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

      {/* --- DIALOG BOX --- */}
      {dialog.isOpen && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <span className={`dialog-icon ${dialog.isError ? 'error' : 'success'}`}>
              {dialog.isError ? "⚠" : "✓"}
            </span>
            <h3 className="dialog-title">{dialog.title}</h3>
            <p className="dialog-message">{dialog.message}</p>
            <button className="dialog-button" onClick={() => setDialog({ ...dialog, isOpen: false })}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}