'use client';

import React, { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Header from "../../components/userHeader";

const API_BASE_URL = "http://localhost:5000";

const initialFormData = {
  driverName: "",
  contactNumber: "",
  licenseNumber: "",
  licenseExpiry: "",
  licenseFrontPhoto: null,
  licenseBackPhoto: null,
};

const initialPreviews = {
  licenseFrontPhoto: "",
  licenseBackPhoto: "",
};

export default function AddDriverPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [formData, setFormData] = useState(initialFormData);
  const [previews, setPreviews] = useState(initialPreviews);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    list: [],
  });

  const topRef = useRef(null);

  const closeDialog = () => {
    const wasSuccess = dialog.type === "success";
    setDialog({ ...dialog, isOpen: false });
    if (wasSuccess) window.location.reload();
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      if (!file || !file.type.startsWith("image/")) {
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: file }));
      setErrors((prev) => ({ ...prev, [name]: "" }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRemoveImage = (field) => {
    setFormData((prev) => ({ ...prev, [field]: null }));
    setPreviews((prev) => ({ ...prev, [field]: "" }));
    const fileInput = document.querySelector(`input[name="${field}"]`);
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrorsObj = {};
    const validationErrorsList = [];

    if (!formData.driverName.trim()) {
      validationErrorsObj.driverName = "Required";
      validationErrorsList.push("Driver Name is required");
    } else if (formData.driverName.trim().length > 250) {
      validationErrorsObj.driverName = "Max 250 characters";
      validationErrorsList.push("Driver Name: max 250 characters");
    }

    if (!formData.contactNumber) {
      validationErrorsObj.contactNumber = "Required";
      validationErrorsList.push("Contact Number is required");
    } else {
      const contact = formData.contactNumber.trim();
      const startsWith0 = contact.startsWith("0");
      const startsWithPlus94 = contact.startsWith("+94");

      const regex0 = /^0\d{9}$/;
      const regexPlus94 = /^\+94\d{9}$/;

      if (startsWith0) {
        if (!regex0.test(contact)) {
          validationErrorsObj.contactNumber = "Invalid format";
          validationErrorsList.push("Contact Number: if starts with 0, it must be exactly 10 digits (0xxxxxxxxx)");
        }
      } else if (startsWithPlus94) {
        if (!regexPlus94.test(contact)) {
          validationErrorsObj.contactNumber = "Invalid format";
          validationErrorsList.push("Contact Number: if starts with +94, it must be exactly 12 characters (+94xxxxxxxxx)");
        }
      } else {
        validationErrorsObj.contactNumber = "Invalid format";
        validationErrorsList.push("Contact Number must start with 0 or +94");
      }
    }

    if (!formData.licenseNumber.trim()) {
      validationErrorsObj.licenseNumber = "Required";
      validationErrorsList.push("License Number is required");
    } else if (formData.licenseNumber.trim().length !== 8) {
      validationErrorsObj.licenseNumber = "Must be exactly 8 characters";
      validationErrorsList.push("License Number must be exactly 8 characters");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.licenseExpiry) {
      validationErrorsObj.licenseExpiry = "Required";
      validationErrorsList.push("License Expiry Date is required");
    } else {
      const exp = new Date(formData.licenseExpiry);
      exp.setHours(0, 0, 0, 0);

      if (isNaN(exp.getTime())) {
        validationErrorsObj.licenseExpiry = "Invalid Date";
        validationErrorsList.push("License Expiry Date is invalid");
      } else if (exp <= today) {
        validationErrorsObj.licenseExpiry = "Expired";
        validationErrorsList.push("License Expiry must be a future date (not expired)");
      }
    }

    if (!formData.licenseFrontPhoto) {
      validationErrorsObj.licenseFrontPhoto = "Required";
      validationErrorsList.push("Driving License Front Photo is required");
    }
    if (!formData.licenseBackPhoto) {
      validationErrorsObj.licenseBackPhoto = "Required";
      validationErrorsList.push("Driving License Back Photo is required");
    }

    if (validationErrorsList.length > 0) {
      setErrors(validationErrorsObj);
      setDialog({
        isOpen: true,
        type: "error",
        title: "Validation Error",
        message: "Please fix the following issues:",
        list: validationErrorsList,
      });
      return;
    }

    const data = new FormData();
    data.append("driverName", formData.driverName.trim());
    data.append("contactNumber", formData.contactNumber.trim());
    data.append("licenseNumber", formData.licenseNumber.trim());
    data.append("licenseExpiry", formData.licenseExpiry);
    data.append("licenseFrontPhoto", formData.licenseFrontPhoto);
    data.append("licenseBackPhoto", formData.licenseBackPhoto);

    if (userId) data.append("userId", userId);

    try {
      setIsSubmitting(true);
      await axios.post(`${API_BASE_URL}/driver/add`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDialog({
        isOpen: true,
        type: "success",
        title: "Success",
        message: "Driver successfully registered!",
        list: [],
      });
    } catch (err) {
      setDialog({
        isOpen: true,
        type: "error",
        title: "Submission Error",
        message: err.response?.data?.message || "Error adding driver.",
        list: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .add-driver-page {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
          min-height: 100vh;
          padding: 120px 20px 60px;
          font-family: 'Inter', sans-serif;
        }

        .form-container {
          max-width: 780px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 24px;
          padding: 48px 48px 40px;
          box-shadow: 0 4px 6px rgba(59,130,246,0.06), 0 20px 60px rgba(59,130,246,0.12), 0 0 0 1px rgba(191,219,254,0.6);
          animation: fadeIn 0.5s ease both;
        }

        .form-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 36px;
          padding-bottom: 24px;
          border-bottom: 1.5px solid #e2e8f0;
        }

        .form-header-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(59,130,246,0.35);
        }

        .form-header-icon svg {
          width: 26px;
          height: 26px;
          stroke: #ffffff;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .form-title {
          font-size: 26px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: -0.5px;
        }

        .form-subtitle {
          font-size: 13.5px;
          color: #64748b;
          margin-top: 3px;
          font-weight: 400;
        }

        .section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #3b82f6;
          margin-bottom: 18px;
          margin-top: 28px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, #bfdbfe, transparent);
        }

        .grid-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
          animation: slideIn 0.4s ease both;
        }

        .full-width {
          grid-column: span 2;
        }

        .input-label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .input-label svg {
          width: 15px;
          height: 15px;
          stroke: #94a3b8;
          fill: none;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex-shrink: 0;
        }

        .form-input {
          width: 100%;
          padding: 11px 14px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: #1e293b;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .form-input::placeholder {
          color: #94a3b8;
        }

        .form-input:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 3.5px rgba(59,130,246,0.12);
        }

        .form-input:hover:not(:focus) {
          border-color: #cbd5e1;
          background: #f1f5f9;
        }

        .error-text {
          font-size: 12px;
          color: #ef4444;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .error-text::before {
          content: '';
          display: inline-block;
          width: 5px;
          height: 5px;
          background: #ef4444;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* File Upload */
        .file-upload-area {
          position: relative;
          border: 1.5px dashed #bfdbfe;
          border-radius: 12px;
          padding: 28px 20px;
          background: #f0f9ff;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }

        .file-upload-area:hover {
          border-color: #3b82f6;
          background: #dbeafe;
        }

        .file-upload-area input[type="file"] {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .file-upload-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }

        .file-upload-icon svg {
          width: 36px;
          height: 36px;
          stroke: #3b82f6;
          fill: none;
          stroke-width: 1.4;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .file-upload-text {
          font-size: 13.5px;
          color: #475569;
          font-weight: 500;
        }

        .file-upload-text span {
          color: #3b82f6;
          font-weight: 600;
        }

        .file-upload-hint {
          font-size: 11.5px;
          color: #94a3b8;
          margin-top: 4px;
        }

        /* Preview */
        .preview-wrapper {
          margin-top: 14px;
          border-radius: 12px;
          overflow: hidden;
          border: 1.5px solid #bfdbfe;
          background: #f8fafc;
          position: relative;
        }

        .preview-image {
          width: 100%;
          max-height: 180px;
          object-fit: cover;
          display: block;
        }

        .remove-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(30, 41, 59, 0.78);
          color: #ffffff;
          border: none;
          border-radius: 7px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: background 0.2s;
          backdrop-filter: blur(4px);
        }

        .remove-btn:hover {
          background: rgba(239, 68, 68, 0.88);
        }

        .remove-btn svg {
          width: 13px;
          height: 13px;
          stroke: #ffffff;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
        }

        /* Buttons */
        .button-row {
          display: flex;
          gap: 14px;
          margin-top: 36px;
        }

        .submit-button {
          flex: 1;
          padding: 13px 28px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          color: #ffffff;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: 0.2px;
        }

        .submit-button:hover:not(:disabled) {
          opacity: 0.93;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.42);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .back-button {
          padding: 13px 28px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          color: #475569;
          background: #f1f5f9;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          letter-spacing: 0.2px;
        }

        .back-button:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .back-button svg {
          width: 16px;
          height: 16px;
          stroke: #475569;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* Spinner */
        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: #ffffff;
          border-radius: 20px;
          padding: 40px 36px 32px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 20px 60px rgba(15,23,42,0.25), 0 0 0 1px rgba(191,219,254,0.4);
          animation: modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
          text-align: center;
        }

        .modal-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
        }

        .modal-icon svg {
          width: 28px;
          height: 28px;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .modal-icon.success {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        }

        .modal-icon.success svg {
          stroke: #2563eb;
        }

        .modal-icon.error {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
        }

        .modal-icon.error svg {
          stroke: #ef4444;
        }

        .msg-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 10px;
          letter-spacing: -0.3px;
        }

        .modal-message {
          color: #64748b;
          font-size: 14.5px;
          line-height: 1.65;
        }

        .modal-list {
          text-align: left;
          margin-top: 16px;
          padding-left: 0;
          list-style: none;
        }

        .modal-list li {
          color: #3b82f6;
          font-size: 13.5px;
          line-height: 1.8;
          padding: 5px 10px;
          border-radius: 7px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .modal-list li::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          background: #3b82f6;
          border-radius: 50%;
          margin-top: 7px;
          flex-shrink: 0;
        }

        .modal-list li:nth-child(odd) {
          background: #f0f9ff;
        }

        .msg-btn {
          margin-top: 28px;
          padding: 11px 40px;
          font-size: 14.5px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          color: #ffffff;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
          transition: opacity 0.2s, transform 0.15s;
        }

        .msg-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .msg-btn.error-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 4px 14px rgba(239,68,68,0.3);
        }

        @media (max-width: 768px) {
          .add-driver-page { padding: 100px 15px 40px; }
          .form-container { padding: 28px 20px 24px; border-radius: 18px; }
          .grid-container { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
          .modal-content { padding: 30px 22px 26px; }
          .button-row { flex-direction: column; }
          .form-title { font-size: 21px; }
        }
      `}</style>

      <div className="add-driver-page" ref={topRef}>
        <Header userId={userId} />

        <div className="form-container">
          {/* Header */}
          <div className="form-header">
            <div className="form-header-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                <path d="M16 3.5c1.5.5 2.5 1.8 2.5 3.5S17.5 10 16 10.5"/>
              </svg>
            </div>
            <div>
              <div className="form-title">Add Driver</div>
              <div className="form-subtitle">Register a new driver to your fleet</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Personal Info Section */}
            <div className="section-label">Personal Information</div>

            <div className="grid-container">
              {/* Driver Name */}
              <div className="input-group">
                <label className="input-label">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  Driver Name
                </label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter driver name"
                />
                {errors.driverName && <p className="error-text">{errors.driverName}</p>}
              </div>

              {/* Contact Number */}
              <div className="input-group">
                <label className="input-label">
                  <svg viewBox="0 0 24 24">
                    <path d="M6.6 10.8a15.2 15.2 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/>
                  </svg>
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="0xxxxxxxxx or +94xxxxxxxxx"
                />
                {errors.contactNumber && <p className="error-text">{errors.contactNumber}</p>}
              </div>
            </div>

            {/* License Section */}
            <div className="section-label">License Details</div>

            <div className="grid-container">
              {/* License Number */}
              <div className="input-group">
                <label className="input-label">
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <circle cx="8" cy="12" r="2"/>
                    <path d="M12 9h6M12 12h4M12 15h5"/>
                  </svg>
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Exactly 8 characters"
                />
                {errors.licenseNumber && <p className="error-text">{errors.licenseNumber}</p>}
              </div>

              {/* License Expiry */}
              <div className="input-group">
                <label className="input-label">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
                  </svg>
                  License Expiry Date
                </label>
                <input
                  type="date"
                  name="licenseExpiry"
                  value={formData.licenseExpiry}
                  onChange={handleChange}
                  className="form-input"
                />
                {errors.licenseExpiry && <p className="error-text">{errors.licenseExpiry}</p>}
              </div>

              {/* Front Photo */}
              <div className="input-group full-width">
                <label className="input-label">
                  <svg viewBox="0 0 24 24">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Driving License — Front Photo
                </label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    name="licenseFrontPhoto"
                    onChange={handleChange}
                    accept="image/*"
                  />
                  <div className="file-upload-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <div className="file-upload-text"><span>Click to upload</span> or drag & drop</div>
                  <div className="file-upload-hint">PNG, JPG, JPEG, WEBP</div>
                </div>
                {previews.licenseFrontPhoto && (
                  <div className="preview-wrapper">
                    <img
                      src={previews.licenseFrontPhoto}
                      className="preview-image"
                      alt="Front Preview"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage("licenseFrontPhoto")}
                      className="remove-btn"
                    >
                      <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Remove
                    </button>
                  </div>
                )}
                {errors.licenseFrontPhoto && <p className="error-text">{errors.licenseFrontPhoto}</p>}
              </div>

              {/* Back Photo */}
              <div className="input-group full-width">
                <label className="input-label">
                  <svg viewBox="0 0 24 24">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Driving License — Back Photo
                </label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    name="licenseBackPhoto"
                    onChange={handleChange}
                    accept="image/*"
                  />
                  <div className="file-upload-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <div className="file-upload-text"><span>Click to upload</span> or drag & drop</div>
                  <div className="file-upload-hint">PNG, JPG, JPEG, WEBP</div>
                </div>
                {previews.licenseBackPhoto && (
                  <div className="preview-wrapper">
                    <img
                      src={previews.licenseBackPhoto}
                      className="preview-image"
                      alt="Back Preview"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage("licenseBackPhoto")}
                      className="remove-btn"
                    >
                      <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Remove
                    </button>
                  </div>
                )}
                {errors.licenseBackPhoto && <p className="error-text">{errors.licenseBackPhoto}</p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="button-row">
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div> Processing...
                  </>
                ) : (
                  <>
                    <svg style={{ width: 17, height: 17, stroke: '#fff', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }} viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12l7 7 7-7"/>
                    </svg>
                    Add Driver
                  </>
                )}
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() => router.push(`/driverDashboard?userId=${userId || ""}`)}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
            </div>
          </form>
        </div>

        {/* Dialog Modal */}
        {dialog.isOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className={`modal-icon ${dialog.type}`}>
                {dialog.type === "success" ? (
                  <svg viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                )}
              </div>

              <div className="msg-title">{dialog.title}</div>

              <p className="modal-message">{dialog.message}</p>

              {dialog.list && dialog.list.length > 0 && (
                <ul className="modal-list">
                  {dialog.list.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}

              <button
                className={`msg-btn ${dialog.type === "error" ? "error-btn" : ""}`}
                onClick={closeDialog}
              >
                {dialog.type === "error" ? "Close" : "OK"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}