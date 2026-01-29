'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Using professional line-art (sketch) icons
import { HiOutlineBell, HiOutlineUser, HiOutlineIdentification, HiOutlineShieldCheck, HiOutlineTruck } from "react-icons/hi2";

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    // Specified Background Gradient
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #bfdbfe',
  },
  homeLink: {
    textDecoration: 'none',
    // Specified Button Gradient
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    padding: '10px 30px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
    transition: 'all 0.3s ease',
  },
  notificationContainer: {
    position: 'relative',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    border: '1px solid #bfdbfe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: '24px',
    color: '#1e293b', // Dark slate
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
    letterSpacing: '-0.02em',
  },
  formCard: {
    width: '100%',
    maxWidth: '550px',
    backgroundColor: '#f8fafc', // Very light background for cards
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    border: '1px solid #ffffff',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#475569', // Medium slate
  },
  selectInput: {
    width: '100%',
    padding: '14px 20px',
    fontSize: '16px',
    borderRadius: '12px',
    border: '1.5px solid #cbd5e1', // Medium border
    backgroundColor: 'white',
    color: '#1e293b',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-13%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2013l128%20128c3.6%203.6%207.8%205.4%2013%205.4s9.3-1.8%2013-5.4l128-128c3.6-3.6%205.4-7.8%205.4-13%200-5-1.8-9.3-5.4-13z%22%2F%3E%3C%2Fsvg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1.2em top 50%',
    backgroundSize: '.8em auto',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  dynamicFieldsContainer: {
    marginTop: '25px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    animation: 'fadeIn 0.4s ease-out',
  },
  inputField: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '15px',
    borderRadius: '12px',
    border: '1.5px solid #cbd5e1',
    backgroundColor: 'white',
    color: '#1e293b',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  fileInputWrapper: {
    border: '2px dashed #cbd5e1',
    padding: '24px',
    borderRadius: '16px',
    backgroundColor: '#fff',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  backButton: {
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', // Table Header Gradient style
    color: 'white',
    border: 'none',
    padding: '14px 70px',
    borderRadius: '30px',
    fontSize: '17px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 6px 15px rgba(30, 64, 175, 0.25)',
    marginTop: '40px',
    transition: 'transform 0.2s ease',
  },
  footer: {
    backgroundColor: '#1e40af', // Deep blue
    color: 'white',
    textAlign: 'center',
    padding: '20px',
    fontSize: '14px',
    fontWeight: '500',
    letterSpacing: '0.03em',
  },
  icon: {
    color: '#64748b', // Light slate label color
    fontSize: '20px',
  }
};

export default function UpdateVehiclePage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState('');

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const renderDynamicFields = () => {
    switch (selectedOption) {
      case 'ownerDetails':
        return (
          <div style={styles.dynamicFieldsContainer}>
            <div>
              <label style={styles.label}><HiOutlineUser style={styles.icon}/> Owner Name</label>
              <input type="text" placeholder="Enter owner name" style={styles.inputField} />
            </div>
            <div>
              <label style={styles.label}><HiOutlineUser style={styles.icon}/> Owner Contact</label>
              <input type="tel" placeholder="Enter contact number" style={styles.inputField} />
            </div>
            <div>
              <label style={styles.label}><HiOutlineIdentification style={styles.icon}/> Owner NIC Number</label>
              <input type="text" placeholder="Enter NIC number" style={styles.inputField} />
            </div>
          </div>
        );
      case 'licenseDetails':
        return (
          <div style={styles.dynamicFieldsContainer}>
             <div>
              <label style={styles.label}><HiOutlineIdentification style={styles.icon}/> License Image</label>
              <div style={styles.fileInputWrapper}>
                 <input type="file" accept="image/png, image/jpeg" style={{width: '100%', color: '#64748b'}} />
              </div>
            </div>
            <div>
              <label style={styles.label}>License Expiry Date</label>
              <input type="date" style={styles.inputField} />
            </div>
          </div>
        );
      case 'insuranceDetails':
        return (
          <div style={styles.dynamicFieldsContainer}>
            <div>
              <label style={styles.label}><HiOutlineShieldCheck style={styles.icon}/> Insurance Image</label>
               <div style={styles.fileInputWrapper}>
                  <input type="file" accept="image/png, image/jpeg" style={{width: '100%', color: '#64748b'}} />
               </div>
            </div>
            <div>
              <label style={styles.label}>Insurance Expiry Date</label>
              <input type="date" style={styles.inputField} />
            </div>
          </div>
        );
      case 'vehicleDetails':
        return (
          <div style={styles.dynamicFieldsContainer}>
            <div>
              <label style={styles.label}><HiOutlineTruck style={styles.icon}/> Vehicle Photo</label>
               <div style={styles.fileInputWrapper}>
                  <input type="file" accept="image/png, image/jpeg" style={{width: '100%', color: '#64748b'}} />
               </div>
            </div>
            <div>
              <label style={styles.label}>Vehicle Type Info</label>
              <input type="text" placeholder="e.g., Sedan, SUV, Van" style={styles.inputField} />
            </div>
          </div>
        );
      default:
        return null;
    }
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
        <h1 style={styles.title}>Update Vehicle Details</h1>

        <div style={styles.formCard}>
          <div>
            <label htmlFor="updateSelect" style={styles.label}>
              Select What to Update
            </label>
            <select
              id="updateSelect"
              style={styles.selectInput}
              value={selectedOption}
              onChange={handleSelectChange}
            >
              <option value="">Select an option</option>
              <option value="ownerDetails">Owner Details</option>
              <option value="licenseDetails">License Details</option>
              <option value="insuranceDetails">Insurance Details</option>
              <option value="vehicleDetails">Vehicle Details</option>
            </select>
          </div>

          {renderDynamicFields()}
        </div>

        <button 
          style={styles.backButton} 
          onClick={() => router.back()}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Back
        </button>
      </main>

      <footer style={styles.footer}>
        © 2026 City Lion Express Tours. All Rights Reserved.
      </footer>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}