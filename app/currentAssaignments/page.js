'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaBell } from "react-icons/fa"; // npm install react-icons

// --- Mock Data ---
const currentAssignments = [
  { id: 'CLEAS - 0001' },
  { id: 'CLEAS - 0002' },
  { id: 'CLEAS - 0003' },
  { id: 'CLEAS - 0004' },
  { id: 'CLEAS - 0005' },
];

const tripsEndedCount = 2;

// --- Styles ---
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#ffffff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 30px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #f0f0f0',
  },
  homeLink: {
    textDecoration: 'none',
    backgroundColor: '#254EDB',
    background: 'linear-gradient(180deg, #3b64f5 0%, #254EDB 100%)',
    color: 'white',
    padding: '10px 30px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    display: 'inline-block',
  },
  notificationContainer: {
    position: 'relative',
    cursor: 'pointer',
  },
  bellIcon: {
    fontSize: '32px',
    color: '#1c1c1e',
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: 'red',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  mainContent: {
    backgroundColor: '#EEF4F9', // Light blue background matching screenshot
    flexGrow: 1,
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  listContainer: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '20px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    border: '1px solid #ccc',
    borderRadius: '30px', // Pill shape matching screenshot
    backgroundColor: 'white',
  },
  assignmentId: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#000',
  },
  viewButton: {
    backgroundColor: '#1D3EB3',
    background: 'linear-gradient(180deg, #2e54d6 0%, #1D3EB3 100%)',
    color: 'white',
    border: 'none',
    padding: '8px 25px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  summaryCard: {
    marginTop: '20px',
    width: '100%',
    maxWidth: '600px',
    backgroundColor: 'white',
    borderRadius: '20px', // Matches the rounded style in image
    border: '1px solid #ccc',
    padding: '15px 25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  summaryText: {
    fontSize: '20px',
    fontWeight: '800', // Bold text for "Trips Ended"
    color: '#000',
  },
  summaryValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#000',
  },
  backButton: {
    marginTop: '40px',
    backgroundColor: '#1D3EB3',
    background: 'linear-gradient(180deg, #2e54d6 0%, #1D3EB3 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 60px',
    borderRadius: '25px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  },
  footer: {
    backgroundColor: '#1D3EB3',
    color: 'white',
    textAlign: 'center',
    padding: '15px',
    fontSize: '14px',
    fontWeight: '600',
  }
};

export default function CurrentAssignmentsPage() {
  const router = useRouter();

  const handleView = (id) => {
    // Navigate to assignment details page
    router.push(`/assignments/view?id=${id}`);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <Link href="/" style={styles.homeLink}>Home</Link>
        <div style={styles.notificationContainer}>
          <FaBell style={styles.bellIcon} />
          <div style={styles.badge}>3</div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.mainContent}>
        
        {/* Assignment List Card */}
        <div style={styles.listContainer}>
          {currentAssignments.map((assignment) => (
            <div key={assignment.id} style={styles.listItem}>
              <span style={styles.assignmentId}>{assignment.id}</span>
              <button 
                style={styles.viewButton} 
                onClick={() => handleView(assignment.id)}
              >
                View
              </button>
            </div>
          ))}
        </div>

        {/* Trips Ended Summary */}
        <div style={styles.summaryCard}>
          <span style={styles.summaryText}>Trips Ended</span>
          <span style={styles.summaryValue}>{tripsEndedCount}</span>
        </div>

        {/* Back Button */}
        <button style={styles.backButton} onClick={() => router.back()}>
          Back
        </button>

      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        © 2025 City Lion Express Tours. All Rights Reserved.
      </footer>
    </div>
  );
}