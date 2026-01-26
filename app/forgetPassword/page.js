'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CompanyLogo from "../../components/companyLogo"; 

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    isError: false
  });

  const router = useRouter();

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
    if (step === 3 && !dialog.isError && dialog.title === "Success") {
      router.push("/"); 
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!form.email || !form.email.includes("@")) {
        setDialog({ isOpen: true, title: "Validation Error", message: "Please enter a valid email.", isError: true });
        return;
    }

    setIsLoading(true);
    try {
        const res = await fetch("http://localhost:5000/authentication/forgetPassword", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email }),
        });
        const data = await res.json();
        
        if (res.ok) {
            setStep(2); 
            setDialog({ isOpen: true, title: "OTP Sent", message: data.message, isError: false });
        } else {
            setDialog({ isOpen: true, title: "Error", message: data.message, isError: true });
        }
    } catch (err) {
        setDialog({ isOpen: true, title: "System Error", message: "Connection failed.", isError: true });
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
      e.preventDefault();
      
      if (!form.otp || form.otp.length < 6) {
        setDialog({ isOpen: true, title: "Validation Error", message: "Please enter the 6-digit OTP.", isError: true });
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:5000/authentication/verifyOTP", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email, otp: form.otp }),
        });
        const data = await res.json();

        if (res.ok) {
            setStep(3);
        } else {
            setDialog({ isOpen: true, title: "Invalid OTP", message: data.message, isError: true });
        }
      } catch (err) {
        setDialog({ isOpen: true, title: "System Error", message: "Connection failed.", isError: true });
      } finally {
        setIsLoading(false);
      }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!form.newPassword || !passwordRegex.test(form.newPassword)) {
        setDialog({ 
            isOpen: true, 
            title: "Validation Error", 
            message: "Password must be at least 6 chars, with Uppercase, Lowercase, Number & Special Char.", 
            isError: true 
        });
        return;
    }
    if (form.newPassword !== form.confirmPassword) {
        setDialog({ isOpen: true, title: "Mismatch", message: "Passwords do not match.", isError: true });
        return;
    }

    setIsLoading(true);
    try {
        const res = await fetch("http://localhost:5000/authentication/resetPassword", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email: form.email, 
                otp: form.otp, 
                newPassword: form.newPassword 
            }),
        });
        const data = await res.json();

        if (res.ok) {
            setDialog({ isOpen: true, title: "Success", message: data.message, isError: false });
        } else {
            setDialog({ isOpen: true, title: "Reset Failed", message: data.message, isError: true });
        }
    } catch (err) {
        setDialog({ isOpen: true, title: "System Error", message: "Connection failed.", isError: true });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        @keyframes spin { to { transform: rotate(360deg); } }
        
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        
        @keyframes popIn { 
          from { opacity: 0; transform: scale(0.9); } 
          to { opacity: 1; transform: scale(1); } 
        }
        
        .fp-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
          padding: 20px;
        }
        
        .fp-card {
          background: white;
          padding: 50px 45px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.15);
          max-width: 500px;
          width: 100%;
          animation: fadeIn 0.6s ease-out;
          border: 1px solid #e0f2fe;
        }

        .fp-heading { 
          font-size: 32px; 
          font-weight: 700; 
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px; 
          text-align: center; 
        }
        
        .fp-subheading { 
          font-size: 15px; 
          color: #64748b; 
          margin-bottom: 30px; 
          text-align: center; 
          line-height: 1.5; 
        }
        
        .input-group { margin-bottom: 20px; }
        
        .input-label { 
          display: block; 
          font-size: 14px; 
          font-weight: 600; 
          color: #475569; 
          margin-bottom: 8px; 
        }
        
        .input-wrapper { position: relative; }
        
        .input-icon { 
          position: absolute; 
          left: 18px; 
          top: 50%; 
          transform: translateY(-50%); 
          font-size: 20px; 
          color: #94a3b8; 
        }
        
        .form-input {
          width: 100%; 
          padding: 15px 18px 15px 52px; 
          font-size: 15px;
          border: 2px solid #e2e8f0; 
          border-radius: 12px; 
          outline: none; 
          transition: all 0.2s;
          background: #f8fafc;
          color: #1e293b;
        }
        
        .form-input:focus { 
          border-color: #3b82f6; 
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          background: #ffffff;
        }
        
        .primary-button {
          width: 100%; 
          padding: 16px; 
          font-size: 16px; 
          font-weight: 600; 
          color: white;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          border: none; 
          border-radius: 12px; 
          cursor: pointer; 
          transition: all 0.3s;
          display: flex; 
          justify-content: center; 
          align-items: center; 
          gap: 10px; 
          margin-top: 10px;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
        }
        
        .primary-button:hover:not(:disabled) { 
          transform: translateY(-2px); 
          box-shadow: 0 12px 32px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
        }
        
        .primary-button:disabled { 
          opacity: 0.7; 
          cursor: not-allowed; 
        }

        .back-link {
          text-align: center; 
          margin-top: 20px; 
          display: block; 
          color: #3b82f6; 
          text-decoration: none; 
          font-weight: 500; 
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .back-link:hover { 
          color: #1e40af;
        }
        
        .spinner { 
          width: 20px; 
          height: 20px; 
          border: 3px solid rgba(255, 255, 255, 0.3); 
          border-top-color: white; 
          border-radius: 50%; 
          animation: spin 0.8s linear infinite; 
        }

        /* Dialog Styles */
        .modal-overlay { 
          position: fixed; 
          top: 0; 
          left: 0; 
          right: 0; 
          bottom: 0; 
          background: rgba(30, 64, 175, 0.15); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 1000; 
          backdrop-filter: blur(8px);
          animation: fadeIn 0.2s ease-out;
        }
        
        .modal-content { 
          background: white; 
          padding: 30px; 
          border-radius: 16px; 
          width: 90%; 
          max-width: 400px; 
          text-align: center; 
          animation: popIn 0.3s;
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25);
          border: 1px solid #e0f2fe;
        }
        
        .modal-icon { 
          font-size: 48px; 
          margin-bottom: 15px; 
          display: block; 
        }
        
        .modal-title { 
          font-size: 20px; 
          font-weight: 700; 
          color: #1e293b; 
          margin-bottom: 10px; 
        }
        
        .modal-message { 
          font-size: 15px; 
          color: #64748b; 
          margin-bottom: 25px; 
          line-height: 1.5; 
          white-space: pre-line; 
        }
        
        .modal-button { 
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
          color: white; 
          border: none; 
          padding: 12px 24px; 
          border-radius: 10px; 
          font-weight: 600; 
          cursor: pointer; 
          width: 100%;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }
        
        .modal-button:hover { 
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        /* Responsive Styles */
        @media (max-width: 640px) {
          .fp-card {
            padding: 35px 25px;
            border-radius: 16px;
          }

          .fp-heading {
            font-size: 26px;
          }

          .fp-subheading {
            font-size: 14px;
            margin-bottom: 25px;
          }

          .input-group {
            margin-bottom: 18px;
          }

          .form-input {
            padding: 13px 15px 13px 48px;
            font-size: 14px;
          }

          .input-icon {
            left: 15px;
            font-size: 18px;
          }

          .primary-button {
            padding: 14px;
            font-size: 15px;
          }
        }

        @media (max-width: 400px) {
          .fp-card {
            padding: 30px 20px;
          }

          .fp-heading {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="fp-container">
        <div className="fp-card">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
             <CompanyLogo />
          </div>

          {step === 1 && (
            <>
              <h2 className="fp-heading">Forgot Password?</h2>
              <p className="fp-subheading">Enter your email address to receive a verification OTP.</p>
              <form onSubmit={handleSendOtp}>
                <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <div className="input-wrapper">
                        <span className="input-icon">✉︎</span>
                        <input type="email" placeholder="Enter your email" className="form-input"
                            value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                    </div>
                </div>
                <button type="submit" disabled={isLoading} className="primary-button">
                    {isLoading ? <div className="spinner"></div> : "Send OTP"}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="fp-heading">Verify OTP</h2>
              <p className="fp-subheading">We sent a code to <b>{form.email}</b>.<br/>Enter it below.</p>
              <form onSubmit={handleVerifyOtp}>
                <div className="input-group">
                    <label className="input-label">Enter OTP</label>
                    <div className="input-wrapper">
                        <span className="input-icon">#︎</span>
                        <input type="text" placeholder="6-digit code" className="form-input" maxLength={6}
                            value={form.otp} onChange={(e) => setForm({...form, otp: e.target.value})} />
                    </div>
                </div>
                <button type="submit" disabled={isLoading} className="primary-button">
                    {isLoading ? <div className="spinner"></div> : "Verify & Proceed"}
                </button>
              </form>
            </>
          )}

          {step === 3 && (
             <>
              <h2 className="fp-heading">Reset Password</h2>
              <p className="fp-subheading">Create a strong new password for your account.</p>
              <form onSubmit={handleResetPassword}>
                <div className="input-group">
                    <label className="input-label">New Password</label>
                    <div className="input-wrapper">
                        <span className="input-icon">🔒︎</span>
                        <input type="password" placeholder="New password" className="form-input"
                            value={form.newPassword} onChange={(e) => setForm({...form, newPassword: e.target.value})} />
                    </div>
                </div>
                <div className="input-group">
                    <label className="input-label">Confirm Password</label>
                    <div className="input-wrapper">
                        <span className="input-icon">🔑︎</span>
                        <input type="password" placeholder="Confirm new password" className="form-input"
                            value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} />
                    </div>
                </div>
                <button type="submit" disabled={isLoading} className="primary-button">
                    {isLoading ? <div className="spinner"></div> : "Reset Password"}
                </button>
              </form>
             </>
          )}

          <div onClick={() => router.push("/")} className="back-link">
            Back to Login
          </div>

        </div>
      </div>

      {dialog.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">{dialog.isError ? "⚠︎" : "✓"}</span>
            <h3 className="modal-title">{dialog.title}</h3>
            <p className="modal-message">{dialog.message}</p>
            <button className="modal-button" onClick={closeDialog}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default ForgotPassword;