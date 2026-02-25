'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

export default function Header({ userId }) {
  const router = useRouter();
  
  const [userProfile, setUserProfile] = useState({
    name: "User",
    role: "Loading...",
    email: ""
  });

  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    if (userId) {
        fetch(`http://localhost:5000/authentication/getUsers/${userId}`)
            .then(res => res.json())
            .then(data => setUserProfile(data))
            .catch(err => console.error("Error fetching user profile:", err));
    }
  }, [userId]);

  useEffect(() => {
    const socket = io("http://localhost:5000", {
        transports: ["websocket"],
        reconnection: true,
    });

    const fetchNotifications = async () => {
        try {
            const res = await fetch("http://localhost:5000/notification/expiryNotifications");
            const data = await res.json();

            const total = (data.vehicleAlerts?.length || 0) + (data.driverAlerts?.length || 0);
            setAlertCount(total);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    fetchNotifications();

    socket.on("expiryUpdate", (data) => {
        const total = (data.vehicleAlerts?.length || 0) + (data.driverAlerts?.length || 0);
        setAlertCount(total);
    });

    const interval = setInterval(fetchNotifications, 5000);

    return () => {
        clearInterval(interval);
        socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("userToken");
    sessionStorage.removeItem("userTokenexpiry");
    router.push("/");
  };

  function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return (
    <>
    <style jsx>{`
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        .header-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 80px;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-bottom: 2px solid #e0f2fe;
            box-shadow: 0 4px 24px rgba(59, 130, 246, 0.08);
            display: flex;
            align-items: center;
            padding: 0 40px;
            z-index: 1000;
            justify-content: space-between;
            animation: slideDown 0.5s ease-out;
        }

        .left-section {
            display: flex;
            align-items: center;
        }

        .home-button {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 10px 20px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
            transition: all 0.3s ease;
        }

        .home-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
        }

        .right-section {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        /* --- Notification Styles --- */
        .notification-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        .notification-button {
            background: white;
            border: 2px solid #e0f2fe;
            border-radius: 50%;
            width: 46px;
            height: 46px;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
            transition: all 0.3s ease;
            color: #64748b;
        }

        .notification-button:hover {
            transform: scale(1.08);
            border-color: #3b82f6;
            color: #3b82f6;
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.2);
            background: #f0f9ff;
        }

        .notification-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            border-radius: 50%;
            min-width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 700;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
            padding: 0 5px;
            animation: pulse 2s infinite;
        }
        /* --------------------------- */

        .profile-badge {
            display: flex;
            align-items: center;
            gap: 12px;
            background: white;
            padding: 8px 16px;
            border-radius: 12px;
            border: 2px solid #e0f2fe;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
            transition: all 0.3s ease;
        }

        .profile-badge:hover {
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
            border-color: #bfdbfe;
            transform: translateY(-2px);
        }

        .profile-avatar {
            width: 42px;
            height: 42px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .profile-info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
        }

        .profile-name {
            font-size: 14px;
            font-weight: 700;
            color: #1e293b;
        }

        .profile-role {
            font-size: 12px;
            color: #64748b;
            text-transform: capitalize;
        }

        .logout-button {
            padding: 10px 20px;
            background: white;
            color: #3b82f6;
            border: 2px solid #bfdbfe;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }

        .logout-button:hover {
            background: #f0f9ff;
            border-color: #3b82f6;
            color: #1e40af;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.2);
        }

        @media (max-width: 768px) {
            .header-container { 
                padding: 0 20px; 
                height: 70px; 
            }
            .profile-info { 
                display: none; 
            }
            .home-button span:last-child { 
                display: none; 
            }
            .logout-button span:last-child {
                display: none;
            }
            .notification-button {
                width: 40px;
                height: 40px;
                font-size: 18px;
            }
            .notification-badge {
                min-width: 20px;
                height: 20px;
                font-size: 10px;
            }
        }

        @media (max-width: 480px) {
            .header-container {
                padding: 0 15px;
                height: 65px;
            }
            .right-section {
                gap: 12px;
            }
            .home-button {
                padding: 8px 16px;
                font-size: 14px;
            }
            .logout-button {
                padding: 8px 16px;
                font-size: 14px;
            }
            .profile-avatar {
                width: 36px;
                height: 36px;
                font-size: 16px;
            }
        }
    `}</style>

    <header className="header-container">
        <div className="left-section">
            <button
                onClick={() => router.push(`/profile?userId=${userId}`)} 
                className="profile-badge">
                <div className="profile-avatar">
                    {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="profile-info">
                    <span className="profile-name">{capitalizeFirstLetter(userProfile.name)}</span>
                    <span className="profile-role">{userProfile.role}</span>
                </div>
            </button>
        </div>

        <div className="right-section">

            <button 
                onClick={() => router.push(`/userDashboard?userId=${userId}`)} 
                className="home-button"
            >
                <span>⌂</span>
                <span>Home</span>
            </button>

            <button onClick={handleLogout} className="logout-button">
                <span>→</span>
                <span>Logout</span>
            </button>
            
            {/* Notification Button */}
            <div className="notification-wrapper">
                <button 
                    onClick={() => router.push(`/notification?userId=${userId}`)} 
                    className="notification-button"
                    title="View Notifications"
                >
                    🔔︎
                </button>
                {alertCount > 0 && (
                    <span className="notification-badge">
                        {alertCount > 99 ? '99+' : alertCount}
                    </span>
                )}
            </div>

            
        </div>
    </header>
    </>
  );
}