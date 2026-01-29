'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
   
  // 1. Get userId from URL
  const userId = searchParams.get('userId');

  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState({ name: 'Loading...', role: '...' });

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Fetch User Data when userId exists
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const res = await axios.get(`http://localhost:5000/authentication/getUsers/${userId}`);
          const user = Array.isArray(res.data) ? res.data[0] : res.data;
           
          if (user) {
            setUserData({ name: user.name, role: user.role });
          }
        } catch (err) {
          console.error("Error fetching user details:", err);
          setUserData({ name: 'User', role: 'Guest' });
        }
      } else {
        setUserData({ name: 'Admin', role: 'System' });
      }
    };

    fetchUserData();
  }, [userId]);

  const handleLogout = () => {
    sessionStorage.removeItem("userToken");
    sessionStorage.removeItem("userTokenexpiry");
    router.push("/");
  };

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/adminDashboard', 
      icon: '⌂',
      subPaths: ['/adminDashboard', '/admin-dashboard', '/user-dashboard', '/vehicle-driver-dashboard']
    },
    { 
      name: 'Users', 
      path: '/adminUsers', 
      icon: '👤︎',
      subPaths: ['/adminUsers', '/user-profile', '/user-settings']
    },
    { 
      name: 'Vehicles', 
      path: '/adminVehicles', 
      icon: '🚗︎',
      subPaths: ['/adminVehicles', '/vehicles-dashboard', '/vehicleDashboard', '/addvehicle', '/edit-vehicle', '/vehicle-details']
    },
    { 
      name: 'Drivers', 
      path: '/adminDrivers', 
      icon: '👥︎',
      subPaths: ['/adminDrivers', '/driver-dashboard', '/add-driver', '/edit-driver', '/driver-details']
    },
    { 
      name: 'Assignments', 
      path: '/adminCurrentTrips', 
      icon: '📋︎',
      subPaths: ['/adminCurrentTrips', '/assignments-dashboard', '/add-assignment', '/edit-assignment', '/assignment-details']
    },
    { 
      name: 'Reports', 
      path: '/adminReports', 
      icon: '📊︎',
      subPaths: ['/adminReports', '/vehicle-reports', '/driver-reports', '/assignment-reports']
    },
  ];

  if (!mounted) return null;

  function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // --- STRICT ACTIVE CHECKER ---
  // This logic checks if the current pathname starts with any of the subPaths
  const isActive = (item) => {
    if (!pathname) return false;
    const currentPath = pathname.toLowerCase();
    
    return item.subPaths.some(subPath => {
      const p = subPath.toLowerCase();
      // Match exact path OR path with a trailing slash (e.g. /users/123 matches /users)
      return currentPath === p || currentPath.startsWith(`${p}/`) || currentPath.startsWith(p);
    });
  };

  return (
    <>
      {/* Keeping some basic structural CSS but moving colors to inline styles for reliability */}
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .sidebar-container {
          width: 250px;
          height: 100vh;
          background: linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%);
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          box-shadow: 4px 0 20px rgba(30, 64, 175, 0.15);
          z-index: 1000;
          animation: slideIn 0.5s ease-out;
          border-right: 1px solid rgba(59, 130, 246, 0.1);
        }

        .nav-section::-webkit-scrollbar { width: 7px; }
        .nav-section::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.15); }
        .nav-section::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.4); border-radius: 4px; }
        
        @media (max-width: 768px) {
          .sidebar-container { width: 220px; }
        }
      `}</style>

      <div className="sidebar-container">
        
        {/* 1. Header Section */}
        <div style={{
           padding: "28px 20px",
           borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
           background: "rgba(0, 0, 0, 0.15)",
           marginBottom: "10px",
           display: "flex",
           flexDirection: "column",
           alignItems: "center",
           gap: "15px"
        }}>
          <img
            src="/logo.jpeg"
            alt="Logo"
            style={{
              width: "80px",
              height: "auto",
              objectFit: "contain",
              borderRadius: "14px",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
            }}
          />
          <div style={{
            fontSize: "19px",
            fontWeight: "700",
            color: "#ffffff",
            textAlign: "center",
            lineHeight: "1.4",
            letterSpacing: "0.5px",
            textTransform: "uppercase"
          }}>
            City Lion <br /> Tours Express
          </div>
        </div>

        {/* 2. Navigation Section */}
        <nav className="nav-section" style={{ flexGrow: 1, padding: "24px 0", overflowY: "auto" }}>
          {navItems.map((item, index) => {
            const active = isActive(item);
            const hrefWithId = userId ? `${item.path}?userId=${userId}` : item.path;

            return (
              <Link
                key={index}
                href={hrefWithId}
                style={{
                  padding: "15px 20px",
                  margin: "5px 14px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  textDecoration: "none",
                  transition: "all 0.25s ease",
                  // INLINE CONDITIONAL STYLES (Exactly as requested)
                  background: active 
                    ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" 
                    : "transparent",
                  color: active ? "#ffffff" : "#e0f2fe",
                  fontWeight: active ? "600" : "500",
                  border: active ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid transparent",
                  boxShadow: active ? "0 4px 14px rgba(59, 130, 246, 0.35)" : "none",
                }}
                // Inline Hover Events to mimic CSS hover while keeping inline logic
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
                    e.currentTarget.style.transform = "translateX(6px)";
                    e.currentTarget.style.border = "1px solid rgba(59, 130, 246, 0.2)";
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.border = "1px solid transparent";
                    e.currentTarget.style.color = "#e0f2fe";
                  }
                }}
              >
                <span style={{ fontSize: "20px", minWidth: "24px", textAlign: "center", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.name}</span>
                
                {/* Active Dot Indicator */}
                {active && (
                  <span style={{ fontSize: "10px", opacity: 0.9 }}>●</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 3. Bottom Section */}
        <div style={{ padding: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(0, 0, 0, 0.15)" }}>
          <Link href={userId ? `/profile?userId=${userId}` : '/profile'} style={{
            display: "flex", alignItems: "center", gap: "12px", padding: "12px",
            borderRadius: "12px", marginBottom: "15px", textDecoration: "none",
            background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => {
             e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
             e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
             e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
             e.currentTarget.style.transform = "translateY(0)";
          }}
          >
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: "700", color: "white", fontSize: "16px",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
            }}>
                {userData.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>
                {capitalizeFirstLetter(userData.name)}
              </span>
              <span style={{ color: "#bfdbfe", fontSize: "12px" }}>
                {capitalizeFirstLetter(userData.role)}
              </span>
            </div>
          </Link>

          <button onClick={handleLogout} style={{
            width: "100%", padding: "12px",
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "white", border: "none", borderRadius: "10px",
            fontWeight: "600", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", gap: "8px",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)", transition: "all 0.3s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            → Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;