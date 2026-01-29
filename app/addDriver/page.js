'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Professional Line-art / Sketch icons
import { 
  HiOutlineBell, 
  HiOutlineUser, 
  HiOutlinePhone, 
  HiOutlineIdentification, 
  HiOutlineCalendar, 
  HiOutlineArrowLeft,
  HiOutlineUserPlus
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
    // Button Gradient
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
    maxWidth: '600px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    border: '1px solid #fff',
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
  inputField: {
    width: '100%',
    padding: '12px 18px',
    fontSize: '15px',
    borderRadius: '12px',
    border: '1.5px solid #cbd5e1', // Medium Border
    backgroundColor: '#fff',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease',
  },
  fileInputContainer: {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '10px',
    backgroundColor: '#f8fafc', // Very Light Background
    transition: 'background-color 0.3s ease',
  },
  fileInput: {
    display: 'none', 
  },
  customFileButton: {
    backgroundColor: '#fff',
    color: '#1e293b',
    padding: '8px 18px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginRight: '15px',
    border: '1px solid #cbd5e1',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  fileName: {
    fontSize: '14px',
    color: '#64748b', // Light Slate
    fontStyle: 'italic',
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

export default function AddDriverPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    licenseFront: null,
    licenseBack: null,
    licenseExpiry: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData({ ...formData, [name]: files[0] });
    }
  };

  const handleSubmit = () => {
    console.log('Driver Data Submitted:', formData);
    alert("Driver Added Successfully!");
    router.back();
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
        <h1 style={styles.title}>Register New Driver</h1>

        <div style={styles.formCard}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <HiOutlineUser style={styles.icon}/> Full Name
            </label>
            <input 
              type="text" 
              name="name"
              placeholder="Enter driver's full name"
              value={formData.name}
              onChange={handleInputChange}
              style={styles.inputField} 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <HiOutlinePhone style={styles.icon}/> Contact Number
            </label>
            <input 
              type="tel" 
              name="contactNumber"
              placeholder="+94 7X XXX XXXX"
              value={formData.contactNumber}
              onChange={handleInputChange}
              style={styles.inputField} 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <HiOutlineIdentification style={styles.icon}/> License Front Side
            </label>
            <div style={styles.fileInputContainer}>
              <label htmlFor="licenseFront" style={styles.customFileButton}>Choose Image</label>
              <span style={styles.fileName}>
                {formData.licenseFront ? formData.licenseFront.name : "No File Chosen"}
              </span>
              <input 
                type="file" 
                id="licenseFront" 
                name="licenseFront"
                accept="image/*"
                onChange={handleFileChange}
                style={styles.fileInput} 
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <HiOutlineIdentification style={styles.icon}/> License Back Side
            </label>
            <div style={styles.fileInputContainer}>
              <label htmlFor="licenseBack" style={styles.customFileButton}>Choose Image</label>
              <span style={styles.fileName}>
                {formData.licenseBack ? formData.licenseBack.name : "No File Chosen"}
              </span>
              <input 
                type="file" 
                id="licenseBack" 
                name="licenseBack"
                accept="image/*"
                onChange={handleFileChange}
                style={styles.fileInput} 
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <HiOutlineCalendar style={styles.icon}/> License Expiry Date
            </label>
            <input 
              type="date" 
              name="licenseExpiry"
              value={formData.licenseExpiry}
              onChange={handleInputChange}
              style={styles.inputField} 
            />
          </div>

          <div style={styles.buttonGroup}>
            <button 
              style={styles.saveButton} 
              onClick={handleSubmit}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <HiOutlineUserPlus /> Add Driver
            </button>
            <button 
              style={styles.backButton} 
              onClick={() => router.back()}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <HiOutlineArrowLeft /> Back
            </button>
          </div>

        </div>
      </main>

      <footer style={styles.footer}>
        © 2025 City Lion Express Tours • Driver Fleet Enrollment
      </footer>
    </div>
  );
}