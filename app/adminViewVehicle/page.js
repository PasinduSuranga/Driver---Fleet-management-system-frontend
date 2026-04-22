"use client";
// Main page component and its dependencies

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import Sidebar from "../../components/adminNavbar";
import ProtectedRoute from "../../components/protectedRoute";

const AdminVehicleContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const vehicleNumber = searchParams.get('vehicleNumber');
  const userId = searchParams.get('userId');

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "", isError: false });

  // Set up side effects on component mount or state change

  useEffect(() => {
    if (vehicleNumber) fetchVehicleDetails(vehicleNumber);
  }, [vehicleNumber]);

  const fetchVehicleDetails = async (vNum) => {
    try {
      const response = await axios.get(`http://localhost:5000/vehicle/vehicleDetails?vehicleNumber=${vNum}`);
      setVehicle(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setDialog({ isOpen: true, title: "Error", message: "Failed to fetch vehicle details.", isError: true });
    }
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
    if (dialog.isError) {
      router.back();
    }
  };

  const capitalizeFirstLetter = (str) => str ? str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
  const toUpper = (str) => str ? str.toUpperCase() : "";
  const formatMobileNumber = (number) => {
    if (!number) return "";
    const str = number.toString().replace(/\s+/g, '');
    if (str.startsWith('+94')) return str.replace(/(\+94)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4");
    if (str.startsWith('07')) return str.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    return number;
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) return (
    <div style={{
      display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif'
    }}>
      <Sidebar />
      <div style={{
        marginLeft: '250px', flex: 1, minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '44px', height: '44px', border: '4px solid #bfdbfe',
          borderTopColor: '#1e40af', borderRadius: '50%', animation: 'avvSpin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '16px', fontWeight: '500', color: '#64748b' }}>Loading details...</span>
        <style>{`@keyframes avvSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (!vehicle && !dialog.isOpen) return (
    <div style={{
      display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif'
    }}>
      <Sidebar />
      <div style={{
        marginLeft: '250px', flex: 1, minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#64748b', fontSize: '16px', fontWeight: '500'
      }}>
        No vehicle found.
      </div>
    </div>
  );

  // Render the component UI

  return (
    <ProtectedRoute>
    <div className="avv-layout">
      <Sidebar />
      <div className="avv-main">

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

          @keyframes avvFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes avvSlideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes avvModalPop {
            from { opacity: 0; transform: scale(0.88) translateY(16px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes avvSpin { to { transform: rotate(360deg); } }

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          /* ── Layout ── */
          .avv-layout {
            display: flex;
            min-height: 100vh;
            font-family: 'Inter', sans-serif;
          }

          .avv-main {
            margin-left: 250px;
            min-height: 100vh;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
            display: flex;
            flex-direction: column;
            flex: 1;
          }

          /* ── Page Container ── */
          .avv-page {
            padding: 40px;
            animation: avvFadeIn 0.5s ease both;
            flex-grow: 1;
          }

          /* ── Top Bar ── */
          .avv-topbar {
            max-width: 1000px;
            margin: 0 auto 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            animation: avvSlideIn 0.5s ease both;
            flex-wrap: wrap;
            gap: 14px;
          }

          .avv-back-btn {
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

          .avv-back-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          }

          .avv-back-btn svg {
            width: 16px;
            height: 16px;
            stroke: #ffffff;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .avv-page-title {
            font-size: 32px;
            font-weight: 800;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
          }

          /* ── Main Card ── */
          .avv-card {
            max-width: 1000px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
            border: 1px solid #e0f2fe;
            overflow: hidden;
            animation: avvFadeIn 0.6s ease both;
          }

          /* ── Top Section ── */
          .avv-top {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .avv-photo-col {
            height: 340px;
            position: relative;
            background: #f8fafc;
            border-right: 1px solid #e0f2fe;
            overflow: hidden;
          }

          .avv-photo-col img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .avv-no-photo {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: 12px;
          }

          .avv-no-photo svg {
            width: 52px;
            height: 52px;
            stroke: #bfdbfe;
            fill: none;
            stroke-width: 1.3;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .avv-no-photo span {
            font-size: 14px;
            font-weight: 500;
            color: #94a3b8;
          }

          /* ── Info Col ── */
          .avv-info-col {
            padding: 38px 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .avv-vehicle-type {
            font-size: 11.5px;
            font-weight: 700;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            color: #1e40af;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .avv-vehicle-type svg {
            width: 14px;
            height: 14px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .avv-vehicle-number-row {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 26px;
          }

          .avv-vehicle-number {
            font-size: 26px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: -0.3px;
            line-height: 1.2;
          }

          .avv-blacklisted-badge {
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

          .avv-blacklisted-badge svg {
            width: 13px;
            height: 13px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 2.2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          /* ── Info Grid ── */
          .avv-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 22px;
          }

          .avv-info-label {
            display: block;
            font-size: 10.5px;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            margin-bottom: 6px;
            letter-spacing: 0.9px;
          }

          .avv-info-value {
            font-size: 15px;
            font-weight: 600;
            color: #1e293b;
          }

          .avv-avail-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            font-size: 12px;
            border-radius: 20px;
            font-weight: 700;
          }

          .avv-avail-badge svg {
            width: 10px;
            height: 10px;
            stroke: currentColor;
            fill: none;
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .avv-avail-yes {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1e40af;
            border: 1px solid #93c5fd;
          }

          .avv-avail-no {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            color: #475569;
            border: 1px solid #cbd5e1;
          }

          /* ── Divider ── */
          .avv-divider {
            height: 1px;
            background: linear-gradient(90deg, #f0f9ff, #bfdbfe 30%, #bfdbfe 70%, #f0f9ff);
          }

          /* ── Bottom Section ── */
          .avv-bottom {
            padding: 38px 40px;
            background: #f8fafc;
          }

          .avv-section-title {
            font-size: 17px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
            letter-spacing: -0.2px;
          }

          .avv-section-title svg {
            width: 20px;
            height: 20px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 1.7;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .avv-section-title-line {
            flex: 1;
            height: 1px;
            background: linear-gradient(90deg, #bfdbfe, transparent);
          }

          /* ── Doc Grid ── */
          .avv-doc-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }

          .avv-doc-card {
            background: #ffffff;
            padding: 20px;
            border-radius: 14px;
            border: 2px solid #e0f2fe;
            transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
            width: 100%;
          }

          .avv-doc-card:hover {
            border-color: #93c5fd;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
            transform: translateY(-2px);
          }

          .avv-doc-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 13px;
          }

          .avv-doc-label {
            font-size: 13px;
            font-weight: 700;
            color: #475569;
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .avv-doc-label svg {
            width: 15px;
            height: 15px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 1.7;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .avv-doc-expiry {
            font-size: 11px;
            color: #1e40af;
            font-weight: 600;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            padding: 4px 10px;
            border-radius: 20px;
            border: 1px solid #93c5fd;
          }

          .avv-doc-img-wrap {
            height: 188px;
            background: #f8fafc;
            border-radius: 10px;
            overflow: hidden;
            border: 2px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }

          .avv-doc-img-wrap img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            cursor: pointer;
            transition: transform 0.3s;
          }

          .avv-doc-img-wrap img:hover { transform: scale(1.04); }

          .avv-doc-img-wrap .avv-view-overlay {
            position: absolute;
            inset: 0;
            background: rgba(30, 64, 175, 0.0);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
            cursor: pointer;
          }

          .avv-doc-img-wrap:hover .avv-view-overlay {
            background: rgba(30, 64, 175, 0.22);
          }

          .avv-view-overlay svg {
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

          .avv-doc-img-wrap:hover .avv-view-overlay svg {
            opacity: 1;
            transform: scale(1);
          }

          .avv-no-img {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            height: 100%;
          }

          .avv-no-img svg {
            width: 36px;
            height: 36px;
            stroke: #bfdbfe;
            fill: none;
            stroke-width: 1.3;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .avv-no-img span {
            font-size: 13px;
            font-weight: 500;
            color: #94a3b8;
          }

          /* ── Modal Overlay ── */
          .avv-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(30, 64, 175, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(8px);
            animation: avvFadeIn 0.3s ease-out;
            padding: 20px;
          }

          /* ── Dialog ── */
          .avv-dialog {
            background: #ffffff;
            padding: 30px;
            border-radius: 16px;
            width: 100%;
            max-width: 440px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25);
            border: 1px solid #e0f2fe;
            animation: avvModalPop 0.4s ease-out both;
            font-family: 'Inter', sans-serif;
          }

          .avv-dialog-icon {
            width: 62px;
            height: 62px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 18px;
          }

          .avv-dialog-icon svg {
            width: 28px;
            height: 28px;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .avv-icon-success {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          }
          .avv-icon-success svg { stroke: #1e40af; }

          .avv-icon-error {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          }
          .avv-icon-error svg { stroke: #1e40af; }

          .avv-dialog-title {
            font-size: 22px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 10px;
          }

          .avv-dialog-message {
            font-size: 15px;
            color: #64748b;
            margin-bottom: 4px;
            line-height: 1.65;
          }

          .avv-dialog-btn {
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

          .avv-dialog-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          }

          @media (max-width: 768px) {
            .avv-main { margin-left: 220px; }
            .avv-page { padding: 24px 16px; }
            .avv-top { grid-template-columns: 1fr !important; }
            .avv-photo-col { height: 240px; border-right: none; border-bottom: 1px solid #e0f2fe; }
            .avv-info-col { padding: 28px 22px; }
            .avv-doc-grid { grid-template-columns: 1fr !important; }
            .avv-bottom { padding: 28px 22px; }
            .avv-page-title { font-size: 24px; }
          }
        `}</style>

        <div className="avv-page">

          {/* ── Top Bar ── */}
          <div className="avv-topbar">
            <button className="avv-back-btn" onClick={() => router.back()}>
              <svg viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <div className="avv-page-title">Vehicle Details</div>
          </div>

          {/* ── Main Card ── */}
          {vehicle && (
            <div className="avv-card">

              {/* Top Section */}
              <div className="avv-top">

                {/* Photo */}
                <div className="avv-photo-col">
                  {vehicle.vehicle_photo ? (
                    <img src={vehicle.vehicle_photo} alt={vehicle.vehicle_number} />
                  ) : (
                    <div className="avv-no-photo">
                      <svg viewBox="0 0 24 24">
                        <rect x="1" y="3" width="15" height="13" rx="1"/>
                        <path d="M16 8h4l3 3v5h-7V8z"/>
                        <circle cx="5.5" cy="18.5" r="2.5"/>
                        <circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                      <span>No Photo</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="avv-info-col">
                  <div className="avv-vehicle-type">
                    <svg viewBox="0 0 24 24">
                      <rect x="1" y="3" width="15" height="13" rx="1"/>
                      <path d="M16 8h4l3 3v5h-7V8z"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    {capitalizeFirstLetter(vehicle.vehicle_type)}
                  </div>

                  <div className="avv-vehicle-number-row">
                    <div className="avv-vehicle-number">{toUpper(vehicle.vehicle_number)}</div>
                    {(vehicle.is_blacklisted === '1' || vehicle.is_blacklisted === 1) && (
                      <span className="avv-blacklisted-badge">
                        <svg viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                        </svg>
                        BLACKLISTED
                      </span>
                    )}
                  </div>

                  <div className="avv-info-grid">
                    <div>
                      <span className="avv-info-label">Category</span>
                      <span className="avv-info-value">{capitalizeFirstLetter(vehicle.category_name)}</span>
                    </div>

                    <div>
                      <span className="avv-info-label">Availability</span>
                      <span className={`avv-avail-badge ${vehicle.availability === 0 ? 'avv-avail-yes' : 'avv-avail-no'}`}>
                        {vehicle.availability === 0 ? (
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

                    <div>
                      <span className="avv-info-label">Owner Name</span>
                      <span className="avv-info-value">{capitalizeFirstLetter(vehicle.owner_name)}</span>
                    </div>

                    <div>
                      <span className="avv-info-label">Contact</span>
                      <span className="avv-info-value">{formatMobileNumber(vehicle.contact_no)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="avv-divider" />

              {/* Bottom Section */}
              <div className="avv-bottom">
                <div className="avv-section-title">
                  <svg viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  Documentation
                  <div className="avv-section-title-line" />
                </div>

                <div className="avv-doc-grid">

                  {/* Book Copy */}
                  <div className="avv-doc-card">
                    <div className="avv-doc-header">
                      <div className="avv-doc-label">
                        <svg viewBox="0 0 24 24">
                          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
                          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                        </svg>
                        Book Copy
                      </div>
                    </div>
                    <div className="avv-doc-img-wrap">
                      {vehicle.book_copy ? (
                        <>
                          <img
                            src={vehicle.book_copy}
                            alt="Book"
                            onClick={() => window.open(vehicle.book_copy, '_blank')}
                          />
                          <div className="avv-view-overlay" onClick={() => window.open(vehicle.book_copy, '_blank')}>
                            <svg viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="avv-no-img">
                          <svg viewBox="0 0 24 24">
                            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
                            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                            <line x1="3" y1="3" x2="21" y2="21"/>
                          </svg>
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* License */}
                  <div className="avv-doc-card">
                    <div className="avv-doc-header">
                      <div className="avv-doc-label">
                        <svg viewBox="0 0 24 24">
                          <rect x="2" y="5" width="20" height="14" rx="2"/>
                          <circle cx="8" cy="12" r="2"/>
                          <path d="M12 9h6M12 12h4M12 15h5"/>
                        </svg>
                        License
                      </div>
                      <span className="avv-doc-expiry">{formatDate(vehicle.license_expiry)}</span>
                    </div>
                    <div className="avv-doc-img-wrap">
                      {vehicle.license_copy ? (
                        <>
                          <img
                            src={vehicle.license_copy}
                            alt="License"
                            onClick={() => window.open(vehicle.license_copy, '_blank')}
                          />
                          <div className="avv-view-overlay" onClick={() => window.open(vehicle.license_copy, '_blank')}>
                            <svg viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="avv-no-img">
                          <svg viewBox="0 0 24 24">
                            <rect x="2" y="5" width="20" height="14" rx="2"/>
                            <circle cx="8" cy="12" r="2"/>
                            <path d="M12 9h6M12 12h4"/>
                            <line x1="3" y1="3" x2="21" y2="21"/>
                          </svg>
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Insurance */}
                  <div className="avv-doc-card">
                    <div className="avv-doc-header">
                      <div className="avv-doc-label">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        Insurance
                      </div>
                      <span className="avv-doc-expiry">{formatDate(vehicle.insurance_expiry)}</span>
                    </div>
                    <div className="avv-doc-img-wrap">
                      {vehicle.insurance_copy ? (
                        <>
                          <img
                            src={vehicle.insurance_copy}
                            alt="Insurance"
                            onClick={() => window.open(vehicle.insurance_copy, '_blank')}
                          />
                          <div className="avv-view-overlay" onClick={() => window.open(vehicle.insurance_copy, '_blank')}>
                            <svg viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="avv-no-img">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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
        </div>

        {/* ── Dialog Modal ── */}
        {dialog.isOpen && (
          <div className="avv-modal-overlay">
            <div className="avv-dialog">
              <div className={`avv-dialog-icon ${dialog.isError ? 'avv-icon-error' : 'avv-icon-success'}`}>
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
              <div className="avv-dialog-title">{dialog.title}</div>
              <p className="avv-dialog-message">{dialog.message}</p>
              <button className="avv-dialog-btn" onClick={closeDialog}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default function AdminViewVehiclePage() {
  // Render the component UI
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
      <AdminVehicleContent />
    </Suspense>
  );
}