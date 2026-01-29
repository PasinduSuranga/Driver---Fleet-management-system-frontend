'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Professional Line-art / Sketch icons from Heroicons (hi2)
import { 
  HiOutlineBell, 
  HiOutlineUser, 
  HiOutlinePhone, 
  HiOutlineIdentification, 
  HiOutlineCalendar, 
  HiOutlineArrowLeft,
  HiOutlineCheckCircle 
} from "react-icons/hi2";

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
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '35px',
    color: '#1e293b', // Dark Slate
    textAlign: 'center',
    letterSpacing: '-0.5px',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
    width: '100%',
    maxWidth: '550px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    border: '1px solid #fff',
  },
  label: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#475569', // Medium Slate
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '5px'
  },
  selectInput: {
    width: '100%',
    padding: '14px 15px',
    fontSize: '15px',
    borderRadius: '12px',
    border: '1.5px solid #cbd5e1', // Medium Border
    backgroundColor: '#fff',
    color: '#1e293b',
    outline: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-13%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2013l128%20128c3.6%203.6%207.8%205.4%2013%205.4s9.3-1.8%2013-5.4l128-128c3.6-3.6%205.4-7.8%205.4-13%200-5-1.8-9.3-5.4-13z%22%2F%3E%3C%2Fsvg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1.2em top 50%',
    backgroundSize: '.8em auto',
  },
  dynamicFieldsContainer: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    animation: 'fadeIn 0.3s ease-in-out',
  },
  inputField: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '15px',
    borderRadius: '12px',
    border: '1.5px solid #cbd5e1',
    backgroundColor: '#fff',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease',
  },
  fileInputWrapper: {
    border: '1.5px dashed #cbd5e1',
    padding: '24px',
    borderRadius: '12px',
    backgroundColor: '#f8fafc', // Very Light Background
    textAlign: 'center',
    cursor: 'pointer',
  },
  buttonGroup: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    alignItems: 'center',
    width: '100%',
  },
  saveButton: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 0',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
    width: '100%',
    maxWidth: '350px',
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
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 8px 16px rgba(30, 64, 175, 0.2)',
    width: '100%',
    maxWidth: '350px',
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

export default function UpdateDriverPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState('');

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleUpdate = () => {
    alert("Driver Details Updated Successfully!");
    router.back();
  };

  const renderDynamicFields = () => {
    switch (selectedOption) {
      case 'personalDetails':
        return (
          <div style={styles.dynamicFieldsContainer}>
            <div>
              <label style={styles.label}>
                <HiOutlineUser style={styles.icon}/> Full Name
              </label>
              <input type="text" placeholder="Update full name" style={styles.inputField} />
            </div>
            <div>
              <label style={styles.label}>
                <HiOutlinePhone style={styles.icon}/> Contact Number
              </label>
              <input type="tel" placeholder="Update contact number" style={styles.inputField} />
            </div>
          </div>
        );
      case 'licenseDetails':
        return (
          <div style={styles.dynamicFieldsContainer}>
             <div>
              <label style={styles.label}>
                <HiOutlineIdentification style={styles.icon}/> License Front
              </label>
              <div style={styles.fileInputWrapper}>
                 <input type="file" accept="image/png, image/jpeg" style={{width: '100%', cursor: 'pointer'}} />
              </div>
            </div>
            <div>
              <label style={styles.label}>
                <HiOutlineIdentification style={styles.icon}/> License Back
              </label>
              <div style={styles.fileInputWrapper}>
                 <input type="file" accept="image/png, image/jpeg" style={{width: '100%', cursor: 'pointer'}} />
              </div>
            </div>
            <div>
              <label style={styles.label}>
                <HiOutlineCalendar style={styles.icon}/> License Expiry Date
              </label>
              <input type="date" style={styles.inputField} />
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
        <h1 style={styles.title}>Update Driver Information</h1>

        <div style={styles.formCard}>
          <div>
            <label htmlFor="updateSelect" style={styles.label}>
              Selection Category
            </label>
            <select
              id="updateSelect"
              style={styles.selectInput}
              value={selectedOption}
              onChange={handleSelectChange}
            >
              <option value="">Choose category to update</option>
              <option value="personalDetails">Personal Details</option>
              <option value="licenseDetails">License Details</option>
            </select>
          </div>

          {renderDynamicFields()}
        </div>

        <div style={styles.buttonGroup}>
            {selectedOption && (
              <button 
                style={styles.saveButton} 
                onClick={handleUpdate}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <HiOutlineCheckCircle /> Save Changes
              </button>
            )}
            
            <button 
              style={styles.backButton} 
              onClick={() => router.back()}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <HiOutlineArrowLeft /> Back
            </button>
        </div>
      </main>

      <footer style={styles.footer}>
        © 2025 City Lion Express Tours • Driver Fleet Management
      </footer>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}