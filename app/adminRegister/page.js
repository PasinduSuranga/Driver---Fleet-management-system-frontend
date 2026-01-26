'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";

function adminRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  
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
  };

  const validate = () => {
    let errorMessages = [];

    if (!form.name.trim()) {
      errorMessages.push("• Name is required");
    } else if (form.name.length > 250) {
      errorMessages.push("• Name cannot exceed 250 characters");
    }

    if (!form.email.trim()) {
      errorMessages.push("• Email address is required");
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errorMessages.push("• Please enter a valid email address");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!form.password) {
      errorMessages.push("• Password is required");
    } else if (form.password.length < 6) {
      errorMessages.push("• Password must be at least 6 characters long");
    } else if (!passwordRegex.test(form.password)) {
      errorMessages.push("• Password must contain at least a uppercase letter, a lowercase letter, a number, and a special character");
    }

    if (errorMessages.length > 0) {
      setDialog({
        isOpen: true,
        title: "Validation Error",
        message: errorMessages.join("\n"),
        isError: true
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (form.password !== confirmPassword) {
      setDialog({
        isOpen: true,
        title: "Password Mismatch",
        message: "The passwords you entered do not match. Please re-type them.",
        isError: true
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/authentication/adminRegister",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();

      if (res.ok) {
        setDialog({
            isOpen: true,
            title: "Admin Registration Successful",
            message: data.message || "Admin Registration successful! Waiting for admin's approval.",
            isError: false
        });
        setForm({ name: "", email: "", password: "" });
        setConfirmPassword("");
      } else {
        setDialog({
          isOpen: true,
          title: "Admin Registration Failed",
          message: data.message || "An error occurred during registration.",
          isError: true
        });
      }
    } catch (error) {
      setDialog({
        isOpen: true,
        title: "System Error",
        message: "Something went wrong. Please check your connection and try again.",
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .register-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
          padding: 40px 20px;
        }
        
        .register-card {
          background: white;
          padding: 50px 45px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.15);
          max-width: 500px;
          width: 100%;
          animation: fadeIn 0.6s ease-out;
          border: 1px solid #e0f2fe;
        }
        
        .register-heading {
          font-size: 38px;
          font-weight: 700;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
          text-align: center;
        }
        
        .register-subheading {
          font-size: 16px;
          color: #64748b;
          margin-bottom: 40px;
          line-height: 1.5;
          text-align: center;
        }
        
        .input-group {
          margin-bottom: 20px;
        }
        
        .input-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 10px;
          letter-spacing: 0.2px;
        }
        
        .input-wrapper {
          position: relative;
        }
        
        .input-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          color: #94a3b8;
          pointer-events: none;
        }
        
        .form-input,
        .form-select {
          width: 100%;
          padding: 15px 18px 15px 52px;
          font-size: 15px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
          background: #f8fafc;
          color: #1e293b;
          box-sizing: border-box;
        }
        
        .form-input:focus,
        .form-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          background: #ffffff;
        }
        
        .form-input::placeholder {
          color: #cbd5e1;
        }
        
        .error-text {
          color: #dc2626;
          font-size: 13px;
          margin-top: 6px;
          margin-bottom: 0;
          display: block;
          min-height: 18px;
        }

        .password-hint {
          font-size: 12px;
          color: #64748b;
          margin-top: 6px;
          line-height: 1.4;
        }
        
        .success-message {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1px solid #bfdbfe;
          color: #1e40af;
          padding: 14px 16px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 24px;
          text-align: center;
          animation: fadeIn 0.3s ease-out;
        }
        
        .primary-button {
          width: 100%;
          padding: 16px 18px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
          margin-bottom: 16px;
          margin-left: 0px;
          letter-spacing: 0.3px;
          box-sizing: border-box;
        }
        
        .primary-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
        }
        
        .primary-button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .primary-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        
        .secondary-button {
          width: 100%;
          padding: 14px 18px;
          font-size: 15px;
          font-weight: 500;
          color: #3b82f6;
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-left: 0px;
          box-sizing: border-box;
        }
        
        .secondary-button:hover {
          background: #f0f9ff;
          border-color: #2563eb;
          color: #2563eb;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        .footer-text {
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
          margin-top: 30px;
        }

        /* --- Dialog / Modal Styles --- */
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
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25);
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }

        .modal-button:hover {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        /* Mobile Responsive Styles */
        @media (max-width: 640px) {
          .register-container {
            padding: 20px 15px;
          }

          .register-card {
            padding: 35px 25px;
            border-radius: 16px;
          }

          .register-heading {
            font-size: 28px;
          }

          .register-subheading {
            font-size: 14px;
            margin-bottom: 30px;
          }

          .input-group {
            margin-bottom: 18px;
          }

          .input-label {
            font-size: 13px;
            margin-bottom: 8px;
          }

          .form-input,
          .form-select {
            padding: 13px 15px 13px 48px;
            font-size: 14px;
          }

          .input-icon {
            left: 15px;
            font-size: 18px;
          }

          .error-text {
            font-size: 12px;
            min-height: 16px;
          }

          .success-message {
            font-size: 13px;
            padding: 12px 14px;
          }

          .primary-button {
            padding: 14px 16px;
            font-size: 15px;
            margin-top: 8px;
            margin-bottom: 14px;
          }

          .secondary-button {
            padding: 13px 16px;
            font-size: 14px;
          }

          .footer-text {
            font-size: 12px;
            margin-top: 25px;
          }
        }

        @media (max-width: 400px) {
          .register-card {
            padding: 30px 20px;
          }

          .register-heading {
            font-size: 24px;
          }

          .register-subheading {
            font-size: 13px;
          }
        }
      `}</style>
      
      <div className="register-container">
        <div className="register-card">
          <h2 className="register-heading">Create Admin Account</h2>
          <p className="register-subheading">Register to access the driver & vehicle management system</p>

          <div>
            <div className="input-group">
              <label className="input-label">Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤︎</span>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-input"
                  maxLength={250}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉︎</span>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒︎</span>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="form-input"
                />
              </div>
              <p className="password-hint">
                Must be at least 6 characters, contain uppercase (A-Z), lowercase (a-z), numbers (0-9), and special characters (@, #, etc.).
              </p>
            </div>

            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔑︎</span>
                <input
                  type="password"
                  placeholder="Re-type your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="primary-button"
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>

            <button
              onClick={() => router.push("/")}
              className="secondary-button"
            >
              Back to Login
            </button>

            <p className="footer-text">
            &copy; {new Date().getFullYear()} City Lion Express Tours. All rights reserved.
          </p>
          </div>
        </div>
      </div>

      {dialog.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">
              {dialog.isError ? "⚠︎" : "ℹ︎"}
            </span>
            <h3 className="modal-title">{dialog.title}</h3>
            <p className="modal-message">{dialog.message}</p>
            <button className="modal-button" onClick={closeDialog}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default adminRegister;