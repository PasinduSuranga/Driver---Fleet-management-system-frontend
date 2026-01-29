'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const AdminNotifications = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  // Mock Notification Data based on the screenshot
  const notifications = [
    { id: 1, text: "License for Vehicle WP - AB - 1111 is Expiring in 3 Days" },
    { id: 2, text: "License of Driver CLEDR - 0001: Gishan Bandara Expiring in Two days" },
    { id: 3, text: "Insurance for Vehicle WP - CC - 1112 is Expiring Tomorrow" },
    { id: 4, text: "License of Driver CLEDR - 0056: Pasindu Kumarage expired" },
    { id: 5, text: "License and Insurance for Vehicle SP - AB - 1113 is Expiring Today" },
  ];

  // Navigation Helper
  const handleNavigation = (path) => {
    const fullPath = userId ? `${path}?userId=${userId}` : path;
    router.push(fullPath);
  };

  return (
    <div style={{ 
      width: "100%", // FULL SCREEN WIDTH
      minHeight: "100vh",
      background: "#f0f4f8", 
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Segoe UI', Roboto, sans-serif"
    }}>
      
      {/* --- Header Section --- */}
      <div style={{ padding: "30px 40px 10px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button 
          onClick={() => handleNavigation('/dashboard')}
          style={{
            background: "#2563eb", 
            color: "white",
            border: "none",
            padding: "10px 30px",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "16px",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)"
          }}
        >
          Home
        </button>

        <div style={{ position: "relative" }}>
          <div style={{ 
            fontSize: "28px", background: "white", borderRadius: "50%", 
            width: "45px", height: "45px", display: "flex", 
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0"
          }}>
            🔔
          </div>
          <span style={{
            position: "absolute", top: "-5px", right: "-5px",
            background: "red", color: "white", borderRadius: "50%",
            width: "22px", height: "22px", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: "bold", border: "2px solid white"
          }}>
            3
          </span>
        </div>
      </div>

      {/* --- Main Content Section --- */}
      <div style={{ flex: 1, padding: "20px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        <h1 style={{ 
          fontSize: "clamp(2rem, 5vw, 3rem)", // Responsive font size
          fontWeight: "800", 
          color: "#000", 
          marginBottom: "40px",
          textAlign: "center"
        }}>
          Notifications
        </h1>

        {/* Notifications Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", // Adaptive grid for full screen
          gap: "20px", 
          width: "100%", 
          maxWidth: "1200px" 
        }}>
          {notifications.map((note) => (
            <div 
              key={note.id}
              style={{
                background: "white",
                border: "1px solid #ef4444", 
                borderRadius: "12px",
                padding: "20px 25px",
                fontSize: "17px",
                fontWeight: "500",
                color: "#334155",
                lineHeight: "1.4",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.01)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              {note.text}
            </div>
          ))}
        </div>

        {/* Centered Back Button */}
        <button 
          onClick={() => router.back()}
          style={{
            marginTop: "60px",
            background: "linear-gradient(180deg, #3b82f6 0%, #1e40af 100%)",
            color: "white",
            border: "none",
            width: "220px",
            padding: "15px 0",
            borderRadius: "12px",
            fontWeight: "700",
            fontSize: "18px",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(30, 64, 175, 0.3)",
            transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.transform = "translateY(-3px)"}
          onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
        >
          Back
        </button>
      </div>

      {/* --- Footer --- */}
      <footer style={{
        background: "#2563eb",
        color: "white",
        textAlign: "center",
        padding: "15px",
        fontSize: "14px",
        marginTop: "auto",
        width: "100%"
      }}>
        © 2025 City Lion Express Tours. All Rights Reserved.
      </footer>

    </div>
  );
};

export default AdminNotifications;