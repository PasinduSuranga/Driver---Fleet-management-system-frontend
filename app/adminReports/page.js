'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../../components/adminNavbar';
// Professional Line-art / Sketch icons
import { 
  HiOutlineHome, 
  HiOutlineBell, 
  HiOutlineCalendar, 
  HiOutlineDocumentChartBar,
  HiOutlineArrowLeft,
  HiOutlineArrowDownTray,
  HiOutlineSparkles
} from "react-icons/hi2";

const AdminReports = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  const [timePeriod, setTimePeriod] = useState('');
  const [reportType, setReportType] = useState('');

  const handleNavigation = (path) => {
    const fullPath = userId ? `${path}?userId=${userId}` : path;
    router.push(fullPath);
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

      <Sidebar userId={userId} />
      
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

        <div onClick={() => handleNavigation('/notification')} style={{ position: "relative", cursor: "pointer" }}>
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

      {/* --- Main Content Area --- */}
      <div style={{ 
        flex: 1, 
        padding: "40px 80px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "40px",
        maxWidth: "900px"
      }}>
        
        <div style={{ marginBottom: "10px" }}>
          <h2 style={{ color: "#1e293b", fontSize: "2.2rem", fontWeight: "800", letterSpacing: "-0.02em" }}>
            Analytics & Reports
          </h2>
          <p style={{ color: "#64748b", fontSize: "16px", marginTop: "8px" }}>
            Configure and export system data for fleet performance review.
          </p>
        </div>

        {/* Selection Card */}
        <div style={{
           background: "rgba(255, 255, 255, 0.7)",
           backdropFilter: "blur(10px)",
           padding: "40px",
           borderRadius: "24px",
           border: "1px solid #ffffff",
           boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
           display: "flex",
           flexDirection: "column",
           gap: "30px"
        }}>
          {/* Time Period */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
              <HiOutlineCalendar style={{ fontSize: "20px", color: "#3b82f6" }} />
              Choose Time Period
            </label>
            <div style={{ position: "relative" }}>
              <select 
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: "14px",
                  border: "1.5px solid #cbd5e1",
                  fontSize: "16px",
                  appearance: "none",
                  background: "white",
                  color: "#1e293b",
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <option value="" disabled>Select range...</option>
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last Month</option>
                <option value="yearly">Last Year</option>
              </select>
              <span style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#64748b" }}>▼</span>
            </div>
          </div>

          {/* Report Type */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
              <HiOutlineDocumentChartBar style={{ fontSize: "20px", color: "#3b82f6" }} />
              Choose Report Type
            </label>
            <div style={{ position: "relative" }}>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: "14px",
                  border: "1.5px solid #cbd5e1",
                  fontSize: "16px",
                  appearance: "none",
                  background: "white",
                  color: "#1e293b",
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <option value="" disabled>Select type...</option>
                <option value="financial">Financial Report</option>
                <option value="vehicle">Vehicle Status Report</option>
                <option value="driver">Driver Performance</option>
              </select>
              <span style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#64748b" }}>▼</span>
            </div>
          </div>
        </div>

        {/* --- Action Buttons Section --- */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "15px",
          width: "100%",
          maxWidth: "350px",
          alignSelf: "flex-end",
          marginTop: "10px"
        }}>
          
          <button
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "white",
              border: "none",
              padding: "14px 0",
              borderRadius: "14px",
              fontWeight: "700",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 8px 16px rgba(59, 130, 246, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >
            <HiOutlineSparkles fontSize="20px" /> Generate Report
          </button>

          <button
            style={{
              background: "#1e40af", // Deep Blue from palette
              color: "white",
              border: "none",
              padding: "14px 0",
              borderRadius: "14px",
              fontWeight: "700",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 8px 16px rgba(30, 64, 175, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >
            <HiOutlineArrowDownTray fontSize="20px" /> Download PDF
          </button>

          <button
            onClick={() => router.back()}
            style={{
              background: "white",
              color: "#475569",
              border: "1.5px solid #cbd5e1",
              padding: "14px 0",
              borderRadius: "14px",
              fontWeight: "700",
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
                e.target.style.background = "#f1f5f9";
                e.target.style.borderColor = "#94a3b8";
            }}
            onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.borderColor = "#cbd5e1";
            }}
          >
            <HiOutlineArrowLeft fontSize="20px" /> Back to Dashboard
          </button>
        </div>

      </div>

      {/* --- Footer --- */}
      <footer style={{
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
        © 2026 City Lion Express Tours • Enterprise Intelligence Unit
      </footer>

    </div>
  );
};

export default AdminReports;