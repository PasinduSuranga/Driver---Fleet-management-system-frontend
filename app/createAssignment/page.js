"use client";

import React, { useState, useRef, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/userHeader";

const API_BASE_URL = "http://localhost:5000/assignment";

const initialFormData = {
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  startLocation: "",
  endLocation: "",
  vehicle_number: "",
  driver_id: "",
};

function CreateAssignmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");
  const userId = searchParams.get("userId");

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [resourcesLoaded, setResourcesLoaded] = useState(false);

  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    list: [],
  });

  const topRef = useRef(null);

  useEffect(() => {
    if (!customerId) {
      setDialog({
        isOpen: true,
        type: "error",
        title: "Missing Customer",
        message: "No customer was selected. Please go back and select a customer.",
        list: [],
      });
    }
  }, [customerId]);

  const closeDialog = () => {
    const wasSuccess = dialog.type === "success";
    const wasMissingCustomer = dialog.title === "Missing Customer";
    setDialog({ ...dialog, isOpen: false });

    if (wasSuccess) {
      router.push(`/assignmentDashboard?userId=${userId || ""}`);
    } else if (wasMissingCustomer) {
      router.push(`/newAssaignment?userId=${userId || ""}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (["startDate", "startTime", "endDate", "endTime"].includes(name)) {
      setResourcesLoaded(false);
      setFormData((prev) => ({ ...prev, [name]: value, vehicle_number: "", driver_id: "" }));
    }
  };

  const checkAvailability = async () => {
    setErrors({});
    const validationErrorsObj = {};
    const validationErrorsList = [];

    if (!formData.startDate) { validationErrorsObj.startDate = "Required"; validationErrorsList.push("Start Date is required"); }
    if (!formData.startTime) { validationErrorsObj.startTime = "Required"; validationErrorsList.push("Start Time is required"); }
    if (!formData.endDate) { validationErrorsObj.endDate = "Required"; validationErrorsList.push("End Date is required"); }
    if (!formData.endTime) { validationErrorsObj.endTime = "Required"; validationErrorsList.push("End Time is required"); }

    if (validationErrorsList.length > 0) {
      setErrors(validationErrorsObj);
      setDialog({ isOpen: true, type: "error", title: "Validation Error", message: "Please fill in all time slots first:", list: validationErrorsList });
      return;
    }

    const est_s_TD = `${formData.startDate} ${formData.startTime}:00`;
    const est_e_TD = `${formData.endDate} ${formData.endTime}:00`;
    const startDt = new Date(est_s_TD);
    const endDt = new Date(est_e_TD);

    if (startDt >= endDt) {
      setErrors({ endTime: "Invalid", endDate: "Invalid" });
      setDialog({ isOpen: true, type: "error", title: "Invalid Time", message: "Estimated end time must be after the start time.", list: [] });
      return;
    }

    try {
      setIsChecking(true);
      const res = await fetch(`${API_BASE_URL}/api/assignments/available-resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ est_s_TD, est_e_TD }),
      });
      const data = await res.json();

      if (res.ok) {
        setAvailableVehicles(data.vehicles || []);
        setAvailableDrivers(data.drivers || []);
        setResourcesLoaded(true);

        if (data.vehicles.length === 0 || data.drivers.length === 0) {
          setDialog({ isOpen: true, type: "error", title: "No Resources", message: "There are no vehicles or drivers available for this specific time slot.", list: [] });
        }
      } else {
        setDialog({ isOpen: true, type: "error", title: "Error", message: data.error, list: [] });
      }
    } catch (err) {
      setDialog({ isOpen: true, type: "error", title: "Connection Error", message: "Failed to connect to the server.", list: [] });
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrorsObj = {};
    const validationErrorsList = [];

    if (!formData.startLocation.trim()) {
      validationErrorsObj.startLocation = "Required";
      validationErrorsList.push("Start Location is required");
    } else if (formData.startLocation.length > 100) {
      validationErrorsObj.startLocation = "Max 100 characters";
      validationErrorsList.push("Start Location max 100 characters");
    }

    if (!formData.endLocation.trim()) {
      validationErrorsObj.endLocation = "Required";
      validationErrorsList.push("End Location is required");
    } else if (formData.endLocation.length > 100) {
      validationErrorsObj.endLocation = "Max 100 characters";
      validationErrorsList.push("End Location max 100 characters");
    }

    if (!formData.vehicle_number) {
      validationErrorsObj.vehicle_number = "Required";
      validationErrorsList.push("Please select a vehicle");
    }

    if (!formData.driver_id) {
      validationErrorsObj.driver_id = "Required";
      validationErrorsList.push("Please select a driver");
    }

    if (validationErrorsList.length > 0) {
      setErrors(validationErrorsObj);
      setDialog({ isOpen: true, type: "error", title: "Validation Error", message: "Please fix the following issues:", list: validationErrorsList });
      return;
    }

    const est_s_TD = `${formData.startDate} ${formData.startTime}:00`;
    const est_e_TD = `${formData.endDate} ${formData.endTime}:00`;

    const payload = {
      customer_id: customerId,
      est_s_TD,
      est_e_TD,
      start_location: formData.startLocation.trim(),
      end_location: formData.endLocation.trim(),
      vehicle_number: formData.vehicle_number,
      driver_id: formData.driver_id,
    };

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/assignments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        setDialog({ isOpen: true, type: "success", title: "Success", message: "Assignment successfully created!", list: [] });
      } else {
        setDialog({ isOpen: true, type: "error", title: "Submission Error", message: data.error || "Error creating assignment.", list: [] });
      }
    } catch (err) {
      setDialog({ isOpen: true, type: "error", title: "Submission Error", message: "Server connection failed.", list: [] });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        @keyframes caFadeIn {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes caSlideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes caResourceIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Page ── */
        .ca-page {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
          min-height: 100vh;
          padding: 108px 24px 60px;
          font-family: 'Inter', sans-serif;
        }

        /* ── Form Card ── */
        .ca-card {
          max-width: 820px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 22px;
          padding: 44px 48px 40px;
          box-shadow:
            0 4px 6px rgba(59,130,246,0.06),
            0 20px 60px rgba(59,130,246,0.12),
            0 0 0 1px rgba(191,219,254,0.5);
          animation: caFadeIn 0.5s ease both;
        }

        /* ── Card Header ── */
        .ca-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 34px;
          padding-bottom: 24px;
          border-bottom: 1.5px solid #e2e8f0;
          justify-content: space-between;
        }

        .ca-header-icon {
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

        .ca-header-icon svg {
          width: 26px;
          height: 26px;
          stroke: #ffffff;
          fill: none;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .ca-title {
          font-size: 25px;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .ca-subtitle {
          font-size: 13px;
          color: #64748b;
          margin-top: 3px;
          font-weight: 400;
        }

        /* ── Section Divider ── */
        .ca-section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #3b82f6;
          margin-bottom: 18px;
          margin-top: 30px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .ca-section-label svg {
          width: 14px;
          height: 14px;
          stroke: #3b82f6;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex-shrink: 0;
        }

        .ca-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, #bfdbfe, transparent);
        }

        /* ── Grid ── */
        .ca-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* ── Input Group ── */
        .ca-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          animation: caSlideIn 0.4s ease both;
        }

        .ca-label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .ca-label svg {
          width: 14px;
          height: 14px;
          stroke: #94a3b8;
          fill: none;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex-shrink: 0;
        }

        .ca-input {
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
          appearance: auto;
        }

        .ca-input::placeholder { color: #94a3b8; }

        .ca-input:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 3.5px rgba(59,130,246,0.12);
        }

        .ca-input:hover:not(:focus) {
          border-color: #cbd5e1;
          background: #f1f5f9;
        }

        .ca-error {
          font-size: 12px;
          color: #ef4444;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .ca-error::before {
          content: '';
          display: inline-block;
          width: 5px;
          height: 5px;
          background: #ef4444;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ── Button Row ── */
        .ca-btn-row {
          display: flex;
          gap: 13px;
          margin-top: 24px;
          flex-wrap: wrap;
        }

        /* Check Availability */
        .ca-check-btn {
          flex: 1;
          padding: 12px 22px;
          font-size: 14.5px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          color: #1e293b;
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          min-width: 180px;
        }

        .ca-check-btn:hover:not(:disabled) {
          background: #e2e8f0;
          border-color: #94a3b8;
          transform: translateY(-1px);
        }

        .ca-check-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .ca-check-btn svg {
          width: 16px;
          height: 16px;
          stroke: #475569;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* Submit */
        .ca-submit-btn {
          flex: 1;
          padding: 13px 24px;
          font-size: 15px;
          font-weight: 700;
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
          letter-spacing: 0.1px;
        }

        .ca-submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.42);
        }

        .ca-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .ca-submit-btn svg {
          width: 16px;
          height: 16px;
          stroke: #ffffff;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* Back */
        .ca-back-btn {
          padding: 13px 22px;
          font-size: 14.5px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          color: #475569;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }

        .ca-back-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .ca-back-btn svg {
          width: 16px;
          height: 16px;
          stroke: #475569;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* ── Spinners ── */
        .ca-spinner {
          width: 17px;
          height: 17px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        .ca-spinner-dark {
          border-color: rgba(30,41,59,0.18);
          border-top-color: #475569;
        }

        /* ── Resources Panel ── */
        .ca-resources-panel {
          animation: caResourceIn 0.45s ease both;
        }

        /* Availability badge */
        .ca-avail-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: #16a34a;
          font-weight: 600;
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          border: 1px solid #6ee7b7;
          border-radius: 8px;
          padding: 7px 14px;
          margin-bottom: 4px;
          width: fit-content;
        }

        .ca-avail-info svg {
          width: 14px;
          height: 14px;
          stroke: #16a34a;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          backdrop-filter: blur(5px);
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
          font-family: 'Inter', sans-serif;
        }

        .modal-icon {
          width: 62px;
          height: 62px;
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

        .modal-icon.success { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
        .modal-icon.success svg { stroke: #2563eb; }
        .modal-icon.error { background: linear-gradient(135deg, #fee2e2, #fecaca); }
        .modal-icon.error svg { stroke: #ef4444; }

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

        .modal-list li:nth-child(odd) { background: #f0f9ff; }

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
          width: 100%;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
          transition: opacity 0.2s, transform 0.15s;
        }

        .msg-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .msg-btn.error-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 4px 14px rgba(239,68,68,0.3);
        }

        @media (max-width: 820px) {
          .ca-page { padding: 100px 15px 40px; }
          .ca-card { padding: 28px 22px 24px; border-radius: 18px; }
          .ca-grid { grid-template-columns: 1fr; }
          .ca-title { font-size: 20px; }
          .ca-btn-row { flex-direction: column; }
          .ca-check-btn, .ca-submit-btn, .ca-back-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      <Header userId={userId} />

      <div className="ca-page" ref={topRef}>
        <div className="ca-card">

          {/* ── Card Header ── */}
          <div className="ca-header">
            <div className="ca-header-icon">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <line x1="12" y1="14" x2="12" y2="18"/>
                <line x1="10" y1="16" x2="14" y2="16"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="ca-title">Create Assignment</div>
              <div className="ca-subtitle">Schedule a vehicle and driver for the selected customer</div>
            </div>
            <button
              type="button"
              className="ca-back-btn"
              onClick={() => router.push(`/newAssaignment?userId=${userId || ""}`)}
            >
              <svg viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            {/* ── Section 1: Time Slot ── */}
            <div className="ca-section-label">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Time Slot Configuration
            </div>

            <div className="ca-grid">
              <div className="ca-field">
                <label className="ca-label">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Estimated Start Date
                </label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="ca-input" />
                {errors.startDate && <p className="ca-error">{errors.startDate}</p>}
              </div>

              <div className="ca-field">
                <label className="ca-label">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Estimated Start Time
                </label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="ca-input" />
                {errors.startTime && <p className="ca-error">{errors.startTime}</p>}
              </div>

              <div className="ca-field">
                <label className="ca-label">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Estimated End Date
                </label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="ca-input" />
                {errors.endDate && <p className="ca-error">{errors.endDate}</p>}
              </div>

              <div className="ca-field">
                <label className="ca-label">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Estimated End Time
                </label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="ca-input" />
                {errors.endTime && <p className="ca-error">{errors.endTime}</p>}
              </div>
            </div>

            {/* Check Availability Button */}
            <div className="ca-btn-row" style={{ marginTop: '20px' }}>
              <button type="button" onClick={checkAvailability} className="ca-check-btn" disabled={isChecking}>
                {isChecking ? (
                  <>
                    <div className="ca-spinner ca-spinner-dark" />
                    Checking...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Check Availability
                  </>
                )}
              </button>
            </div>

            {/* ── Section 2: Resources & Locations ── */}
            {resourcesLoaded && (
              <div className="ca-resources-panel">
                <div className="ca-section-label">
                  <svg viewBox="0 0 24 24">
                    <rect x="1" y="3" width="15" height="13" rx="1"/>
                    <path d="M16 8h4l3 3v5h-7V8z"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  Trip Details & Resources
                </div>

                {/* Availability indicator */}
                <div className="ca-avail-info">
                  <svg viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  {availableVehicles.length} vehicle{availableVehicles.length !== 1 ? 's' : ''} &amp; {availableDrivers.length} driver{availableDrivers.length !== 1 ? 's' : ''} available for this slot
                </div>

                <div className="ca-grid" style={{ marginTop: '18px' }}>

                  {/* Start Location */}
                  <div className="ca-field">
                    <label className="ca-label">
                      <svg viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      Start Location
                    </label>
                    <input type="text" name="startLocation" value={formData.startLocation} onChange={handleChange} className="ca-input" placeholder="Enter pickup point" />
                    {errors.startLocation && <p className="ca-error">{errors.startLocation}</p>}
                  </div>

                  {/* End Location */}
                  <div className="ca-field">
                    <label className="ca-label">
                      <svg viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      End Location
                    </label>
                    <input type="text" name="endLocation" value={formData.endLocation} onChange={handleChange} className="ca-input" placeholder="Enter dropoff point" />
                    {errors.endLocation && <p className="ca-error">{errors.endLocation}</p>}
                  </div>

                  {/* Vehicle Select */}
                  <div className="ca-field">
                    <label className="ca-label">
                      <svg viewBox="0 0 24 24">
                        <rect x="1" y="3" width="15" height="13" rx="1"/>
                        <path d="M16 8h4l3 3v5h-7V8z"/>
                        <circle cx="5.5" cy="18.5" r="2.5"/>
                        <circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                      Assign Vehicle
                    </label>
                    <select name="vehicle_number" value={formData.vehicle_number} onChange={handleChange} className="ca-input">
                      <option value="">-- Select a Vehicle --</option>
                      {availableVehicles.map((v) => (
                        <option key={v.vehicle_number} value={v.vehicle_number}>{v.vehicle_number}</option>
                      ))}
                    </select>
                    {errors.vehicle_number && <p className="ca-error">{errors.vehicle_number}</p>}
                  </div>

                  {/* Driver Select */}
                  <div className="ca-field">
                    <label className="ca-label">
                      <svg viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Assign Driver
                    </label>
                    <select name="driver_id" value={formData.driver_id} onChange={handleChange} className="ca-input">
                      <option value="">-- Select a Driver --</option>
                      {availableDrivers.map((d) => (
                        <option key={d.driver_id} value={d.driver_id}>{d.name}</option>
                      ))}
                    </select>
                    {errors.driver_id && <p className="ca-error">{errors.driver_id}</p>}
                  </div>
                </div>

                {/* Submit & Back */}
                <div className="ca-btn-row" style={{ marginTop: '32px' }}>
                  <button type="submit" className="ca-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="ca-spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24">
                          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/>
                          <polyline points="17 21 17 13 7 13 7 21"/>
                          <polyline points="7 3 7 8 15 8"/>
                        </svg>
                        Save Assignment
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="ca-back-btn"
                    onClick={() => router.push(`/select-customer?userId=${userId || ""}`)}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* ── Dialog Modal ── */}
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

export default function Page() {
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
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '16px', fontWeight: '500', color: '#64748b' }}>Loading Configuration...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <CreateAssignmentForm />
    </Suspense>
  );
}