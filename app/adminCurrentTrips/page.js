'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../../components/adminNavbar';
// Professional Line-art / Sketch icons
import { 
  HiOutlineHome, 
  HiOutlineBell, 
  HiOutlineMagnifyingGlass, 
  HiOutlineEye,
  HiOutlineMapPin
} from "react-icons/hi2";

const AdminAssignments = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Data (CLEAS - 000X)
  const assignmentsList = [
    { id: '1', assignmentId: 'CLEAS - 0001' },
    { id: '2', assignmentId: 'CLEAS - 0002' },
    { id: '3', assignmentId: 'CLEAS - 0003' },
    { id: '4', assignmentId: 'CLEAS - 0004' },
    { id: '5', assignmentId: 'CLEAS - 0005' },
  ];

  const handleNavigation = (path) => {
    const fullPath = userId ? `${path}?userId=${userId}` : path;
    router.push(fullPath);
  };

  const handleViewAssignment = (id) => {
    const path = `/assignment-details?id=${id}${userId ? `&userId=${userId}` : ''}`;
    router.push(path);
  };

  return (
    <div style={{ 
      marginLeft: "250px", // Sidebar Space
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

        {/* Notification Bell */}
        <div onClick={() => handleNavigation('/notifications')} style={{ position: "relative", cursor: "pointer" }}>
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
      <div style={{ padding: "10px 50px", textAlign: "center" }}>
        <h2 style={{ 
          color: "#1e293b", // Dark slate
          fontSize: "2.2rem", 
          fontWeight: "800", 
          margin: "0 0 10px 0",
          letterSpacing: "-0.02em"
        }}>
          Ongoing Trips
        </h2>
        <p style={{ color: "#64748b", fontWeight: "500" }}>Live fleet activity and deployment status</p>
      </div>

      {/* --- Search Bar with Sketch Icon --- */}
      <div style={{ padding: "20px 50px", maxWidth: "800px", width: "100%", margin: "0 auto" }}>
        <div style={{ position: 'relative' }}>
          <HiOutlineMagnifyingGlass style={{
            position: "absolute",
            left: "18px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8",
            fontSize: "22px"
          }} />
          <input 
            type="text" 
            placeholder="Search by Assignment ID or Client Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "16px 20px 16px 55px",
              borderRadius: "16px",
              border: "1.5px solid #cbd5e1",
              fontSize: "16px",
              outline: "none",
              color: "#1e293b",
              backgroundColor: "white",
              boxShadow: "0 4px 10px rgba(0,0,0,0.02)",
              transition: "all 0.3s ease"
            }}
            onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
            onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
          />
        </div>
      </div>

      {/* --- Assignments List --- */}
      <div style={{ 
        flex: 1, 
        padding: "0 50px 50px 50px", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        gap: "18px"
      }}>
        {assignmentsList.map((assignment, index) => (
          <div 
            key={index}
            style={{
              width: "100%",
              maxWidth: "900px",
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
            {/* ID & Status Icon */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ 
                background: "#f0f9ff", 
                padding: "10px", 
                borderRadius: "12px", 
                color: "#3b82f6" 
              }}>
                <HiOutlineMapPin style={{ fontSize: "24px" }} />
              </div>
              <span style={{ 
                fontSize: "18px", 
                fontWeight: "600", 
                color: "#1e293b", 
                letterSpacing: "0.5px"
              }}>
                {assignment.assignmentId}
              </span>
            </div>

            {/* View Button */}
            <button
              onClick={() => handleViewAssignment(assignment.id)}
              style={{
                // Darker blue style for action button
                background: "#1e40af", 
                color: "white",
                border: "none",
                padding: "10px 35px",
                borderRadius: "30px", // Pill Shape
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
              View Itinerary
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
        © 2026 City Lion Express Tours • Premium Fleet Orchestration
      </footer>

    </div>
  );
};

export default AdminAssignments;