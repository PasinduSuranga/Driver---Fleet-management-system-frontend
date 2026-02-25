'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';

// --- Simple Dialog Component for Success/Error Messages ---
const StatusModal = ({ isOpen, type, message, onClose }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(6px)',
      animation: 'smFadeIn 0.2s ease-out',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(15,23,42,0.22), 0 0 0 1px rgba(191,219,254,0.4)',
        padding: '38px 34px 32px',
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        animation: 'smPopIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif'
      }}>
        {/* Icon */}
        <div style={{
          width: '62px',
          height: '62px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
          background: isSuccess
            ? 'linear-gradient(135deg, #dbeafe, #bfdbfe)'
            : 'linear-gradient(135deg, #fee2e2, #fecaca)'
        }}>
          {isSuccess ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
        </div>

        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '10px',
          letterSpacing: '-0.3px'
        }}>
          {isSuccess ? 'Success!' : 'Error'}
        </h3>

        <p style={{
          fontSize: '14.5px',
          color: '#64748b',
          marginBottom: '26px',
          lineHeight: '1.65'
        }}>
          {message}
        </p>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            display: 'inline-flex',
            justifyContent: 'center',
            borderRadius: '11px',
            border: 'none',
            boxShadow: '0 4px 14px rgba(37,99,235,0.32)',
            padding: '12px 16px',
            fontSize: '14.5px',
            fontWeight: '600',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            cursor: 'pointer',
            transition: 'opacity 0.2s, transform 0.15s',
            fontFamily: 'Inter, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          OK
        </button>
      </div>

      <style>{`
        @keyframes smFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes smPopIn {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

const UpdateDriverContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const driverId = searchParams.get('driverId');
  const userId = searchParams.get('userId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [modal, setModal] = useState({ isOpen: false, type: 'success', message: '' });

  const [formData, setFormData] = useState({
    driverName: '',
    contactNumber: '',
    licenseNumber: '',
    licenseExpiry: ''
  });

  const [previews, setPreviews] = useState({
    licenseFrontPhoto: '',
    licenseBackPhoto: ''
  });

  const [dbPreviews, setDbPreviews] = useState({
    licenseFrontPhoto: '',
    licenseBackPhoto: ''
  });

  const [files, setFiles] = useState({
    licenseFrontPhoto: null,
    licenseBackPhoto: null
  });

  useEffect(() => {
    if (driverId) {
      fetchDriverDetails(driverId);
    }
  }, [driverId]);

  const fetchDriverDetails = async (dId) => {
    try {
      const res = await axios.get(`http://localhost:5000/driver/driverDetails?driverId=${dId}`);
      const data = res.data;

      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      setFormData({
        driverName: data.name || '',
        contactNumber: data.contact || '',
        licenseNumber: data.license_number || '',
        licenseExpiry: formatDate(data.expiry_date)
      });

      const initialPreviews = {
        licenseFrontPhoto: data.front_photo || '',
        licenseBackPhoto: data.back_photo || ''
      };

      setPreviews(initialPreviews);
      setDbPreviews(initialPreviews);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setModal({ isOpen: true, type: 'error', message: 'Error loading driver data.' });
      setLoading(false);
    }
  };

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;

    if (file) {
      setFiles({ ...files, [name]: file });
      setPreviews({ ...previews, [name]: URL.createObjectURL(file) });
    }
  };

  const handleRemoveFile = (name) => {
    setFiles({ ...files, [name]: null });
    setPreviews({ ...previews, [name]: dbPreviews[name] });
  };

  const validateInputs = () => {
    if (!formData.driverName.trim()) {
      setModal({ isOpen: true, type: 'error', message: 'Driver name is required.' });
      return false;
    }
    if (formData.driverName.trim().length > 250) {
      setModal({ isOpen: true, type: 'error', message: 'Driver name cannot exceed 250 characters.' });
      return false;
    }

    const contactRegex = /^(0\d{9}|\+\d{11})$/;
    if (!formData.contactNumber) {
      setModal({ isOpen: true, type: 'error', message: 'Contact number is required.' });
      return false;
    }
    if (!contactRegex.test(formData.contactNumber.replace(/\s+/g, ''))) {
      setModal({ isOpen: true, type: 'error', message: 'Invalid contact. Must start with 0 (10 digits) or + (12 digits including +).' });
      return false;
    }

    if (formData.licenseExpiry) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const exp = new Date(formData.licenseExpiry);
      if (exp <= today) {
        setModal({ isOpen: true, type: 'error', message: 'License expiry date must be in the future.' });
        return false;
      }
    } else {
      setModal({ isOpen: true, type: 'error', message: 'License expiry date is required.' });
      return false;
    }

    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return;

    setSubmitting(true);

    const data = new FormData();
    data.append('driverId', driverId);
    data.append('driverName', formData.driverName.trim());
    data.append('contactNumber', formData.contactNumber.replace(/\s+/g, ''));
    data.append('licenseExpiry', formData.licenseExpiry);

    if (files.licenseFrontPhoto) data.append('licenseFrontPhoto', files.licenseFrontPhoto);
    if (files.licenseBackPhoto) data.append('licenseBackPhoto', files.licenseBackPhoto);

    try {
      await axios.put('http://localhost:5000/driver/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setModal({ isOpen: true, type: 'success', message: 'Driver Updated Successfully!' });
    } catch (err) {
      console.error(err);
      setModal({
        isOpen: true,
        type: 'error',
        message: 'Failed to update details: ' + (err.response?.data?.message || err.message)
      });
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
    if (modal.type === 'success' && modal.message === 'Driver Updated Successfully!') {
      router.push(`/viewDriver?userId=${userId}&driverId=${driverId}`);
    }
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '44px', height: '44px',
        border: '3px solid #bfdbfe',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'udSpin 0.8s linear infinite'
      }} />
      <span style={{ fontSize: '17px', fontWeight: '500', color: '#64748b' }}>Loading Details...</span>
      <style>{`@keyframes udSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        @keyframes udFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes udSlideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes udSpin { to { transform: rotate(360deg); } }

        * { box-sizing: border-box; }

        .ud-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
          padding: 40px 24px 60px;
          font-family: 'Inter', sans-serif;
        }

        .ud-card {
          max-width: 1000px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 22px;
          box-shadow: 0 4px 6px rgba(59,130,246,0.06), 0 16px 48px rgba(59,130,246,0.13), 0 0 0 1px rgba(191,219,254,0.5);
          padding: 40px;
          animation: udFadeIn 0.5s ease both;
        }

        /* Header */
        .ud-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 22px;
          border-bottom: 1.5px solid #e2e8f0;
        }

        .ud-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ud-header-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(59,130,246,0.35);
          flex-shrink: 0;
        }

        .ud-header-icon svg {
          width: 24px;
          height: 24px;
          stroke: #ffffff;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .ud-title {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .ud-subtitle {
          font-size: 13px;
          color: #64748b;
          margin-top: 2px;
          font-weight: 400;
        }

        .ud-back-btn {
          padding: 10px 20px;
          background: #ffffff;
          color: #3b82f6;
          border: 1.5px solid #bfdbfe;
          border-radius: 11px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          gap: 7px;
          transition: background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s;
          white-space: nowrap;
        }

        .ud-back-btn:hover {
          background: #f0f9ff;
          border-color: #3b82f6;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(59,130,246,0.15);
        }

        .ud-back-btn svg {
          width: 15px;
          height: 15px;
          stroke: #3b82f6;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* Section Panels */
        .ud-section {
          background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%);
          padding: 26px;
          border-radius: 16px;
          border: 1.5px solid #e0f2fe;
          margin-bottom: 24px;
          animation: udSlideIn 0.4s ease both;
        }

        .ud-section-title {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          gap: 10px;
          letter-spacing: -0.2px;
        }

        .ud-section-title svg {
          width: 18px;
          height: 18px;
          stroke: #3b82f6;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .ud-section-title-line {
          flex: 1;
          height: 1.5px;
          background: linear-gradient(90deg, #bfdbfe, transparent);
        }

        /* Grid */
        .ud-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .ud-photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        /* Input Group */
        .ud-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ud-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }

        .ud-label svg {
          width: 14px;
          height: 14px;
          stroke: #94a3b8;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex-shrink: 0;
        }

        .ud-input {
          width: 100%;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          padding: 10px 14px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          background: #f8fafc;
          color: #1e293b;
        }

        .ud-input:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 3.5px rgba(59,130,246,0.12);
        }

        .ud-input:hover:not(:focus):not(:disabled) {
          border-color: #cbd5e1;
          background: #f1f5f9;
        }

        .ud-input:disabled {
          background: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
          border-color: #e2e8f0;
        }

        /* Photo Card */
        .ud-photo-card {
          border: 1.5px solid #e0f2fe;
          padding: 20px;
          background: #ffffff;
          border-radius: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .ud-photo-card:hover {
          border-color: #93c5fd;
          box-shadow: 0 4px 16px rgba(59,130,246,0.09);
        }

        .ud-photo-card-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .ud-photo-card-title svg {
          width: 15px;
          height: 15px;
          stroke: #3b82f6;
          fill: none;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* File Upload Area */
        .ud-upload-area {
          position: relative;
          border: 1.5px dashed #bfdbfe;
          border-radius: 10px;
          padding: 20px 16px;
          background: #f0f9ff;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          margin-bottom: 14px;
        }

        .ud-upload-area:hover {
          border-color: #3b82f6;
          background: #dbeafe;
        }

        .ud-upload-area input[type="file"] {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .ud-upload-icon svg {
          width: 28px;
          height: 28px;
          stroke: #3b82f6;
          fill: none;
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          margin-bottom: 6px;
        }

        .ud-upload-text {
          font-size: 12.5px;
          color: #475569;
          font-weight: 500;
        }

        .ud-upload-text span {
          color: #3b82f6;
          font-weight: 700;
        }

        /* Preview */
        .ud-preview-wrap {
          position: relative;
          display: inline-block;
          margin-bottom: 4px;
        }

        .ud-preview-img {
          height: 96px;
          border-radius: 10px;
          border: 1.5px solid #bfdbfe;
          object-fit: cover;
          display: block;
        }

        .ud-remove-btn {
          position: absolute;
          top: -9px;
          right: -9px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          border-radius: '50%';
          width: '26px';
          height: '26px';
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59,130,246,0.35);
          transition: background 0.2s, transform 0.15s;
          padding: 0;
        }

        .ud-remove-btn:hover {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          transform: scale(1.12);
        }

        .ud-remove-btn svg {
          width: 13px;
          height: 13px;
          stroke: #ffffff;
          fill: none;
          stroke-width: 2.2;
          stroke-linecap: round;
        }

        /* Submit Button */
        .ud-submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          font-weight: 700;
          padding: 15px;
          border-radius: 13px;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          font-size: 15.5px;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 18px rgba(37,99,235,0.34);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          letter-spacing: 0.2px;
          margin-top: 8px;
        }

        .ud-submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(37,99,235,0.42);
        }

        .ud-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .ud-submit-btn svg {
          width: 18px;
          height: 18px;
          stroke: #ffffff;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .ud-spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: udSpin 0.7s linear infinite;
        }

        .ud-lock-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #94a3b8;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 2px 8px;
          font-weight: 600;
          margin-left: 6px;
        }

        .ud-lock-badge svg {
          width: 10px;
          height: 10px;
          stroke: #94a3b8;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        @media (max-width: 768px) {
          .ud-page { padding: 24px 15px 40px; }
          .ud-card { padding: 24px 18px; }
          .ud-header { flex-direction: column; align-items: flex-start; gap: 14px; }
          .ud-back-btn { align-self: flex-end; }
          .ud-grid { grid-template-columns: 1fr; }
          .ud-photo-grid { grid-template-columns: 1fr; }
          .ud-title { font-size: 20px; }
        }
      `}</style>

      <div className="ud-page">
        <StatusModal
          isOpen={modal.isOpen}
          type={modal.type}
          message={modal.message}
          onClose={closeModal}
        />

        <div className="ud-card">

          {/* Header */}
          <div className="ud-header">
            <div className="ud-header-left">
              <div className="ud-header-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <div className="ud-title">Update Driver: {driverId}</div>
                <div className="ud-subtitle">Edit driver information and license details</div>
              </div>
            </div>

            <button
              className="ud-back-btn"
              onClick={() => router.push(`/driverDashboard?userId=${userId}`)}
            >
              <svg viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          </div>

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

            {/* Section 1: Driver Info */}
            <div className="ud-section">
              <div className="ud-section-title">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                Driver Info
                <div className="ud-section-title-line" />
              </div>

              <div className="ud-grid">
                {/* Driver Name */}
                <div className="ud-input-group">
                  <label className="ud-label">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                    Driver Name
                    <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600', marginLeft: '4px' }}>(Editable)</span>
                  </label>
                  <input
                    type="text"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleTextChange}
                    className="ud-input"
                    placeholder="Enter driver name"
                  />
                </div>

                {/* Contact Number */}
                <div className="ud-input-group">
                  <label className="ud-label">
                    <svg viewBox="0 0 24 24">
                      <path d="M6.6 10.8a15.2 15.2 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/>
                    </svg>
                    Contact Number
                    <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600', marginLeft: '4px' }}>(Editable)</span>
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleTextChange}
                    className="ud-input"
                    placeholder="0xxxxxxxxx or +94xxxxxxxxx"
                  />
                </div>

                {/* License Number - Disabled */}
                <div className="ud-input-group">
                  <label className="ud-label">
                    <svg viewBox="0 0 24 24">
                      <rect x="2" y="5" width="20" height="14" rx="2"/>
                      <circle cx="8" cy="12" r="2"/>
                      <path d="M12 9h6M12 12h4M12 15h5"/>
                    </svg>
                    License Number
                    <span className="ud-lock-badge">
                      <svg viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                      Locked
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    disabled
                    className="ud-input"
                  />
                </div>

                {/* License Expiry */}
                <div className="ud-input-group">
                  <label className="ud-label">
                    <svg viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18"/>
                      <path d="M8 14h.01M12 14h.01M16 14h.01"/>
                    </svg>
                    License Expiry Date
                    <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600', marginLeft: '4px' }}>(Editable)</span>
                  </label>
                  <input
                    type="date"
                    name="licenseExpiry"
                    value={formData.licenseExpiry}
                    onChange={handleTextChange}
                    className="ud-input"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: License Photos */}
            <div className="ud-section">
              <div className="ud-section-title">
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <circle cx="8" cy="12" r="2"/>
                  <path d="M12 9h6M12 12h4M12 15h5"/>
                </svg>
                License Photos
                <div className="ud-section-title-line" />
              </div>

              <div className="ud-photo-grid">

                {/* Front Photo */}
                <div className="ud-photo-card">
                  <div className="ud-photo-card-title">
                    <svg viewBox="0 0 24 24">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    Front Photo
                  </div>

                  <div className="ud-upload-area">
                    <input
                      type="file"
                      name="licenseFrontPhoto"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    <div className="ud-upload-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <div className="ud-upload-text"><span>Click to upload</span> or drag & drop</div>
                  </div>

                  {previews.licenseFrontPhoto && (
                    <div className="ud-preview-wrap">
                      <img
                        src={previews.licenseFrontPhoto}
                        alt="Front Preview"
                        className="ud-preview-img"
                      />
                      {files.licenseFrontPhoto && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('licenseFrontPhoto')}
                          style={{
                            position: 'absolute',
                            top: '-9px',
                            right: '-9px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#ffffff',
                            borderRadius: '50%',
                            width: '26px',
                            height: '26px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
                            transition: 'background 0.2s, transform 0.15s',
                            padding: '0'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                            e.currentTarget.style.transform = 'scale(1.12)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Back Photo */}
                <div className="ud-photo-card">
                  <div className="ud-photo-card-title">
                    <svg viewBox="0 0 24 24">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    Back Photo
                  </div>

                  <div className="ud-upload-area">
                    <input
                      type="file"
                      name="licenseBackPhoto"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    <div className="ud-upload-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <div className="ud-upload-text"><span>Click to upload</span> or drag & drop</div>
                  </div>

                  {previews.licenseBackPhoto && (
                    <div className="ud-preview-wrap">
                      <img
                        src={previews.licenseBackPhoto}
                        alt="Back Preview"
                        className="ud-preview-img"
                      />
                      {files.licenseBackPhoto && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('licenseBackPhoto')}
                          style={{
                            position: 'absolute',
                            top: '-9px',
                            right: '-9px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#ffffff',
                            borderRadius: '50%',
                            width: '26px',
                            height: '26px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
                            transition: 'background 0.2s, transform 0.15s',
                            padding: '0'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                            e.currentTarget.style.transform = 'scale(1.12)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="ud-submit-btn"
            >
              {submitting ? (
                <>
                  <div className="ud-spinner" />
                  Updating Driver...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save Changes
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </>
  );
};

export default function UpdateDriverPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: '44px', height: '44px',
          border: '3px solid #bfdbfe',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'udSpin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '17px', fontWeight: '500', color: '#64748b' }}>Loading...</span>
        <style>{`@keyframes udSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <UpdateDriverContent />
    </Suspense>
  );
}