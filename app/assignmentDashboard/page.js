'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Professional Line-art / Sketch icons
import { 
  HiOutlineBell, 
  HiOutlineClipboardDocumentList, 
  HiOutlineArrowLeft, 
  HiOutlinePlus 
} from "react-icons/hi2";

// --- Mock Stats Data ---
const assignmentStats = {
  totalThisMonth: 27,
  ongoingTrips: '03',
  tripsEnded: 24,
};

// --- Styles ---
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', sans-serif",
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
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '40px',
    color: '#1e293b', // Dark slate
    textAlign: 'center',
    letterSpacing: '-0.5px',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '30px',
    marginBottom: '50px',
    width: '100%',
    maxWidth: '1000px',
  },
  // Stat Card Style (Themed)
  statCardButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '24px', 
    border: '1.5px solid #fff',
    padding: '30px 20px',
    width: '280px',
    height: '240px', 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
  },
  statTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#64748b', // Light slate
    marginBottom: '15px',
    lineHeight: '1.4',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '72px', 
    fontWeight: '800',
    color: '#3b82f6', // Main blue
    margin: 0,
    lineHeight: '1',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center',
    width: '100%',
  },
  newAssignmentButton: {
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
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', // Table Header Gradient style
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
    backgroundColor: '#1e40af', // Deep blue
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    padding: '20px',
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '0.5px',
  }
};

export default function AssignmentDashboard() {
  const router = useRouter();

  // --- Navigation Handlers ---
  const handleNewAssignment = () => {
    router.push('/newAssaignment'); 
  };

  const navigateToTotal = () => {
    router.push('/adminCurrentTrips'); 
  };

  const navigateToOngoing = () => {
    router.push('/currentAssaignments'); 
  };

  const navigateToEnded = () => {
    router.push('/assignments/ended'); 
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
        <h1 style={styles.title}>Fleet Operations Center</h1>

        {/* Stats Cards (Now Clickable Buttons) */}
        <div style={styles.statsContainer}>
          
          <button 
            style={styles.statCardButton} 
            onClick={navigateToTotal}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.04)'; }}
          >
            <HiOutlineClipboardDocumentList style={{fontSize: '28px', color: '#94a3b8', marginBottom: '15px'}} />
            <div style={styles.statTitle}>
              Monthly <br /> Log Volume
            </div>
            <div style={styles.statValue}>
              {assignmentStats.totalThisMonth}
            </div>
          </button>

          <button 
            style={styles.statCardButton} 
            onClick={navigateToOngoing}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.04)'; }}
          >
            <div style={{width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', marginBottom: '20px', boxShadow: '0 0 10px #22c55e'}} />
            <div style={styles.statTitle}>
              Active <br /> Deployments
            </div>
            <div style={{...styles.statValue, color: '#22c55e'}}>
              {assignmentStats.ongoingTrips}
            </div>
          </button>

          <button 
            style={styles.statCardButton} 
            onClick={navigateToEnded}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.04)'; }}
          >
            <HiOutlineClipboardDocumentList style={{fontSize: '28px', color: '#94a3b8', marginBottom: '15px'}} />
            <div style={styles.statTitle}>
              Completed <br /> Itineraries
            </div>
            <div style={{...styles.statValue, color: '#64748b'}}>
              {assignmentStats.tripsEnded}
            </div>
          </button>

        </div>

        <div style={styles.buttonGroup}>
          <button 
            style={styles.newAssignmentButton} 
            onClick={handleNewAssignment}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <HiOutlinePlus /> Create Assignment
          </button>
          
          <button 
            style={styles.backButton} 
            onClick={() => router.back()}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <HiOutlineArrowLeft /> Dashboard Home
          </button>
        </div>

      </main>

      <footer style={styles.footer}>
        © 2025 City Lion Express Tours • Enterprise Logistics Management
      </footer>
    </div>
  );
}