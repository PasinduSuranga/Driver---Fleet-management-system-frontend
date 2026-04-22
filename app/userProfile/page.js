"use client";
// Main page component and its dependencies

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "../../components/protectedRoute";

const API_BASE_URL = "http://localhost:5000/authentication";

// --- CUSTOM ALERT DIALOG COMPONENT ---
const AlertDialog = ({ isOpen, title, message, onClose, type }) => {
  if (!isOpen) return null;
  // Render the component UI
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-icon">
          {type === "error" ? (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          )}
        </div>
        <div className="msg-title">{title}</div>
        <p className="modal-message">{message}</p>
        <button className="msg-btn" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const [dialog, setDialog] = useState({ isOpen: false, type: "", title: "", message: "" });

  const showAlert = (type, title, message) => {
    setDialog({ isOpen: true, type, title, message });
  };

  // Fetch data from API

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/details/${userId}`);
      const data = await res.json();
      if (res.ok) {
        setUserProfile(data);
        setNewEmail(data.email);
      } else {
        showAlert("error", "Error", data.error || "Failed to load profile.");
      }
    } catch (err) {
      showAlert("error", "Error", "Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // Set up side effects on component mount or state change

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return showAlert("error", "Invalid Input", "Email address cannot be empty.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) return showAlert("error", "Invalid Input", "Please enter a valid email address.");

    setIsSubmittingEmail(true);
    try {
      const res = await fetch(`${API_BASE_URL}/request-email-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setShowOtpInput(true);
        showAlert("success", "OTP Sent", data.message);
      } else {
        showAlert("error", "Error", data.error);
      }
    } catch (err) {
      showAlert("error", "Error", "Failed to request OTP.");
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return showAlert("error", "Invalid Input", "Please enter the OTP.");

    setIsSubmittingEmail(true);
    try {
      const res = await fetch(`${API_BASE_URL}/verify-email-update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newEmail, otp })
      });
      const data = await res.json();
      if (res.ok) {
        setShowOtpInput(false);
        setOtp("");
        showAlert("success", "Success", data.message);
        fetchProfile();
      } else {
        showAlert("error", "Error", data.error);
      }
    } catch (err) {
      showAlert("error", "Error", "Failed to verify OTP.");
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwords;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return showAlert("error", "Invalid Input", "Please fill in all password fields.");
    }
    if (newPassword !== confirmPassword) {
      return showAlert("error", "Mismatch", "New password and confirm password do not match.");
    }
    if (newPassword.length < 6) {
      return showAlert("error", "Weak Password", "New password must be at least 6 characters long.");
    }

    setIsSubmittingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        showAlert("success", "Success", data.message);
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        showAlert("error", "Error", data.error);
      }
    } catch (err) {
      showAlert("error", "Error", "Failed to update password.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  function capitalize(str) {
    if (!str) return "";
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  if (loading) {
    // Render the component UI
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
        gap: '16px', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: '44px', height: '44px', border: '4px solid #bfdbfe',
          borderTopColor: '#1e40af', borderRadius: '50%', animation: 'profSpin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '16px', fontWeight: '500', color: '#64748b' }}>Loading Profile...</span>
        <style>{`@keyframes profSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!userProfile) {
    // Render the component UI
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
        color: '#64748b', fontSize: '16px', fontWeight: '500', fontFamily: 'Inter, sans-serif'
      }}>
        Failed to load user profile.
      </div>
    );
  }

  // Render the component UI

  return (
    <ProtectedRoute>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes modalPop {
            from { opacity: 0; transform: scale(0.88) translateY(16px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes profSpin { to { transform: rotate(360deg); } }

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
            min-height: 100vh;
            font-family: 'Inter', sans-serif;
          }

          /* ── Page Container ── */
          .page-container {
            max-width: 860px;
            margin: 0 auto;
            padding: 48px 24px 60px;
            animation: fadeIn 0.6s ease-out;
          }

          /* ── Page Header ── */
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }

          .title {
            font-size: 32px;
            font-weight: 800;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
          }

          /* ── Back Button ── */
          .back-btn {
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

          .back-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          }

          .back-btn svg {
            width: 16px;
            height: 16px;
            stroke: #ffffff;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          /* ── Profile Card ── */
          .profile-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
            border: 1px solid #e0f2fe;
            margin-bottom: 0;
            animation: slideUp 0.5s ease;
          }

          /* ── Avatar Section ── */
          .avatar-section {
            display: flex;
            align-items: center;
            gap: 24px;
            margin-bottom: 36px;
            padding-bottom: 28px;
            border-bottom: 1px solid #e0f2fe;
          }

          .avatar-circle {
            width: 76px;
            height: 76px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            font-weight: 800;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
            flex-shrink: 0;
            letter-spacing: -1px;
          }

          .user-info h2 {
            font-size: 22px;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 6px;
            letter-spacing: -0.3px;
          }

          .role-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1e40af;
            padding: 5px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            border: 1px solid #93c5fd;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .role-badge svg {
            width: 12px;
            height: 12px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          /* ── Form Section ── */
          .form-section {
            margin-bottom: 36px;
          }

          .form-section:last-child { margin-bottom: 0; }

          .section-divider {
            border: none;
            border-top: 1px solid #e0f2fe;
            margin: 0 0 32px;
          }

          .section-title {
            font-size: 17px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            letter-spacing: -0.2px;
          }

          .section-title-icon {
            width: 34px;
            height: 34px;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #93c5fd;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .section-title-icon svg {
            width: 16px;
            height: 16px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          /* ── Inputs ── */
          .input-group {
            margin-bottom: 20px;
          }

          .input-label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 8px;
          }

          .input-label-otp {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 8px;
          }

          .form-input {
            width: 100%;
            padding: 14px 18px;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            color: #1e293b;
            outline: none;
            transition: all 0.2s;
          }

          .form-input::placeholder { color: #94a3b8; }

          .form-input:focus {
            border-color: #3b82f6;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .form-input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            background: #f1f5f9;
          }

          /* ── Buttons ── */
          .submit-btn {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: #ffffff;
            border: none;
            padding: 13px 28px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
          }

          .submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          }

          .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .cancel-text-btn {
            background: #ffffff;
            color: #475569;
            border: 2px solid #e2e8f0;
            padding: 13px 24px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            transition: all 0.2s;
          }

          .cancel-text-btn:hover {
            background: #f0f9ff;
            border-color: #bfdbfe;
            color: #1e40af;
          }

          /* ── OTP notice ── */
          .otp-notice {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 1px solid #bfdbfe;
            border-radius: 10px;
            padding: 12px 16px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            font-weight: 500;
            color: #1e40af;
            animation: slideUp 0.3s ease;
          }

          .otp-notice svg {
            width: 15px;
            height: 15px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            flex-shrink: 0;
          }

          /* ── Two-column grid ── */
          .two-col-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          @media (max-width: 600px) {
            .two-col-grid { grid-template-columns: 1fr; }
            .page-container { padding: 32px 16px 40px; }
            .title { font-size: 24px; }
            .profile-card { padding: 28px 20px; }
          }

          /* ── Modal Overlay ── */
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(30, 64, 175, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(8px);
            animation: fadeIn 0.3s ease-out;
          }

          /* ── Dialog ── */
          .modal-content {
            background: #ffffff;
            border-radius: 16px;
            padding: 30px;
            width: 100%;
            max-width: 440px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25);
            border: 1px solid #e0f2fe;
            animation: modalPop 0.4s ease-out both;
            font-family: 'Inter', sans-serif;
          }

          .modal-icon {
            width: 62px;
            height: 62px;
            border-radius: 50%;
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 18px;
          }

          .modal-icon svg {
            width: 28px;
            height: 28px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .msg-title {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 10px;
            color: #1e293b;
          }

          .modal-message {
            color: #64748b;
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 4px;
          }

          .msg-btn {
            margin-top: 24px;
            padding: 12px 28px;
            font-size: 15px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            color: #ffffff;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            border: none;
            border-radius: 10px;
            cursor: pointer;
            width: 100%;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
            transition: all 0.3s;
          }

          .msg-btn:hover {
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          }
        `}</style>

        <div className="page-container">

          {/* ── Page Header ── */}
          <div className="page-header">
            <h1 className="title">Account Settings</h1>
            <button className="back-btn" onClick={() => router.back()}>
              <svg viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          </div>

          {/* ── Profile Card ── */}
          <div className="profile-card">

            {/* ── Avatar Section ── */}
            <div className="avatar-section">
              <div className="avatar-circle">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <h2>{capitalize(userProfile.name)}</h2>
                <span className="role-badge">
                  <svg viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {userProfile.role}
                </span>
              </div>
            </div>

            {/* ── Form 1: Update Email ── */}
            <div className="form-section">
              <h3 className="section-title">
                <div className="section-title-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                Update Email Address
              </h3>

              <form onSubmit={showOtpInput ? handleVerifyOtp : handleRequestOtp}>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email address"
                    disabled={showOtpInput}
                  />
                </div>

                {showOtpInput && (
                  <>
                    <div className="otp-notice">
                      <svg viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                      OTP sent to <strong style={{ marginLeft: 4 }}>{newEmail}</strong>
                    </div>
                    <div className="input-group" style={{ animation: "slideUp 0.3s ease" }}>
                      <label className="input-label-otp">Enter the 6-digit OTP</label>
                      <input
                        type="text"
                        className="form-input"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        maxLength="6"
                      />
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmittingEmail || (!showOtpInput && newEmail === userProfile.email)}
                  >
                    {isSubmittingEmail ? "Processing..." : (showOtpInput ? "Verify & Save" : "Send OTP")}
                  </button>
                  {showOtpInput && (
                    <button
                      type="button"
                      className="cancel-text-btn"
                      onClick={() => { setShowOtpInput(false); setOtp(""); }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* ── Divider ── */}
            <hr className="section-divider" />

            {/* ── Form 2: Update Password ── */}
            <div className="form-section">
              <h3 className="section-title">
                <div className="section-title-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                Change Password
              </h3>

              <form onSubmit={handlePasswordUpdate}>
                <div className="input-group">
                  <label className="input-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="two-col-grid">
                  <div className="input-group">
                    <label className="input-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={isSubmittingPassword}>
                  {isSubmittingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>

          </div>

          {/* ── Global Alerts ── */}
          <AlertDialog
            isOpen={dialog.isOpen}
            type={dialog.type}
            title={dialog.title}
            message={dialog.message}
            onClose={() => setDialog({ ...dialog, isOpen: false })}
          />
        </div>
      </>
    </ProtectedRoute>
  );
}

export default function UserProfile() {
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
      <ProfileContent />
    </Suspense>
  );
}