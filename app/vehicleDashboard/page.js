'use client';

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/userHeader"; 

export default function VehiclesDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  // Data States
  const [allVehicles, setAllVehicles] = useState([]); // Stores the full raw list from DB
  const [filteredVehicles, setFilteredVehicles] = useState([]); // Stores the filtered list for display
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    availability: "",
    category: "",
    expiry: "" // Added expiry filter state
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Dialog State
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    isError: false
  });

  // --- 1. INITIAL DATA FETCH (Runs once) ---
  const fetchData = async () => {
    setLoading(true);
    try {
        // Fetch All Vehicles
        const vRes = await fetch("http://localhost:5000/vehicle/vehicles");
        const vData = await vRes.json();
        setAllVehicles(vData);
        setFilteredVehicles(vData); // Initially, display all

        // Fetch Categories
        const cRes = await fetch("http://localhost:5000/category/categories");
        const cData = await cRes.json();
        setCategories(cData);

    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. LIVE FRONTEND FILTERING LOGIC ---
  useEffect(() => {
    let result = allVehicles;

    // Filter by Search (Vehicle Number) - Case insensitive
    if (filters.search) {
        result = result.filter(v => 
            v.vehicle_number?.toLowerCase().includes(filters.search.toLowerCase())
        );
    }

    // Filter by Type
    if (filters.type) {
        result = result.filter(v => v.vehicle_type === filters.type);
    }

    // Filter by Availability (0 = Available, 1 = Unavailable)
    if (filters.availability !== "") {
        result = result.filter(v => String(v.availability) === filters.availability);
    }

    // Filter by Category
    if (filters.category) {
        result = result.filter(v => String(v.category_id) === filters.category);
    }

    // Filter by Expiry (Expired, Today, This Month)
    if (filters.expiry) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        result = result.filter(v => {
            // Helper to parse date string to Date object
            const checkDate = (dateStr) => {
                if (!dateStr) return false;
                const d = new Date(dateStr);
                d.setHours(0, 0, 0, 0); // Normalize time for comparison
                return d;
            };

            const licenseDate = checkDate(v.license_expiry_date);
            const insuranceDate = checkDate(v.insurance_expiry_date);

            // Helper to check conditions against a specific date object
            const matchCondition = (d) => {
                if (!d) return false;
                
                if (filters.expiry === "expired") {
                    return d < today;
                }
                if (filters.expiry === "today") {
                    return d.getTime() === today.getTime();
                }
                if (filters.expiry === "month") {
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                }
                return false;
            };

            // Return true if EITHER license OR insurance matches the filter
            return matchCondition(licenseDate) || matchCondition(insuranceDate);
        });
    }

    setFilteredVehicles(result);
  }, [filters, allVehicles]); 

  // --- HANDLERS ---
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // --- HELPER FUNCTIONS FOR DISPLAY ---
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
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    if (filters.expiry === "expired") return d < today;
    if (filters.expiry === "today") return d.getTime() === today.getTime();
    if (filters.expiry === "month") return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    return false;
  };

  const showExpiryColumns = filters.expiry !== "";

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

        .btn-add-vehicle {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        }
        .btn-add-vehicle:hover { 
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
            gap: 60px;
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
            width: 250px;
            font-size: 14px;
            outline: none;
            transition: all 0.2s;
            background: #f8fafc;
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
            min-width: 150px;
            transition: all 0.2s;
            color: #475569;
        }

        .filter-select:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: white;
        }

        .add-btn {
            margin-left: auto;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .add-btn:hover { 
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        /* --- TABLE STYLES --- */
        .table-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
            overflow: hidden;
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
        
        td { 
            padding: 16px 20px; 
            border-bottom: 1px solid #f0f9ff; 
            color: #1e293b; 
            font-size: 14px; 
        }

        tbody tr {
            transition: all 0.2s;
        }

        tbody tr:hover {
            background: #f0f9ff;
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
            color: #3b82f6;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            padding: 6px 12px;
            border-radius: 8px;
            border: 1px solid #93c5fd;
            font-weight: 600;
            display: inline-block;
        }

        /* --- MODAL --- */
        .modal-overlay {
            position: fixed; 
            top: 0; 
            left: 0; 
            right: 0; 
            bottom: 0;
            background: rgba(30, 64, 175, 0.15); 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            z-index: 2000;
            backdrop-filter: blur(8px);
            animation: fadeIn 0.3s ease-out;
        }
        
        .modal-box {
            background: white; 
            padding: 35px; 
            border-radius: 20px; 
            width: 420px; 
            text-align: center;
            box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25);
            border: 1px solid #e0f2fe;
            animation: slideIn 0.4s ease-out;
        }

        .modal-box h3 {
            font-size: 24px;
            font-weight: 700;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 20px;
        }
        
        .modal-input {
            width: 100%; 
            padding: 14px; 
            border: 2px solid #e2e8f0; 
            border-radius: 10px; 
            margin: 20px 0;
            font-size: 15px;
            outline: none;
            background: #f8fafc;
            transition: all 0.2s;
        }

        .modal-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: white;
        }
        
        .modal-actions { 
            display: flex; 
            gap: 12px; 
            justify-content: center; 
        }
        
        .cancel-btn { 
            background: white; 
            color: #64748b; 
            padding: 12px 24px; 
            border-radius: 10px; 
            border: 2px solid #e2e8f0; 
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
        }

        .cancel-btn:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
        }
        
        .save-btn { 
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
            color: white; 
            padding: 12px 24px; 
            border-radius: 10px; 
            border: none; 
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            transition: all 0.3s;
        }

        .save-btn:hover {
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
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

            .modal-box {
                width: 90%;
                padding: 25px;
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

      <div className="page-container">
        <div className="page-header">
            <h1 className="title">Vehicle Management</h1>
            <div className="header-actions">
                <button className="nav-btn btn-add-vehicle" onClick={() => router.push(`/addVehicle?userId=${userId}`)}>
                    <span>+</span> Add Vehicle
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
                placeholder="Search Vehicle Number..." 
                className="search-input"
                value={filters.search}
                onChange={handleFilterChange}
            />

            {/* 2. Filter by Type */}
            <select name="type" className="filter-select" onChange={handleFilterChange}>
                <option value="">All Types</option>
                <option value="Own Fleet">Own Fleet</option>
                <option value="Out Source">Out Source</option>
            </select>

            {/* 3. Filter by Availability */}
            <select name="availability" className="filter-select" onChange={handleFilterChange}>
                <option value="">All Statuses</option>
                <option value="0">Available</option>
                <option value="1">Unavailable</option>
            </select>

            {/* 4. Filter by Category */}
            <select name="category" className="filter-select" onChange={handleFilterChange}>
                <option value="">All Categories</option>
                {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                    </option>
                ))}
            </select>

            {/* 5. Filter by Expiry (New) */}
            <select name="expiry" className="filter-select" onChange={handleFilterChange}>
                <option value="">All Expiry Status</option>
                <option value="expired">Expired</option>
                <option value="today">Expiring Today</option>
                <option value="month">Expiring This Month</option>
            </select>
        </div>

        {/* --- DATA TABLE --- */}
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Vehicle Number</th>
                        <th>Type</th>
                        <th>Category</th>
                        {showExpiryColumns && <th>License Expiry</th>}
                        {showExpiryColumns && <th>Insurance Expiry</th>}
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={showExpiryColumns ? 6 : 4} style={{textAlign: "center"}}>Loading...</td></tr>
                    ) : filteredVehicles.length === 0 ? (
                        <tr><td colSpan={showExpiryColumns ? 6 : 4} style={{textAlign: "center"}}>No vehicles found.</td></tr>
                    ) : (
                        filteredVehicles.map((v) => (
                            <tr key={v.vehicle_number}>
                                <td>{v.vehicle_number}</td>
                                <td>{v.vehicle_type}</td>
                                <td>{v.category_name || "Uncategorized"}</td>
                                {showExpiryColumns && (
                                    <td>
                                        <span className={isExpiring(v.license_expiry_date) ? "expiry-highlight" : ""}>
                                            {formatDate(v.license_expiry_date)}
                                        </span>
                                    </td>
                                )}
                                {showExpiryColumns && (
                                    <td>
                                        <span className={isExpiring(v.insurance_expiry_date) ? "expiry-highlight" : ""}>
                                            {formatDate(v.insurance_expiry_date)}
                                        </span>
                                    </td>
                                )}
                                <td>
                                    <span className={`status-badge ${v.availability === 0 ? 'status-available' : 'status-unavailable'}`}>
                                        {v.availability === 0 ? 'Available' : 'Unavailable'}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- ADD CATEGORY MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3>Add New Category</h3>
                <input 
                    type="text" 
                    placeholder="Enter category name" 
                    className="modal-input"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                />
                <div className="modal-actions">
                    <button onClick={() => setIsModalOpen(false)} className="cancel-btn">Cancel</button>
                    <button onClick={handleAddCategory} className="save-btn">Save Category</button>
                </div>
            </div>
        </div>
      )}

      {/* --- DIALOG BOX --- */}
      {dialog.isOpen && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <span className="dialog-icon">
              {dialog.isError ? "⚠︎" : "✓"}
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