'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Professional Line-art / Sketch icons
import { 
  HiOutlineBell, 
  HiOutlineUserCircle, 
  HiOutlineIdentification, 
  HiOutlineArrowLeft 
} from "react-icons/hi2";

// --- Mock Data ---
const mockDriverData = {
  id: "CLEDR - 0001",
  name: "Kasun Perera",
  contactNumber: "071-2345678",
  
  license: {
    expiryDate: "2026-05-20",
    frontPhoto: "https://via.placeholder.com/600x400?text=License+Front", 
    backPhoto: "https://via.placeholder.com/600x400?text=License+Back" 
  }
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    // Background Gradient Palette
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
    fontSize: '28px',
    fontWeight: '800',
    marginBottom: '35px',
    color: '#1e293b', // Dark Slate
    textAlign: 'center',
    letterSpacing: '-0.5px',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
    width: '100%',
    maxWidth: '850px',
    overflow: 'hidden',
    marginBottom: '30px',
    border: '1px solid #ffffff',
  },
  sectionHeader: {
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', // Table Header Gradient style
    padding: '18px 30px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  sectionIcon: {
    color: '#ffffff',
    fontSize: '22px',
    opacity: 0.9,
  },
  sectionContent: {
    padding: '30px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '12px',
  },
  label: {
    fontWeight: '500',
    color: '#64748b', // Light Slate
    fontSize: '14px',
  },
  value: {
    fontWeight: '600',
    color: '#1e293b', // Dark Slate
    fontSize: '15px',
    textAlign: 'right',
  },
  imageContainer: {
    marginTop: '12px',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '2px solid #f1f5f9',
    backgroundColor: '#f8fafc',
  },
  image: {
    width: '100%',
    height: 'auto',
    display: 'block',
    objectFit: 'cover',
    maxHeight: '400px',
  },
  imageLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569', // Medium Slate
    marginBottom: '8px',
    display: 'block',
  },
  backButton: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 80px',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
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
  }
};

export default function ViewDriverPage() {
  const router = useRouter();
  const driver = mockDriverData; 

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
        <h1 style={styles.title}>Driver Profile: {driver.name}</h1>

        {/* --- Personal Info Section --- */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <HiOutlineUserCircle style={styles.sectionIcon} />
            <h2 style={styles.sectionTitle}>Identity Information</h2>
          </div>
          <div style={styles.sectionContent}>
            <div style={styles.row}>
              <span style={styles.label}>System Driver ID</span>
              <span style={styles.value}>{driver.id}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>Full Name</span>
              <span style={styles.value}>{driver.name}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>Primary Contact Number</span>
              <span style={styles.value}>{driver.contactNumber}</span>
            </div>
          </div>
        </div>

        {/* --- License Info Section --- */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <HiOutlineIdentification style={styles.sectionIcon} />
            <h2 style={styles.sectionTitle}>Credentials & Licensing</h2>
          </div>
          <div style={styles.sectionContent}>
            
            <div style={styles.row}>
                <span style={styles.label}>License Expiration Status</span>
                <span style={{...styles.value, color: '#2563eb'}}>📅 {driver.license.expiryDate}</span>
            </div>

            {/* License Front */}
            <div style={{marginTop: '25px', marginBottom: '30px'}}>
                <span style={styles.imageLabel}>Official License Document (Front Side)</span>
                <div style={styles.imageContainer}>
                    <img src={driver.license.frontPhoto} alt="License Front" style={styles.image} />
                </div>
            </div>

            {/* License Back */}
            <div>
                <span style={styles.imageLabel}>Official License Document (Reverse Side)</span>
                <div style={styles.imageContainer}>
                    <img src={driver.license.backPhoto} alt="License Back" style={styles.image} />
                </div>
            </div>

          </div>
        </div>

        {/* Back Button */}
        <button 
          style={styles.backButton} 
          onClick={() => router.back()}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <HiOutlineArrowLeft /> Return to Fleet
        </button>

      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        © 2025 City Lion Express Tours • Premium Fleet Services
      </footer>
    </div>
  );
}