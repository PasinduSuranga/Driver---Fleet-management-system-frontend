'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../../components/adminNavbar';
// Professional Line-art / Sketch icons
import { 
  HiOutlineTruck, 
  HiOutlineHome, 
  HiOutlineBell, 
  HiOutlineEye 
} from "react-icons/hi2";

const AdminVehicles = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  // Mock data for vehicle list
  const vehicleList = Array(8).fill({
    registrationNumber: 'WP - AB - 1111',
    id: '1'
  });

  const handleNavigation = (path) => {
    const fullPath = userId ? `${path}?userId=${userId}` : path;
    router.push(fullPath);
  };

  const handleViewVehicle = (vehicleId) => {
    const path = `/vehicle-details?id=${vehicleId}${userId ? `&userId=${userId}` : ''}`;
    router.push(path);
  };

  return (
    <div style={{ 
      marginLeft: "250px", // Sidebar Space Reserved
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
          Fleet Management Overview
        </h2>
      </div>

      {/* --- Main List Content --- */}
      <div style={{ 
        flex: 1, 
        padding: "20px 50px 50px 50px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "18px"
      }}>
        {vehicleList.map((vehicle, index) => (
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
            {/* Vehicle Number & Icon */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ 
                background: "#f0f9ff", 
                padding: "10px", 
                borderRadius: "12px", 
                color: "#3b82f6" 
              }}>
                <HiOutlineTruck style={{ fontSize: "24px" }} />
              </div>
              <span style={{ 
                fontSize: "18px", 
                fontWeight: "600", 
                color: "#1e293b", // Dark slate
                letterSpacing: "0.5px"
              }}>
                {vehicle.registrationNumber}
              </span>
            </div>

            {/* View Action Button */}
            <button
              onClick={() => handleViewVehicle(vehicle.id)}
              style={{
                // Darker blue style for action button
                background: "#1e40af", 
                color: "white",
                border: "none",
                padding: "10px 35px",
                borderRadius: "30px", // Pill shape
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
              View Asset
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
        © 2026 City Lion Express Tours • Premium Logistics Ecosystem
      </footer>

    </div>
  );
};

export default AdminVehicles;