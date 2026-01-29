'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../../components/adminNavbar';
// Professional Line-art / Sketch icons
import { 
  HiOutlineUserGroup, 
  HiOutlineHome, 
  HiOutlineBell, 
  HiOutlineMagnifyingGlass,
  HiOutlineEye,
  HiOutlineAdjustmentsHorizontal
} from "react-icons/hi2";

const AdminDrivers = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  
  const [searchTerm, setSearchTerm] = useState('');

  const driversList = [
    { id: '1', driverId: 'CLEDR - 0001' },
    { id: '2', driverId: 'CLEDR - 0002' },
    { id: '3', driverId: 'CLEDR - 0003' },
    { id: '4', driverId: 'CLEDR - 0004' },
    { id: '5', driverId: 'CLEDR - 0005' },
    { id: '6', driverId: 'CLEDR - 0006' },
  ];

  const handleNavigation = (path) => {
    const fullPath = userId ? `${path}?userId=${userId}` : path;
    router.push(fullPath);
  };

  const handleViewDriver = (id) => {
    const path = `/driver-details?id=${id}${userId ? `&userId=${userId}` : ''}`;
    router.push(path);
  };

  return (
    <div style={{ 
      marginLeft: "250px", // STRICT: Sidebar Space
      minHeight: "100vh",
      // Background Gradient Palette
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)', 
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', 'Segoe UI', sans-serif"
    }}>
      
      <Sidebar />

      {/* --- Header Section --- */}
      <div style={{ padding: "30px 50px 10px 50px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        <button 
          onClick={() => handleNavigation('/dashboard')}
          style={{
            // Button Gradient
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
            color: "white",
            border: "none",
            padding: "12px 30px",
            borderRadius: "12px",
            fontWeight: "700",
            fontSize: "15px",
            cursor: "pointer",
            boxShadow: "0 10px 15px rgba(37, 99, 235, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
        >
          <HiOutlineHome style={{ fontSize: "20px" }} />
          Home
        </button>

        {/* Notification Bell with Badge */}
        <div 
          onClick={() => handleNavigation('/notifications')} 
          style={{ position: "relative", cursor: "pointer" }}
        >
          <div style={{ 
            fontSize: "24px", 
            background: "white", 
            borderRadius: "14px", 
            width: "50px", 
            height: "50px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            boxShadow: "0 8px 12px rgba(0,0,0,0.05)",
            border: "1px solid #bfdbfe",
            color: "#475569"
          }}>
            <HiOutlineBell />
          </div>
          <span style={{
            position: "absolute", top: "-4px", right: "-4px",
            background: "#ef4444", color: "white", borderRadius: "50%",
            width: "22px", height: "22px", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "11px", fontWeight: "bold", border: "3px solid #e0f2fe"
          }}>
            3
          </span>
        </div>
      </div>

      {/* --- Page Title --- */}
      <div style={{ padding: "10px 50px" }}>
        <h2 style={{ 
          color: "#1e293b", // Dark slate
          fontSize: "1.8rem", 
          fontWeight: "800",
          letterSpacing: "-0.02em"
        }}>
          Personnel Registry
        </h2>
      </div>

      {/* --- Search & Filter Bar --- */}
      <div style={{ 
        padding: "0 50px", 
        display: "flex", 
        gap: "20px",
        marginBottom: "25px"
      }}>
        {/* Search Input with Sketch Icon */}
        <div style={{ position: 'relative', flex: 1 }}>
          <HiOutlineMagnifyingGlass style={{
            position: "absolute",
            left: "15px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8",
            fontSize: "20px"
          }} />
          <input 
            type="text" 
            placeholder="Search by Personnel ID or Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 20px 14px 50px",
              borderRadius: "14px",
              border: "1.5px solid #cbd5e1",
              fontSize: "15px",
              outline: "none",
              color: "#1e293b",
              backgroundColor: "white",
              transition: "border-color 0.3s ease"
            }}
            onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
            onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
          />
        </div>

        {/* Filter Dropdown with Sketch Icon */}
        <div style={{ position: 'relative' }}>
          <HiOutlineAdjustmentsHorizontal style={{
            position: "absolute",
            left: "15px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#64748b",
            fontSize: "20px",
            pointerEvents: "none"
          }} />
          <select style={{
            padding: "14px 45px 14px 45px",
            borderRadius: "14px",
            border: "1.5px solid #cbd5e1",
            fontSize: "15px",
            backgroundColor: "white",
            color: "#475569",
            cursor: "pointer",
            appearance: "none",
            minWidth: "160px",
            fontWeight: "600"
          }}>
            <option>All Drivers</option>
            <option>Active Status</option>
            <option>Inactive Status</option>
          </select>
          <span style={{
            position: "absolute",
            right: "15px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            fontSize: "12px",
            color: "#64748b"
          }}>
            ▼
          </span>
        </div>
      </div>

      {/* --- Drivers List --- */}
      <div style={{ 
        flex: 1, 
        padding: "0 50px 50px 50px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "18px"
      }}>
        {driversList.map((driver, index) => (
          <div 
            key={index}
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid #ffffff",
              borderRadius: "20px",
              padding: "18px 35px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 10px 20px rgba(0,0,0,0.03)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.transform = "translateX(8px)";
              e.currentTarget.style.borderColor = "#bfdbfe";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
              e.currentTarget.style.transform = "translateX(0)";
              e.currentTarget.style.borderColor = "#ffffff";
            }}
          >
            {/* Driver ID & Icon */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ 
                background: "#f0f9ff", 
                padding: "10px", 
                borderRadius: "12px", 
                color: "#3b82f6" 
              }}>
                <HiOutlineUserGroup style={{ fontSize: "24px" }} />
              </div>
              <span style={{ 
                fontSize: "18px", 
                fontWeight: "600", 
                color: "#1e293b", 
                letterSpacing: "0.5px"
              }}>
                {driver.driverId}
              </span>
            </div>

            {/* View Action Button */}
            <button
              onClick={() => handleViewDriver(driver.id)}
              style={{
                // Darker blue style for action button
                background: "#1e40af", 
                color: "white",
                border: "none",
                padding: "10px 35px",
                borderRadius: "30px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "#3b82f6"}
              onMouseLeave={(e) => e.target.style.background = "#1e40af"}
            >
              <HiOutlineEye style={{ fontSize: "18px" }} />
              View Detail
            </button>
          </div>
        ))}
      </div>

      {/* --- Footer --- */}
      <footer style={{
        // Table Header Gradient style for consistency
        background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
        color: "white",
        textAlign: "center",
        padding: "20px",
        fontSize: "14px",
        fontWeight: "500",
        marginTop: "auto",
        width: "100%",
        letterSpacing: "0.02em"
      }}>
        © 2026 City Lion Express Tours • Personnel Management Excellence
      </footer>

    </div>
  );
};

export default AdminDrivers;