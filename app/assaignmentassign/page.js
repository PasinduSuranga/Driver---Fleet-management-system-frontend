'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
// Professional Line-art / Sketch icons
import { 
  HiOutlineBell, 
  HiOutlineUser, 
  HiOutlineTruck, 
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle
} from "react-icons/hi2";

// --- Mock Data Lookup ---
const mockVehicles = {
  'v1': 'WP - AB - 1111',
  'v2': 'WP - CB - 2222',
  'v3': 'WP - XY - 3333',
  'v4': 'WP - ZQ - 4444',
  'v5': 'WP - GA - 5555',
};

const mockDrivers = {
  'd1': 'CLEDR - 0001',
  'd2': 'CLEDR - 0002',
  'd3': 'CLEDR - 0003',
  'd4': 'CLEDR - 0004',
  'd5': 'CLEDR - 0005',
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    // Specified Background Gradient Palette
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 40px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #bfdbfe',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  homeLink: {
    textDecoration: 'none',
    // Specified Button Gradient
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    padding: '10px 25px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
  },
  notificationContainer: {
    position: 'relative',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    border: '1px solid #bfdbfe',
  },
  bellIcon: {
    fontSize: '22px',
    color: '#475569',
  },
  badge: {
    position: 'absolute',
    top: '0px',
    right: '0px',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: 'bold',
    border: '2px solid #fff',
  },
  mainContent: {
    flexGrow: 1,
    padding: '60px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '40px',
    color: '#1e293b', // Dark slate
    textAlign: 'center',
    letterSpacing: '-0.5px',
  },
  formCard: {
    width: '100%',
    maxWidth: '700px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
    border: '1px solid #ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#475569', // Medium slate
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inputField: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '15px',
    borderRadius: '12px',
    border: '1.5px solid #cbd5e1', // Medium border
    backgroundColor: '#f8fafc', // Very light background for read-only
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'default',
  },
  textArea: {
    width: '100%',
    padding: '18px',
    fontSize: '15px',
    borderRadius: '16px',
    border: '1.5px solid #cbd5e1',
    backgroundColor: '#fff',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '160px',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'border-color 0.3s ease',
  },
  buttonGroup: {
    marginTop: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    alignItems: 'center',
    width: '100%',
  },
  assignButton: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    padding: '15px 0',
    borderRadius: '14px',
    fontSize: '17px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '320px',
    boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'transform 0.2s ease',
  },
  backButton: {
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', // Table Header Gradient Style
    color: 'white',
    border: 'none',
    padding: '15px 0',
    borderRadius: '14px',
    fontSize: '17px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '320px',
    boxShadow: '0 8px 16px rgba(30, 64, 175, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'transform 0.2s ease',
  },
  footer: {
    backgroundColor: '#1e40af', // Deep Blue
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    padding: '20px',
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '0.5px',
  },
  icon: {
    fontSize: '18px',
    color: '#64748b',
  }
};

export default function AssignScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const vehicleId = searchParams.get('vehicleId');
  const driverId = searchParams.get('driverId');

  const displayVehicle = mockVehicles[vehicleId] || vehicleId || '';
  const displayDriver = mockDrivers[driverId] || driverId || '';

  const [customerDetails, setCustomerDetails] = useState('');

  const handleAssign = () => {
    if (!customerDetails.trim()) {
      alert("Please enter customer details.");
      return;
    }

    const assignmentData = {
      vehicle: displayVehicle,
      driver: displayDriver,
      customer: customerDetails,
      date: new Date().toISOString()
    };

    console.log("Submitting Assignment:", assignmentData);
    alert("Assignment Successful!");
    router.push('/createAssaignmentDoc'); 
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <Link href="/" style={styles.homeLink}>Home</Link>
        <div style={styles.notificationContainer}>
          <HiOutlineBell style={styles.bellIcon} />
          <div style={styles.badge}>3</div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <h1 style={styles.title}>Confirm Final Assignment</h1>

        <div style={styles.formCard}>
          
          {/* Customer Details Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <HiOutlineChatBubbleBottomCenterText style={styles.icon}/> Customer & Trip Information
            </label>
            <textarea 
              value={customerDetails}
              onChange={(e) => setCustomerDetails(e.target.value)}
              style={styles.textArea} 
              placeholder="Enter trip itinerary, customer names, and specific instructions..."
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          {/* Driver ID/Name (Read-only) */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <HiOutlineUser style={styles.icon}/> Selected Driver
            </label>
            <input 
              type="text" 
              value={displayDriver} 
              readOnly 
              style={styles.inputField} 
            />
          </div>

          {/* Vehicle Registration (Read-only) */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <HiOutlineTruck style={styles.icon}/> Assigned Vehicle Registration
            </label>
            <input 
              type="text" 
              value={displayVehicle} 
              readOnly 
              style={styles.inputField} 
            />
          </div>

        </div>

        {/* Buttons */}
        <div style={styles.buttonGroup}>
          <button 
            style={styles.assignButton} 
            onClick={handleAssign}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <HiOutlineCheckCircle /> Finalize Assignment
          </button>
          
          <button 
            style={styles.backButton} 
            onClick={() => router.back()}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <HiOutlineArrowLeft /> Modify Selection
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        © 2025 City Lion Express Tours • Premium Logistics Orchestration
      </footer>
    </div>
  );
}