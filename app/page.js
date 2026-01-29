'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CompanyLogo from "../components/companyLogo";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    let errorMsg = "";

    if (!form.email.trim()) {
      errorMsg = "Email is required.";
    } else if (!form.email.includes("@")) {
      errorMsg = "Please enter a valid email address.";
    } 
    else if (!form.password) {
      errorMsg = "Password is required.";
    } else if (form.password.length < 6) {
      errorMsg = "Password must be at least 6 characters long.";
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
      if (!passwordRegex.test(form.password)) {
        errorMsg = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
      }
    }

    if (errorMsg) {
      setDialog({
        isOpen: true,
        title: "Validation Error",
        message: errorMsg,
        isError: true
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/authentication/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.token) {
          sessionStorage.setItem("userToken", data.token);
        }
        if (data.expiry) {
          sessionStorage.setItem("userTokenExpiry", data.expiry);
        }

        const userRole = data.user?.role;
        const userId = data.user?.userId;

        if (userRole === "admin") {
            router.push(`/adminDashboard?userId=${userId}`);
        } else if (userRole === "user") {
            router.push(`/userDashboard?userId=${userId}`);
        } else {
            router.push("/404");
        }

      } else {
        setDialog({
          isOpen: true,
          title: "Login Failed",
          message: data.message || "Login failed. Please try again.",
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
        
        .login-container {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 45% 55%;
          background: #ffffff;
        }
        
        .left-panel {
          background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%);
          padding: 45px 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-right: 1px solid #e0f2fe;
        }
        
        .left-content-wrapper {
          max-width: 500px;
          text-align: center;
        }
        
        .logo-container {
          margin-bottom: 50px;
          animation: fadeIn 0.6s ease-out;
          background: #ffffff;
          padding: 30px;
          border-radius: 16px;
          border: 2px solid #bfdbfe;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 100%;
          min-height: 140px;
        }
        
        .logo-container img {
          max-width: 180px;
          max-height: 100px;
          width: auto;
          height: auto;
          object-fit: contain;
        }
        
        .company-name {
          font-size: 42px;
          font-weight: 800;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
          animation: fadeIn 0.8s ease-out 0.2s both;
        }
        
        .company-tagline {
          font-size: 20px;
          font-weight: 600;
          color: #3b82f6;
          margin-bottom: 30px;
          animation: fadeIn 0.8s ease-out 0.3s both;
        }
        
        .company-description {
          font-size: 16px;
          line-height: 1.8;
          color: #64748b;
          margin-bottom: 40px;
          animation: fadeIn 0.8s ease-out 0.4s both;
        }
        
        .system-note {
          font-size: 14px;
          font-style: italic;
          color: #94a3b8;
          padding-top: 30px;
          border-top: 1px solid #e0f2fe;
          animation: fadeIn 0.8s ease-out 0.5s both;
        }
        
        .right-panel {
          padding: 45px 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
        }
        
        .form-container {
          max-width: 480px;
          width: 100%;
          background: white;
          padding: 50px 45px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.15);
          margin: 0 auto;
          border: 1px solid #e0f2fe;
        }
        
        .form-heading {
          font-size: 38px;
          font-weight: 700;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }
        
        .form-subheading {
          font-size: 16px;
          color: #64748b;
          margin-bottom: 40px;
          line-height: 1.5;
        }
        
        .input-group {
          margin-bottom: 24px;
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
        
        .form-input {
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
        }
        
        .form-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          background: #ffffff;
        }
        
        .form-input::placeholder {
          color: #cbd5e1;
        }
        
        .primary-button {
          width: 100%;
          padding: 16px 24px;
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
          margin-bottom: 32px;
          margin-left: 0px;
          letter-spacing: 0.3px;
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
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        .link-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 28px;
          border-top: 1px solid #e2e8f0;
          margin-left: 0px;
        }
        
        .link-button {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 14px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          padding: 8px 12px;
          border-radius: 8px;
        }
        
        .link-button:hover {
          color: #1e40af;
          background: #f0f9ff;
        }
        
        .footer-right {
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
        @media (max-width: 1024px) {
          .login-container {
            grid-template-columns: 1fr;
          }

          .left-panel {
            display: none;
          }

          .right-panel {
            padding: 30px 20px;
          }

          .form-container {
            padding: 40px 30px;
          }

          .form-heading {
            font-size: 32px;
          }
        }

        @media (max-width: 640px) {
          .right-panel {
            padding: 20px 15px;
            min-height: 100vh;
          }

          .form-container {
            padding: 30px 20px;
            border-radius: 16px;
          }

          .form-heading {
            font-size: 28px;
          }

          .form-subheading {
            font-size: 14px;
            margin-bottom: 30px;
          }

          .input-group {
            margin-bottom: 20px;
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
            padding: 14px 20px;
            font-size: 15px;
          }

          .link-container {
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
          }

          .link-button {
            width: 100%;
            text-align: center;
          }

          .footer-right {
            font-size: 12px;
            margin-top: 25px;
          }
        }

        @media (max-width: 400px) {
          .form-heading {
            font-size: 24px;
          }

          .form-container {
            padding: 25px 15px;
          }
        }
      `}</style>
      
      <div className="login-container">
        <div className="left-panel">
          <div className="left-content-wrapper">
            <div className="logo-container">
              <CompanyLogo />
            </div>
            
            <h1 className="company-name">Welcome to City Lion Express Tours</h1>
            <p className="company-tagline">Your Trusted Ride, Every Time</p>
            
            <p className="company-description">
              We are a reliable and customer-focused travel service provider, 
              specializing in efficient and comfortable city and intercity transportation. We offer a 
              modern fleet of vehicles, professional drivers, and tailored travel solutions to meet
              both corporate and leisure needs. Our mission is to deliver safe, punctual, and high 
              quality travel experience while continuously innovating to exceed customer expectations.
            </p>
            
            <p className="system-note">
              This system is designed to manage all our business operations efficiently
            </p>
          </div>
        </div>

        <div className="right-panel">
          <div className="form-container">
            <h2 className="form-heading">Login</h2>
            <p className="form-subheading">Enter your credentials to access your account</p>

            <div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉︎</span>
                  <input
                    type="email"
                    placeholder="Enter your email"
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
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <button
                  onClick={() => router.push("/forgetPassword")}
                  className="link-button"
                  style={{ padding: '4px 8px' }}
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <div className="link-container">
              <button
                onClick={() => router.push("/register")}
                className="link-button"
              >
                Create new user account
              </button>
              
              <button
                onClick={() => router.push("/adminRegister")}
                className="link-button"
              >
                Create new admin account
              </button>
            </div>

            <p className="footer-right">
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

export default Login;