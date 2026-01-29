'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../../components/adminNavbar';
// Professional line-art (sketch) icons
import { 
  HiOutlineHome, 
  HiOutlineBell, 
  HiOutlineUsers, 
  HiOutlineClipboardDocumentList, 
  HiOutlineTruck, 
  HiOutlineUserGroup 
} from "react-icons/hi2";

const AdminDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  const dashboardStats = [
    { 
      title: 'Users', 
      subtitle: 'Total Volume', 
      count: '03', 
      path: '/adminUsers',
      icon: <HiOutlineUsers />
    },
    { 
      title: 'Assignments', 
      subtitle: 'Active Monthly', 
      count: '27', 
      path: '/assignments',
      icon: <HiOutlineClipboardDocumentList />
    },
    { 
      title: 'Vehicles', 
      subtitle: 'Fleet Capacity', 
      count: '40', 
      path: '/vehicle-dashboard',
      icon: <HiOutlineTruck />
    },
    { 
      title: 'Drivers', 
      subtitle: 'Registered Staff', 
      count: '40', 
      path: '/drivers',
      icon: <HiOutlineUserGroup />
    },
  ];

  const handleNavigation = (path) => {
    const fullPath = userId ? `${path}?userId=${userId}` : path;
    router.push(fullPath);
  };

  return (
    <div style={{ 
      marginLeft: "250px", 
      minHeight: "100vh",
      // Background Gradient Palette
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', 'Segoe UI', sans-serif"
    }}>
      
      <Sidebar />

      {/* --- Top Header Section --- */}
      <div style={{ padding: "40px 50px 20px 50px" }}>
        <h2 style={{ 
          color: "#1e293b", // Dark slate
          margin: "0 0 30px 0", 
          fontSize: "2rem",
          fontWeight: "800",
          letterSpacing: "-0.02em"
        }}>
          Control Center Dashboard
        </h2>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          <button 
            onClick={() => handleNavigation('/dashboard')}
            style={{
              // Button Gradient
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: "white",
              border: "none",
              padding: "12px 35px",
              borderRadius: "14px",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 25px rgba(37, 99, 235, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(37, 99, 235, 0.2)";
            }}
          >
            <HiOutlineHome style={{ fontSize: "20px" }} />
            Home View
          </button>

          <div 
            style={{ position: "relative", cursor: "pointer" }} 
            onClick={() => handleNavigation('/notifications')}
          >
            <div style={{ 
              fontSize: "26px", 
              background: "white", 
              borderRadius: "16px", 
              width: "55px", 
              height: "55px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              boxShadow: "0 8px 15px rgba(0,0,0,0.05)",
              border: "1px solid #bfdbfe", // Light blue border
              color: "#475569" // Medium slate
            }}>
              <HiOutlineBell />
            </div>
            <span style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "#ef4444",
              color: "white",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
              border: "3px solid #e0f2fe"
            }}>
              3
            </span>
          </div>
        </div>
      </div>

      {/* --- Main Content Grid --- */}
      <div style={{ 
        flex: 1, 
        padding: "30px 50px 50px 50px", 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
        gap: "35px",
        alignContent: "start"
      }}>
        {dashboardStats.map((item, index) => (
          <div 
            key={index}
            onClick={() => handleNavigation(item.path)}
            style={{
              background: "#f8fafc", // Very light background
              borderRadius: "28px",
              padding: "35px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
              border: "1px solid #ffffff",
              cursor: "pointer",
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-10px)";
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(59, 130, 246, 0.1)";
              e.currentTarget.style.background = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.03)";
              e.currentTarget.style.background = "#f8fafc";
            }}
          >
            <div style={{ 
              fontSize: "30px", 
              color: "#3b82f6", 
              marginBottom: "15px",
              background: "#f0f9ff",
              padding: "15px",
              borderRadius: "20px"
            }}>
              {item.icon}
            </div>
            
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "700", 
              margin: "0 0 5px 0", 
              color: "#1e293b" 
            }}>
              {item.title}
            </h3>
            
            <span style={{ 
              fontSize: "13px", 
              color: "#64748b", // Light slate
              marginBottom: "20px",
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              {item.subtitle}
            </span>

            <div style={{ 
              fontSize: "60px", 
              fontWeight: "900", 
              color: "#3b82f6", // Main Blue count
              lineHeight: "1",
              textShadow: "0 10px 20px rgba(59, 130, 246, 0.15)"
            }}>
              {item.count}
            </div>
          </div>
        ))}
      </div>

      {/* --- Footer --- */}
      <footer style={{
        // Table Header Gradient style for footer consistency
        background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
        color: "white",
        textAlign: "center",
        padding: "20px",
        fontSize: "14px",
        fontWeight: "500",
        marginTop: "auto",
        letterSpacing: "0.02em"
      }}>
        © 2026 City Lion Express Tours • Premium Logistics Excellence
      </footer>

    </div>
  );
};

export default AdminDashboard;