'use client';

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import CountUp from "react-countup";
import Header from "../../components/userHeader"; // Adjust the path to where you saved Header.jsx

// Ensure this matches your backend URL
const socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [vehicleCounts, setVehicleCounts] = useState({
    totalVehicles: 0,
    ownFleetVehicles: 0,
    outSourceVehicles: 0,
  });

  const [driverCounts, setDriverCounts] = useState({
    totalDrivers: 0,
  });

  const [assignmentCounts, setAssignmentCounts] = useState({
    totalAssignments: 0,
    ongoingAssignments: 0,
    totalAssignmentsThisMonth: 0
  });

  useEffect(() => {
    // 1. Fetch Initial Counts (HTTP Fallback)
    const fetchInitialCounts = async () => {
        try {
            const vehicleRes = await fetch("http://localhost:5000/vehicle/vehicleCount");
            const vehicleData = await vehicleRes.json();

            const driverRes = await fetch("http://localhost:5000/driver/driverCount");
            const driverData = await driverRes.json();

            const assignmentRes = await fetch("http://localhost:5000/assignment/assignmentCount");
            const assignmentData = await assignmentRes.json();

            setVehicleCounts(vehicleData);
            setDriverCounts(driverData);
            setAssignmentCounts(assignmentData);
        } catch (err) {
            console.error("Error fetching initial counts:", err);
        }
    };
    
    fetchInitialCounts();
    
    // 2. Socket Listener for Real-time Updates
    const updateCounts = (data) => {
      if (data.vehicleCounts) setVehicleCounts(data.vehicleCounts);
      if (data.driverCounts) setDriverCounts(data.driverCounts);
      if (data.assignmentCounts) setAssignmentCounts(data.assignmentCounts);
    };

    socket.on("updateCounts", updateCounts);
    
    return () => {
      socket.off("updateCounts", updateCounts);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        html, body {
            margin: 0;
            padding: 0;
            height: 100%;
        }

        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
          padding: 120px 40px 80px; /* Top padding increased to accommodate fixed header */
          box-sizing: border-box;
          position: relative;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 50px;
          animation: fadeIn 0.6s ease-out;
        }

        .dashboard-title {
          font-size: 42px;
          font-weight: 800;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-top: -20px;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }

        .dashboard-subtitle {
          font-size: 16px;
          color: #64748b;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 40px 35px;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
          cursor: pointer;
          transition: all 0.3s ease;
          animation: fadeIn 0.8s ease-out;
          position: relative;
          overflow: hidden;
          border: 1px solid #e0f2fe;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .stat-card:hover::before {
          transform: scaleX(1);
        }

        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(59, 130, 246, 0.18);
          border-color: #bfdbfe;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
        }

        .card-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .vehicle-card::before { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); }
        .driver-card::before { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
        .assignment-card::before { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); }

        .vehicle-icon { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #1e40af; }
        .driver-icon { background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); color: #0c4a6e; }
        .assignment-icon { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #1e40af; }

        .card-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        .stats-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #f8fafc;
          border-radius: 12px;
          border-left: 4px solid;
          transition: all 0.2s ease;
        }

        .stat-item:hover {
          background: #f0f9ff;
          transform: translateX(5px);
        }

        .stat-label {
          font-size: 15px;
          color: #475569;
          font-weight: 500;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
        }

        /* Stat Colors */
        .total-stat { border-left-color: #3b82f6; }
        .total-value { color: #3b82f6; }

        .own-fleet-stat { border-left-color: #2563eb; }
        .own-fleet-value { color: #2563eb; }

        .outsource-stat { border-left-color: #1e40af; }
        .outsource-value { color: #1e40af; }

        .driver-stat { border-left-color: #3b82f6; }
        .driver-value { color: #3b82f6; }
        
        .assignment-total-stat { border-left-color: #3b82f6; }
        .assignment-total-value { color: #3b82f6; }

        .ongoing-stat { border-left-color: #2563eb; }
        .ongoing-value { color: #2563eb; }

        .month-stat { border-left-color: #1e40af; }
        .month-value { color: #1e40af; }

        @media (max-width: 768px) {
          .dashboard-container { padding: 100px 20px 40px; }
          .dashboard-title { font-size: 32px; margin-top: 0; }
          .cards-grid { grid-template-columns: 1fr; }
          .stat-card { padding: 30px 25px; }
          .card-icon { width: 50px; height: 50px; font-size: 24px; }
          .card-title { font-size: 20px; }
        }
      `}</style>

      {/* Import and use the Header Component here */}
      <Header userId={userId} />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Overview Dashboard</h1>
          <p className="dashboard-subtitle">Manage Vehicles, Drivers & Assignments</p>
        </div>

        <div className="cards-grid">
          
          {/* VEHICLE CARD */}
          <div onClick={() => router.push(`/vehicleDashboard?userId=${userId}`)} className="stat-card vehicle-card">
            <div className="card-header">
              <div className="card-icon vehicle-icon">🚗︎</div>
              <h2 className="card-title">Vehicles</h2>
            </div>
            <div className="stats-list">
              <div className="stat-item total-stat">
                <span className="stat-label">Total Vehicles</span>
                <span className="stat-value total-value">
                  <CountUp end={vehicleCounts.totalVehicles} duration={0.5} />
                </span>
              </div>
              <div className="stat-item own-fleet-stat">
                <span className="stat-label">Own Fleet</span>
                <span className="stat-value own-fleet-value">
                  <CountUp end={vehicleCounts.ownFleetVehicles} duration={0.5} />
                </span>
              </div>
              <div className="stat-item outsource-stat">
                <span className="stat-label">Outsourced</span>
                <span className="stat-value outsource-value">
                  <CountUp end={vehicleCounts.outSourceVehicles} duration={0.5} />
                </span>
              </div>
            </div>
          </div>

          {/* DRIVER CARD */}
          <div onClick={() => router.push(`/driverDashboard?userId=${userId}`)} className="stat-card driver-card">
            <div className="card-header">
              <div className="card-icon driver-icon">👥︎</div>
              <h2 className="card-title">Drivers</h2>
            </div>
            <div className="stats-list">
              <div className="stat-item driver-stat">
                <span className="stat-label">Total Drivers</span>
                <span className="stat-value driver-value">
                  <CountUp end={driverCounts.totalDrivers} duration={0.5} />
                </span>
              </div>
            </div>
          </div>

          {/* NEW ASSIGNMENT CARD */}
          <div onClick={() => router.push(`/assignmentDashboard?userId=${userId}`)} className="stat-card assignment-card">
            <div className="card-header">
              <div className="card-icon assignment-icon">📋︎</div>
              <h2 className="card-title">Assignments</h2>
            </div>
            <div className="stats-list">
              <div className="stat-item assignment-total-stat">
                <span className="stat-label">Total Jobs</span>
                <span className="stat-value assignment-total-value">
                  <CountUp end={assignmentCounts.totalAssignments} duration={0.5} />
                </span>
              </div>
              <div className="stat-item ongoing-stat">
                <span className="stat-label">Ongoing</span>
                <span className="stat-value ongoing-value">
                  <CountUp end={assignmentCounts.ongoingAssignments} duration={0.5} />
                </span>
              </div>
              <div className="stat-item month-stat">
                <span className="stat-label">This Month</span>
                <span className="stat-value month-value">
                  <CountUp end={assignmentCounts.totalAssignmentsThisMonth} duration={0.5} />
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}