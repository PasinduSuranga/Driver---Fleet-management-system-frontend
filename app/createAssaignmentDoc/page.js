'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
// Professional Line-art / Sketch icons
import { 
  HiOutlineBell, 
  HiOutlineUserCircle, 
  HiOutlineTruck, 
  HiOutlineDocumentText,
  HiOutlineArrowLeft,
  HiOutlineCheckBadge
} from "react-icons/hi2";

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
    transition: 'transform 0.2s ease',
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
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '40px',
    color: '#1e293b', // Dark Slate
    textAlign: 'center',
    letterSpacing: '-0.5px',
  },
  formCard: {
    width: '100%',
    maxWidth: '750px',
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
    color: '#475569', // Medium Slate
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  readOnlyInput: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '15px',
    borderRadius: '12px',
    border: '1.5px solid #cbd5e1', // Medium border
    backgroundColor: '#f8fafc', // Very light background
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'default',
  },
  readOnlyTextArea: {
    width: '100%',
    padding: '18px',
    fontSize: '15px',
    borderRadius: '16px',
    border: '1.5px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '130px',
    fontFamily: 'inherit',
    resize: 'none',
    cursor: 'default',
    lineHeight: '1.6',
  },
  buttonGroup: {
    marginTop: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    alignItems: 'center',
    width: '100%',
  },
  confirmButton: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 0',
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
    padding: '14px 0',
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
    fontSize: '20px',
    color: '#64748b', // Light Slate
  }
};

export default function AssignmentDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Data retrieval logic strictly maintained
  const customerDetails = searchParams.get('customer') || "Pasindu Suranga\nUniversity of Kelaniya\nDalugama";
  const driverName = searchParams.get('driver') || "Gishan Bandara";
  const vehicleReg = searchParams.get('vehicle') || "WB - AB - 1111";

  const handleConfirm = () => {
    alert("Assignment Document Generated & Confirmed!");
    router.push('/assignmentDashboard');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link href="/" style={styles.homeLink}>Home</Link>
        <div style={styles.notificationContainer}>
          <HiOutlineBell style={styles.bellIcon} />
          <div style={styles.badge}>3</div>
        </div>
      </header>

      <main style={styles.mainContent}>
        <h1 style={styles.title}>Assignment Verification</h1>

        <div style={styles.formCard}>
          
          {/* Customer Details */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <HiOutlineDocumentText style={styles.icon}/> Client Itinerary Details
            </label>
            <textarea 
              value={customerDetails}
              readOnly
              style={styles.readOnlyTextArea}
            />
          </div>

          {/* Driver Name */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <HiOutlineUserCircle style={styles.icon}/> Designated Driver Profile
            </label>
            <input 
              type="text" 
              value={driverName} 
              readOnly 
              style={styles.readOnlyInput} 
            />
          </div>

          {/* Vehicle Registration */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <HiOutlineTruck style={styles.icon}/> Assigned Fleet Asset
            </label>
            <input 
              type="text" 
              value={vehicleReg} 
              readOnly 
              style={styles.readOnlyInput} 
            />
          </div>

        </div>

        <div style={styles.buttonGroup}>
          <button 
            style={styles.confirmButton} 
            onClick={handleConfirm}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <HiOutlineCheckBadge /> Generate Document
          </button>
          
          <button 
            style={styles.backButton} 
            onClick={() => router.back()}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <HiOutlineArrowLeft /> Modify Details
          </button>
        </div>

      </main>

      <footer style={styles.footer}>
        © 2025 City Lion Express Tours • Official Assignment Record
      </footer>
    </div>
  );
}