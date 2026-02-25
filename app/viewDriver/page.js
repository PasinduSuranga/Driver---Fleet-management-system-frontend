'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import Header from '../../components/userHeader';

const DriverContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const driverId = searchParams.get('driverId');
  const userId = searchParams.get('userId');

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    isError: false
  });

  useEffect(() => {
    if (driverId) {
      fetchDriverDetails(driverId);
    }
  }, [driverId]);

  const fetchDriverDetails = async (dId) => {
    try {
      const response = await axios.get(`http://localhost:5000/driver/driverDetails?driverId=${dId}`);
      setDriver(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setDialog({
        isOpen: true,
        title: "Error",
        message: "Failed to fetch driver details.",
        isError: true
      });
    }
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
    if (dialog.isError) {
      router.push(`/driverDashboard?userId=${userId}`);
    }
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
      color: '#64748b',
      fontSize: '18px',
      fontWeight: '500',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '44px', height: '44px',
          border: '3px solid #bfdbfe',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span>Loading details...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (!driver && !dialog.isOpen) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
      color: '#64748b',
      fontSize: '18px',
      fontWeight: '500',
      fontFamily: 'Inter, sans-serif'
    }}>
      No driver found.
    </div>
  );

  function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  function formatMobileNumber(number) {
    if (!number) return "";
    const str = number.toString().replace(/\s+/g, '');
    if (str.startsWith('+94')) {
      return str.replace(/(\+94)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4");
    }
    if (str.startsWith('07') && str.length === 10) {
      return str.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    }
    return number;
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  const mainPhoto = driver.front_photo || driver.back_photo || "";

  const isAvailable = Number(driver.is_available) === 1;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInFast {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        * { box-sizing: border-box; }

        .vd-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
          padding: 120px 24px 60px;
          font-family: 'Inter', sans-serif;
        }

        .vd-topbar {
          max-width: 1000px;
          margin: 0 auto 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: fadeInFast 0.5s ease both;
        }

        .vd-back-btn {
          padding: 11px 22px;
          background: #ffffff;
          color: #3b82f6;
          border: 1.5px solid #bfdbfe;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .vd-back-btn:hover {
          background: #f0f9ff;
          border-color: #3b82f6;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(59,130,246,0.15);
        }
        .vd-back-btn svg {
          width: 16px;
          height: 16px;
          stroke: #3b82f6;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .vd-page-title {
          font-size: 27px;
          font-weight: 800;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        /* Main Card */
        .vd-card {
          max-width: 1000px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 22px;
          box-shadow: 0 4px 6px rgba(59,130,246,0.06), 0 16px 48px rgba(59,130,246,0.13), 0 0 0 1px rgba(191,219,254,0.5);
          overflow: hidden;
          animation: fadeIn 0.6s ease both;
        }

        /* Top Section */
        .vd-top-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .vd-photo-col {
          height: 340px;
          position: relative;
          background: #f8fafc;
          border-right: 1.5px solid #e0f2fe;
          overflow: hidden;
        }

        .vd-photo-col img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vd-photo-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 12px;
          color: #cbd5e1;
        }

        .vd-photo-placeholder svg {
          width: 52px;
          height: 52px;
          stroke: #cbd5e1;
          fill: none;
          stroke-width: 1.3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .vd-photo-placeholder span {
          font-size: 14px;
          color: #cbd5e1;
          font-weight: 500;
        }

        /* Info Col */
        .vd-info-col {
          padding: 38px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .vd-driver-id {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #3b82f6;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .vd-driver-id svg {
          width: 14px;
          height: 14px;
          stroke: #3b82f6;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .vd-driver-name {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.5px;
          margin-bottom: 28px;
          line-height: 1.2;
        }

        .vd-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }

        .vd-info-item {}

        .vd-info-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.9px;
          margin-bottom: 7px;
        }

        .vd-info-label svg {
          width: 13px;
          height: 13px;
          stroke: #94a3b8;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .vd-info-value {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
        }

        .vd-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          font-size: 12px;
          border-radius: 20px;
          font-weight: 700;
        }

        .vd-badge-available {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          border: 1px solid #93c5fd;
        }

        .vd-badge-unavailable {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          color: #64748b;
          border: 1px solid #cbd5e1;
        }

        .vd-badge svg {
          width: 10px;
          height: 10px;
          stroke-width: 2.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
        }

        /* Divider */
        .vd-divider {
          height: 1.5px;
          background: linear-gradient(90deg, #f0f9ff, #bfdbfe 30%, #bfdbfe 70%, #f0f9ff);
        }

        /* Bottom Section */
        .vd-bottom-section {
          padding: 38px 40px;
          background: #fafbfc;
        }

        .vd-section-title {
          font-size: 17px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          letter-spacing: -0.2px;
        }

        .vd-section-title svg {
          width: 20px;
          height: 20px;
          stroke: #3b82f6;
          fill: none;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .vd-section-title-line {
          flex: 1;
          height: 1.5px;
          background: linear-gradient(90deg, #bfdbfe, transparent);
        }

        .vd-doc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .vd-doc-card {
          background: #ffffff;
          padding: 20px;
          border-radius: 14px;
          border: 1.5px solid #e0f2fe;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }

        .vd-doc-card:hover {
          border-color: #93c5fd;
          box-shadow: 0 4px 18px rgba(59,130,246,0.1);
          transform: translateY(-2px);
        }

        .vd-doc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .vd-doc-label {
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .vd-doc-label svg {
          width: 15px;
          height: 15px;
          stroke: #3b82f6;
          fill: none;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .vd-doc-expiry {
          font-size: 11px;
          color: #3b82f6;
          font-weight: 600;
          background: #f0f9ff;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid #bfdbfe;
        }

        .vd-doc-img-wrap {
          height: 210px;
          background: #f8fafc;
          border-radius: 10px;
          overflow: hidden;
          border: 1.5px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .vd-doc-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
          transition: transform 0.3s;
        }

        .vd-doc-img-wrap img:hover {
          transform: scale(1.03);
        }

        .vd-doc-img-wrap .vd-view-overlay {
          position: absolute;
          inset: 0;
          background: rgba(30,64,175,0.0);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          cursor: pointer;
        }

        .vd-doc-img-wrap:hover .vd-view-overlay {
          background: rgba(30,64,175,0.18);
        }

        .vd-view-overlay svg {
          width: 34px;
          height: 34px;
          stroke: #ffffff;
          fill: none;
          stroke-width: 1.6;
          stroke-linecap: round;
          stroke-linejoin: round;
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 0.2s, transform 0.2s;
        }

        .vd-doc-img-wrap:hover .vd-view-overlay svg {
          opacity: 1;
          transform: scale(1);
        }

        .vd-no-img {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 100%;
          color: #cbd5e1;
        }

        .vd-no-img svg {
          width: 38px;
          height: 38px;
          stroke: #cbd5e1;
          fill: none;
          stroke-width: 1.3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .vd-no-img span {
          font-size: 13px;
          font-weight: 500;
          color: #cbd5e1;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          backdrop-filter: blur(6px);
          animation: fadeInFast 0.2s ease-out;
          padding: 20px;
        }

        .dialog-content {
          background: #ffffff;
          padding: 38px 34px 32px;
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(15,23,42,0.22), 0 0 0 1px rgba(191,219,254,0.4);
          animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        .dialog-icon-wrap {
          width: 62px;
          height: 62px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
        }

        .dialog-icon-wrap svg {
          width: 28px;
          height: 28px;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .dialog-icon-error {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
        }
        .dialog-icon-error svg { stroke: #ef4444; }

        .dialog-icon-success {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        }
        .dialog-icon-success svg { stroke: #2563eb; }

        .dialog-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 10px;
          letter-spacing: -0.3px;
        }

        .dialog-message {
          font-size: 14.5px;
          color: #64748b;
          margin-bottom: 26px;
          line-height: 1.6;
        }

        .dialog-button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          border: none;
          padding: 12px 28px;
          border-radius: 11px;
          font-weight: 600;
          font-size: 14.5px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          width: 100%;
          box-shadow: 0 4px 14px rgba(37,99,235,0.32);
          transition: opacity 0.2s, transform 0.15s;
        }

        .dialog-button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .vd-page { padding: 100px 15px 40px; }
          .vd-top-section { grid-template-columns: 1fr !important; }
          .vd-photo-col { height: 240px; border-right: none; border-bottom: 1.5px solid #e0f2fe; }
          .vd-info-col { padding: 28px 22px; }
          .vd-doc-grid { grid-template-columns: 1fr !important; }
          .vd-bottom-section { padding: 28px 22px; }
          .vd-page-title { font-size: 20px; }
          .vd-topbar { flex-direction: row; gap: 12px; }
          .vd-driver-name { font-size: 22px; }
        }
      `}</style>

      <div className="vd-page">
        <Header userId={userId} />

        {/* Top Bar */}
        <div className="vd-topbar">
          <button
            className="vd-back-btn"
            onClick={() => router.push(`/driverDashboard?userId=${userId}`)}
          >
            <svg viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>

          <h1 className="vd-page-title">Driver Details</h1>
        </div>

        {/* Main Card */}
        {driver && (
          <div className="vd-card">

            {/* Top Section */}
            <div className="vd-top-section">

              {/* Photo */}
              <div className="vd-photo-col">
                {mainPhoto ? (
                  <img src={mainPhoto} alt="Driver License" />
                ) : (
                  <div className="vd-photo-placeholder">
                    <svg viewBox="0 0 24 24">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span>No Photo</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="vd-info-col">
                <div className="vd-driver-id">
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <circle cx="8" cy="12" r="2"/>
                    <path d="M12 9h6M12 12h4M12 15h5"/>
                  </svg>
                  Driver ID: {driver.driver_id}
                </div>

                <div className="vd-driver-name">
                  {capitalizeFirstLetter(driver.name)}
                </div>

                <div className="vd-info-grid">
                  <div className="vd-info-item">
                    <div className="vd-info-label">
                      <svg viewBox="0 0 24 24">
                        <path d="M6.6 10.8a15.2 15.2 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/>
                      </svg>
                      Contact
                    </div>
                    <div className="vd-info-value">{formatMobileNumber(driver.contact)}</div>
                  </div>

                  <div className="vd-info-item">
                    <div className="vd-info-label">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v4l3 3"/>
                      </svg>
                      Availability
                    </div>
                    <span className={`vd-badge ${isAvailable ? 'vd-badge-available' : 'vd-badge-unavailable'}`}>
                      {isAvailable ? (
                        <svg viewBox="0 0 24 24" style={{ stroke: '#1e40af' }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" style={{ stroke: '#64748b' }}>
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      )}
                      {isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  <div className="vd-info-item">
                    <div className="vd-info-label">
                      <svg viewBox="0 0 24 24">
                        <rect x="2" y="5" width="20" height="14" rx="2"/>
                        <circle cx="8" cy="12" r="2"/>
                        <path d="M12 9h6M12 12h4"/>
                      </svg>
                      License Number
                    </div>
                    <div className="vd-info-value">{driver.license_number}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="vd-divider" />

            {/* Bottom Section */}
            <div className="vd-bottom-section">
              <div className="vd-section-title">
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <circle cx="8" cy="12" r="2"/>
                  <path d="M12 9h6M12 12h4M12 15h5"/>
                </svg>
                Driving License
                <div className="vd-section-title-line" />
              </div>

              <div className="vd-doc-grid">

                {/* Front */}
                <div className="vd-doc-card">
                  <div className="vd-doc-header">
                    <div className="vd-doc-label">
                      <svg viewBox="0 0 24 24">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      Front Photo
                    </div>
                    <span className="vd-doc-expiry">Exp: {formatDate(driver.expiry_date)}</span>
                  </div>

                  <div className="vd-doc-img-wrap">
                    {driver.front_photo ? (
                      <>
                        <img
                          src={driver.front_photo}
                          alt="License Front"
                          onClick={() => window.open(driver.front_photo, '_blank')}
                        />
                        <div
                          className="vd-view-overlay"
                          onClick={() => window.open(driver.front_photo, '_blank')}
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </div>
                      </>
                    ) : (
                      <div className="vd-no-img">
                        <svg viewBox="0 0 24 24">
                          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                          <line x1="3" y1="3" x2="21" y2="21"/>
                        </svg>
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back */}
                <div className="vd-doc-card">
                  <div className="vd-doc-header">
                    <div className="vd-doc-label">
                      <svg viewBox="0 0 24 24">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      Back Photo
                    </div>
                  </div>

                  <div className="vd-doc-img-wrap">
                    {driver.back_photo ? (
                      <>
                        <img
                          src={driver.back_photo}
                          alt="License Back"
                          onClick={() => window.open(driver.back_photo, '_blank')}
                        />
                        <div
                          className="vd-view-overlay"
                          onClick={() => window.open(driver.back_photo, '_blank')}
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </div>
                      </>
                    ) : (
                      <div className="vd-no-img">
                        <svg viewBox="0 0 24 24">
                          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                          <line x1="3" y1="3" x2="21" y2="21"/>
                        </svg>
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Dialog */}
        {dialog.isOpen && (
          <div className="modal-overlay">
            <div className="dialog-content">
              <div className={`dialog-icon-wrap ${dialog.isError ? 'dialog-icon-error' : 'dialog-icon-success'}`}>
                {dialog.isError ? (
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                )}
              </div>
              <h3 className="dialog-title">{dialog.title}</h3>
              <p className="dialog-message">{dialog.message}</p>
              <button className="dialog-button" onClick={closeDialog}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default function ViewDriverPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
        color: '#64748b',
        fontSize: '18px',
        fontWeight: '500',
        fontFamily: 'Inter, sans-serif'
      }}>
        Loading Page...
      </div>
    }>
      <DriverContent />
    </Suspense>
  );
}