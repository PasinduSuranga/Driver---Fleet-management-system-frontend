"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import Sidebar from "../../components/adminNavbar";
import ProtectedRoute from "../../components/protectedRoute";

const API_BASE_URL = "http://localhost:5000/driver";

const AdminDriverContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const driverId = searchParams.get('driverId');
  const userId = searchParams.get('userId');

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "", isError: false });

  useEffect(() => {
    if (driverId) fetchDriverDetails(driverId);
  }, [driverId]);

  const fetchDriverDetails = async (dId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/driverDetails?driverId=${dId}`);
      setDriver(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setDialog({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to fetch driver details.",
        isError: true
      });
    }
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
    if (dialog.isError) router.back();
  };

  const capitalize = (str) => str ? str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "";
  const toUpper = (str) => str ? str.toUpperCase() : "";
  const formatMobileNumber = (num) => {
    if (!num) return "";
    const str = num.toString().replace(/\s+/g, '');
    if (str.startsWith('+94')) return str.replace(/(\+94)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4");
    if (str.startsWith('07')) return str.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    return num;
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <div style={{
        marginLeft: '250px', flex: 1, minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px'
      }}>
        <div style={{
          width: '44px', height: '44px', border: '4px solid #bfdbfe',
          borderTopColor: '#1e40af', borderRadius: '50%', animation: 'advSpin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '16px', fontWeight: '500', color: '#64748b' }}>Loading details...</span>
        <style>{`@keyframes advSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (!driver && !dialog.isOpen) return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <div style={{
        marginLeft: '250px', flex: 1, minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#64748b', fontSize: '16px', fontWeight: '500'
      }}>
        No driver found.
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
    <div className="adv-layout">
      <Sidebar />
      <div className="adv-main">

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

          @keyframes advFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes advSlideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes advModalPop {
            from { opacity: 0; transform: scale(0.88) translateY(16px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes advSpin { to { transform: rotate(360deg); } }

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          /* ── Layout ── */
          .adv-layout {
            display: flex;
            min-height: 100vh;
            font-family: 'Inter', sans-serif;
          }

          .adv-main {
            margin-left: 250px;
            min-height: 100vh;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
            display: flex;
            flex-direction: column;
            flex: 1;
          }

          @media (max-width: 768px) {
            .adv-main { margin-left: 220px; }
            .adv-details-grid { grid-template-columns: 1fr !important; }
            .adv-doc-grid { grid-template-columns: 1fr !important; }
            .adv-page { padding: 24px 16px; }
            .adv-page-title { font-size: 24px; }
          }

          /* ── Page Container ── */
          .adv-page {
            padding: 40px;
            animation: advFadeIn 0.5s ease both;
            flex-grow: 1;
          }

          /* ── Top Bar ── */
          .adv-topbar {
            max-width: 1000px;
            margin: 0 auto 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            animation: advSlideIn 0.5s ease both;
            flex-wrap: wrap;
            gap: 14px;
          }

          .adv-back-btn {
            padding: 12px 24px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: #ffffff;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
            transition: all 0.3s;
          }

          .adv-back-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          }

          .adv-back-btn svg {
            width: 16px;
            height: 16px;
            stroke: #ffffff;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .adv-page-title {
            font-size: 32px;
            font-weight: 800;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
          }

          /* ── Main Card ── */
          .adv-card {
            max-width: 1000px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
            border: 1px solid #e0f2fe;
            overflow: hidden;
            animation: advFadeIn 0.6s ease both;
          }

          /* ── Top Info Section ── */
          .adv-info-section {
            padding: 40px;
          }

          /* ── Driver Name Row ── */
          .adv-name-row {
            display: flex;
            align-items: center;
            gap: 14px;
            flex-wrap: wrap;
            margin-bottom: 30px;
          }

          .adv-driver-name {
            font-size: 28px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: -0.3px;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .adv-driver-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
            flex-shrink: 0;
          }

          .adv-driver-icon svg {
            width: 24px;
            height: 24px;
            stroke: #ffffff;
            fill: none;
            stroke-width: 1.7;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .adv-blacklisted-badge {
            font-size: 12px;
            padding: 6px 14px;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1e40af;
            border-radius: 20px;
            border: 1px solid #93c5fd;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            letter-spacing: 0.3px;
          }

          .adv-blacklisted-badge svg {
            width: 13px;
            height: 13px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 2.2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          /* ── Details Grid ── */
          .adv-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .adv-detail-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            border: 2px solid #e0f2fe;
            transition: border-color 0.2s, box-shadow 0.2s;
          }

          .adv-detail-card:hover {
            border-color: #93c5fd;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
          }

          .adv-detail-label {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            margin-bottom: 10px;
            letter-spacing: 0.8px;
          }

          .adv-detail-label svg {
            width: 13px;
            height: 13px;
            stroke: #3b82f6;
            fill: none;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
            flex-shrink: 0;
          }

          .adv-detail-value {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
          }

          /* ── Availability Badge ── */
          .adv-avail-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            font-size: 13px;
            border-radius: 20px;
            font-weight: 700;
          }

          .adv-avail-badge svg {
            width: 10px;
            height: 10px;
            stroke: currentColor;
            fill: none;
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .adv-avail-yes {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1e40af;
            border: 1px solid #93c5fd;
          }

          .adv-avail-no {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            color: #475569;
            border: 1px solid #cbd5e1;
          }

          /* ── Divider ── */
          .adv-divider {
            height: 1px;
            background: linear-gradient(90deg, #f0f9ff, #bfdbfe 30%, #bfdbfe 70%, #f0f9ff);
          }

          /* ── Docs Section ── */
          .adv-docs-section {
            padding: 40px;
            background: #f8fafc;
          }

          .adv-docs-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 12px;
          }

          .adv-docs-title {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 10px;
            letter-spacing: -0.2px;
          }

          .adv-docs-title svg {
            width: 20px;
            height: 20px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 1.7;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .adv-expiry-badge {
            font-size: 13px;
            font-weight: 600;
            color: #1e40af;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            padding: 7px 16px;
            border-radius: 20px;
            border: 1px solid #93c5fd;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .adv-expiry-badge svg {
            width: 13px;
            height: 13px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          /* ── Doc Grid ── */
          .adv-doc-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }

          .adv-doc-card {
            background: #ffffff;
            padding: 20px;
            border-radius: 14px;
            border: 2px solid #e0f2fe;
            transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
          }

          .adv-doc-card:hover {
            border-color: #93c5fd;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
            transform: translateY(-2px);
          }

          .adv-doc-label {
            font-size: 13px;
            font-weight: 700;
            color: #475569;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .adv-doc-label svg {
            width: 15px;
            height: 15px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 1.7;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .adv-doc-img-wrap {
            height: 240px;
            background: #f8fafc;
            border-radius: 10px;
            overflow: hidden;
            border: 2px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }

          .adv-doc-img-wrap img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            cursor: pointer;
            transition: transform 0.3s;
          }

          .adv-doc-img-wrap img:hover { transform: scale(1.03); }

          .adv-doc-img-wrap .adv-view-overlay {
            position: absolute;
            inset: 0;
            background: rgba(30, 64, 175, 0.0);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
            cursor: pointer;
          }

          .adv-doc-img-wrap:hover .adv-view-overlay {
            background: rgba(30, 64, 175, 0.22);
          }

          .adv-view-overlay svg {
            width: 32px;
            height: 32px;
            stroke: #ffffff;
            fill: none;
            stroke-width: 1.6;
            stroke-linecap: round;
            stroke-linejoin: round;
            opacity: 0;
            transform: scale(0.8);
            transition: opacity 0.2s, transform 0.2s;
          }

          .adv-doc-img-wrap:hover .adv-view-overlay svg {
            opacity: 1;
            transform: scale(1);
          }

          .adv-no-img {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            height: 100%;
          }

          .adv-no-img svg {
            width: 38px;
            height: 38px;
            stroke: #bfdbfe;
            fill: none;
            stroke-width: 1.3;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .adv-no-img span {
            font-size: 13px;
            font-weight: 500;
            color: #94a3b8;
          }

          /* ── Modal Overlay ── */
          .adv-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(30, 64, 175, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(8px);
            animation: advFadeIn 0.3s ease-out;
          }

          /* ── Dialog ── */
          .adv-dialog {
            background: #ffffff;
            padding: 30px;
            border-radius: 16px;
            width: 90%;
            max-width: 440px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25);
            border: 1px solid #e0f2fe;
            animation: advModalPop 0.4s ease-out both;
            font-family: 'Inter', sans-serif;
          }

          .adv-dialog-icon {
            width: 62px;
            height: 62px;
            border-radius: 50%;
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 18px;
          }

          .adv-dialog-icon svg {
            width: 28px;
            height: 28px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .adv-dialog-title {
            font-size: 22px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 10px;
          }

          .adv-dialog-message {
            font-size: 15px;
            color: #64748b;
            margin-bottom: 4px;
            line-height: 1.6;
          }

          .adv-dialog-btn {
            margin-top: 24px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: #ffffff;
            border: none;
            padding: 12px 28px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            width: 100%;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
            transition: all 0.3s;
          }

          .adv-dialog-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          }
        `}</style>

        <div className="adv-page">

          {/* ── Top Bar ── */}
          <div className="adv-topbar">
            <button className="adv-back-btn" onClick={() => router.back()}>
              <svg viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <div className="adv-page-title">Driver Details</div>
          </div>

          {/* ── Main Card ── */}
          {driver && (
            <div className="adv-card">

              {/* ── Info Section ── */}
              <div className="adv-info-section">

                {/* Driver Name Row */}
                <div className="adv-name-row">
                  <div className="adv-driver-icon">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M20 21a8 8 0 10-16 0"/>
                    </svg>
                  </div>
                  <div className="adv-driver-name">
                    {capitalize(driver.name)}
                  </div>
                  {(driver.is_blacklisted === '1' || driver.is_blacklisted === 1) && (
                    <span className="adv-blacklisted-badge">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                      </svg>
                      BLACKLISTED
                    </span>
                  )}
                </div>

                {/* Details Grid */}
                <div className="adv-details-grid">

                  <div className="adv-detail-card">
                    <div className="adv-detail-label">
                      <svg viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="16" rx="2"/>
                        <line x1="8" y1="10" x2="16" y2="10"/>
                        <line x1="8" y1="14" x2="13" y2="14"/>
                      </svg>
                      Driver ID
                    </div>
                    <span className="adv-detail-value">{driver.driver_id}</span>
                  </div>

                  <div className="adv-detail-card">
                    <div className="adv-detail-label">
                      <svg viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                      Contact Number
                    </div>
                    <span className="adv-detail-value">{formatMobileNumber(driver.contact)}</span>
                  </div>

                  <div className="adv-detail-card">
                    <div className="adv-detail-label">
                      <svg viewBox="0 0 24 24">
                        <rect x="2" y="5" width="20" height="14" rx="2"/>
                        <circle cx="8" cy="12" r="2"/>
                        <path d="M12 9h6M12 12h4M12 15h5"/>
                      </svg>
                      License Number
                    </div>
                    <span className="adv-detail-value">{toUpper(driver.license_number)}</span>
                  </div>

                  <div className="adv-detail-card">
                    <div className="adv-detail-label">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      Availability
                    </div>
                    <span className={`adv-avail-badge ${driver.is_available === 1 ? 'adv-avail-yes' : 'adv-avail-no'}`}>
                      {driver.is_available === 1 ? (
                        <>
                          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                          Available
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          Unavailable
                        </>
                      )}
                    </span>
                  </div>

                </div>
              </div>

              <div className="adv-divider" />

              {/* ── Docs Section ── */}
              <div className="adv-docs-section">

                <div className="adv-docs-header">
                  <div className="adv-docs-title">
                    <svg viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    License Documentation
                  </div>
                  {driver.expiry_date && (
                    <div className="adv-expiry-badge">
                      <svg viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Expires: {formatDate(driver.expiry_date)}
                    </div>
                  )}
                </div>

                <div className="adv-doc-grid">

                  {/* Front Photo */}
                  <div className="adv-doc-card">
                    <div className="adv-doc-label">
                      <svg viewBox="0 0 24 24">
                        <rect x="2" y="5" width="20" height="14" rx="2"/>
                        <circle cx="8" cy="12" r="2"/>
                        <path d="M12 9h6M12 12h4M12 15h5"/>
                      </svg>
                      License (Front)
                    </div>
                    <div className="adv-doc-img-wrap">
                      {driver.front_photo ? (
                        <>
                          <img
                            src={driver.front_photo}
                            alt="Front"
                            onClick={() => window.open(driver.front_photo, '_blank')}
                          />
                          <div className="adv-view-overlay" onClick={() => window.open(driver.front_photo, '_blank')}>
                            <svg viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="adv-no-img">
                          <svg viewBox="0 0 24 24">
                            <rect x="2" y="5" width="20" height="14" rx="2"/>
                            <circle cx="8" cy="12" r="2"/>
                            <path d="M12 9h6M12 12h4"/>
                            <line x1="3" y1="3" x2="21" y2="21"/>
                          </svg>
                          <span>No Image Provided</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back Photo */}
                  <div className="adv-doc-card">
                    <div className="adv-doc-label">
                      <svg viewBox="0 0 24 24">
                        <rect x="2" y="5" width="20" height="14" rx="2"/>
                        <circle cx="8" cy="12" r="2"/>
                        <path d="M12 9h6M12 12h4M12 15h5"/>
                      </svg>
                      License (Back)
                    </div>
                    <div className="adv-doc-img-wrap">
                      {driver.back_photo ? (
                        <>
                          <img
                            src={driver.back_photo}
                            alt="Back"
                            onClick={() => window.open(driver.back_photo, '_blank')}
                          />
                          <div className="adv-view-overlay" onClick={() => window.open(driver.back_photo, '_blank')}>
                            <svg viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="adv-no-img">
                          <svg viewBox="0 0 24 24">
                            <rect x="2" y="5" width="20" height="14" rx="2"/>
                            <circle cx="8" cy="12" r="2"/>
                            <path d="M12 9h6M12 12h4"/>
                            <line x1="3" y1="3" x2="21" y2="21"/>
                          </svg>
                          <span>No Image Provided</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Dialog Modal ── */}
        {dialog.isOpen && (
          <div className="adv-modal-overlay">
            <div className="adv-dialog">
              <div className="adv-dialog-icon">
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
              <div className="adv-dialog-title">{dialog.title}</div>
              <p className="adv-dialog-message">{dialog.message}</p>
              <button className="adv-dialog-btn" onClick={closeDialog}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default function AdminViewDriverPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        color: '#64748b',
        fontSize: '16px',
        fontWeight: '500'
      }}>
        Loading...
      </div>
    }>
      <AdminDriverContent />
    </Suspense>
  );
}