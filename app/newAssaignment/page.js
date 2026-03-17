"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from "../../components/userHeader";

const API_BASE_URL = 'http://localhost:5000/assignment';

// --- CUSTOM ALERT DIALOG COMPONENT ---
const AlertDialog = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="sc-modal-overlay">
      <div className="sc-modal-content">
        <div className="sc-modal-icon">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {title === "Success" ? (
              <>
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </>
            )}
          </svg>
        </div>
        <div className="sc-modal-title">{title}</div>
        <p className="sc-modal-message">{message}</p>
        <button className={`sc-modal-btn ${title !== "Success" ? "sc-modal-btn-error" : ""}`} onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

function SelectCustomerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '' });
  const [formData, setFormData] = useState({
    customer_id: '', company_name: '', contact: '', address: '', company_rate_per_km: '', driver_rate_per_km: ''
  });

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers/getall`);
      const data = await res.json();
      if (!res.ok) return showAlert("Error", data.error || "Failed to load customers.");
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]);
        console.error("API returned invalid data format:", data);
      }
    } catch (err) {
      showAlert("Error", "Failed to load customers.");
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const showAlert = (title, message) => setAlertConfig({ isOpen: true, title, message });
  const closeAlert = () => setAlertConfig({ isOpen: false, title: '', message: '' });

  const handleProceed = () => {
    if (!selectedCustomerId) {
      showAlert("Selection Required", "You must select a customer before proceeding to create an assignment.");
      return;
    }
    router.push(`/createAssignment?customerId=${selectedCustomerId}&userId=${userId}`);
  };

  const handleOpenForm = (customer = null) => {
    if (customer) {
      setFormData({
        customer_id: customer.customer_id || '',
        company_name: customer.company_name || '',
        contact: customer.contact || '',
        address: customer.address || '',
        company_rate_per_km: customer.company_rate || '',
        driver_rate_per_km: customer.driver_rate || ''
      });
    } else {
      setFormData({ customer_id: '', company_name: '', contact: '', address: '', company_rate_per_km: '', driver_rate_per_km: '' });
    }
    setIsFormOpen(true);
  };

  const validateFrontend = () => {
    if ((formData.company_name || '').length > 100) return "Name must be max 100 characters.";
    if ((formData.address || '').length > 250) return "Address must be max 250 characters.";
    const phoneRegex = /^(0\d{9}|\+94\d{9})$/;
    if (!phoneRegex.test(formData.contact || '')) return "Contact must be 10 digits starting with 0, or 12 characters starting with +94.";
    return null;
  };

  const handleSaveCustomer = async () => {
    const error = validateFrontend();
    if (error) { showAlert("Validation Error", error); return; }

    const isEditing = !!formData.customer_id;
    const url = isEditing ? `/api/customers/update/${formData.customer_id}` : '/api/customers/create';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(`${API_BASE_URL}${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setIsFormOpen(false);
        showAlert("Success", data.message);
        fetchCustomers();
      } else {
        showAlert("Error", data.error);
      }
    } catch (err) {
      showAlert("Error", "Something went wrong.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers/delete/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showAlert("Success", data.message);
        if (selectedCustomerId === id) setSelectedCustomerId(null);
        fetchCustomers();
      } else {
        showAlert("Error", data.error);
      }
    } catch (err) {
      showAlert("Error", "Failed to delete customer.");
    }
  };

  function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function toUpper(str) {
  if (!str) return "";
  return str.toUpperCase();
}

  // --- FILTERED CUSTOMERS ---
  const filteredCustomers = customers.filter(c =>
    (c.company_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        @keyframes scFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scModalPop {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes scSlideIn {
          from { opacity: 0; transform: translateX(-14px); }
          to { opacity: 1; transform: translateX(0); }
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sc-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
          padding: 108px 24px 60px;
          font-family: 'Inter', sans-serif;
        }

        .sc-container {
          max-width: 1100px;
          margin: 0 auto;
          animation: scFadeIn 0.5s ease both;
        }

        /* ── Page Header ── */
        .sc-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .sc-page-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .sc-header-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(59,130,246,0.35);
          flex-shrink: 0;
        }

        .sc-header-icon svg {
          width: 26px;
          height: 26px;
          stroke: #ffffff;
          fill: none;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sc-page-title {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .sc-page-subtitle {
          font-size: 13px;
          color: #64748b;
          margin-top: 2px;
          font-weight: 400;
        }

        .sc-back-btn {
          padding: 10px 20px;
          background: #ffffff;
          color: #475569;
          border: 1.5px solid #e2e8f0;
          border-radius: 11px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }

        .sc-back-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .sc-back-btn svg {
          width: 15px;
          height: 15px;
          stroke: #475569;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* ── Toolbar ── */
        .sc-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .sc-toolbar-hint {
          font-size: 13.5px;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .sc-toolbar-hint svg {
          width: 15px;
          height: 15px;
          stroke: #3b82f6;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex-shrink: 0;
        }

        .sc-add-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 11px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(37,99,235,0.32);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        }

        .sc-add-btn:hover {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.4);
        }

        .sc-add-btn svg {
          width: 16px;
          height: 16px;
          stroke: #ffffff;
          fill: none;
          stroke-width: 2.2;
          stroke-linecap: round;
        }

        /* ── Search Bar ── */
        .sc-search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%);
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          flex-wrap: wrap;
        }

        .sc-search-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .sc-search-wrap svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 15px;
          height: 15px;
          stroke: #94a3b8;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          pointer-events: none;
        }

        .sc-search-input {
          width: 100%;
          padding: 9px 12px 9px 36px;
          font-size: 13.5px;
          font-family: 'Inter', sans-serif;
          color: #1e293b;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .sc-search-input::placeholder { color: #94a3b8; }

        .sc-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .sc-search-clear-btn {
          padding: 8px 14px;
          font-size: 12.5px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          color: #64748b;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .sc-search-clear-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .sc-search-clear-btn svg {
          width: 13px;
          height: 13px;
          stroke: #94a3b8;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
        }

        .sc-search-result-count {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 500;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── Table Card ── */
        .sc-table-card {
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 4px 6px rgba(59,130,246,0.06), 0 16px 48px rgba(59,130,246,0.1), 0 0 0 1px rgba(191,219,254,0.4);
          overflow: hidden;
          margin-bottom: 24px;
          animation: scSlideIn 0.4s ease both;
        }

        .sc-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .sc-table thead tr {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        }

        .sc-table th {
          padding: 14px 18px;
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          white-space: nowrap;
        }

        .sc-table th:first-child { border-radius: 0; }

        .sc-table td {
          padding: 15px 18px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
          font-size: 14px;
          vertical-align: middle;
        }

        .sc-table tbody tr:last-child td { border-bottom: none; }

        .sc-table tbody tr:hover td { background: #f0f9ff; }

        .sc-table tbody tr.sc-row-selected td {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }

        .sc-table tbody tr.sc-row-selected:hover td {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        }

        /* Radio */
        .sc-radio {
          width: 18px;
          height: 18px;
          accent-color: #3b82f6;
          cursor: pointer;
        }

        /* Rate badge */
        .sc-rate-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .sc-rate-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 6px;
          border: 1px solid;
        }

        .sc-rate-chip.company {
          background: #f0f9ff;
          color: #1e40af;
          border-color: #bfdbfe;
        }

        .sc-rate-chip.driver {
          background: #f0fdf4;
          color: #166534;
          border-color: #86efac;
        }

        /* Action buttons */
        .sc-edit-btn {
          background: #ffffff;
          color: #3b82f6;
          border: 1.5px solid #bfdbfe;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          margin-right: 6px;
        }

        .sc-edit-btn:hover {
          background: #f0f9ff;
          border-color: #3b82f6;
          transform: translateY(-1px);
        }

        .sc-edit-btn svg {
          width: 13px;
          height: 13px;
          stroke: #3b82f6;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sc-delete-btn {
          background: #ffffff;
          color: #ef4444;
          border: 1.5px solid #fecaca;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }

        .sc-delete-btn:hover {
          background: #fef2f2;
          border-color: #ef4444;
          transform: translateY(-1px);
        }

        .sc-delete-btn svg {
          width: 13px;
          height: 13px;
          stroke: #ef4444;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* Empty state */
        .sc-empty td {
          text-align: center;
          padding: 52px 20px;
          color: #94a3b8;
          font-size: 14px;
        }

        .sc-empty-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }

        .sc-empty-icon svg {
          width: 42px;
          height: 42px;
          stroke: #cbd5e1;
          fill: none;
          stroke-width: 1.3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* ── Proceed Row ── */
        .sc-proceed-row {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .sc-proceed-hint {
          font-size: 13px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sc-proceed-hint svg {
          width: 14px;
          height: 14px;
          stroke: #94a3b8;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sc-proceed-btn {
          padding: 13px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: 0.1px;
        }

        .sc-proceed-btn.active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(37,99,235,0.36);
        }

        .sc-proceed-btn.active:hover {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(37,99,235,0.44);
        }

        .sc-proceed-btn.disabled {
          background: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .sc-proceed-btn svg {
          width: 17px;
          height: 17px;
          stroke: currentColor;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* ── Form Modal ── */
        .sc-form-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(5px);
          padding: 20px;
        }

        .sc-form-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 36px 32px 30px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(15,23,42,0.2), 0 0 0 1px rgba(191,219,254,0.4);
          animation: scModalPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        .sc-form-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 26px;
          padding-bottom: 18px;
          border-bottom: 1.5px solid #e2e8f0;
        }

        .sc-form-header-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .sc-form-header-icon svg {
          width: 20px;
          height: 20px;
          stroke: #ffffff;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sc-form-title {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: -0.3px;
        }

        .sc-form-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sc-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sc-field-label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sc-field-label svg {
          width: 13px;
          height: 13px;
          stroke: #94a3b8;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sc-input {
          width: 100%;
          padding: 10px 13px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: #1e293b;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .sc-input:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 3.5px rgba(59,130,246,0.12);
        }

        .sc-input:hover:not(:focus) {
          border-color: #cbd5e1;
          background: #f1f5f9;
        }

        .sc-textarea {
          resize: vertical;
          min-height: 78px;
        }

        .sc-rates-row {
          display: flex;
          gap: 14px;
        }

        .sc-rates-row .sc-field {
          flex: 1;
        }

        .sc-form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 26px;
          padding-top: 18px;
          border-top: 1.5px solid #f1f5f9;
        }

        .sc-cancel-btn {
          padding: 10px 22px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          color: #475569;
          background: #f1f5f9;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .sc-cancel-btn:hover { background: #e2e8f0; }

        .sc-save-btn {
          padding: 10px 26px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          color: #ffffff;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
          display: flex;
          align-items: center;
          gap: 7px;
          transition: opacity 0.2s, transform 0.15s;
        }

        .sc-save-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .sc-save-btn svg {
          width: 15px;
          height: 15px;
          stroke: #ffffff;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* ── Alert Modal ── */
        .sc-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          backdrop-filter: blur(5px);
          padding: 20px;
        }

        .sc-modal-content {
          background: #ffffff;
          border-radius: 20px;
          padding: 38px 32px 30px;
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(15,23,42,0.22), 0 0 0 1px rgba(191,219,254,0.4);
          animation: scModalPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
          font-family: 'Inter', sans-serif;
        }

        .sc-modal-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        }

        .sc-modal-icon svg {
          width: 27px;
          height: 27px;
          stroke: #2563eb;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sc-modal-title {
          font-size: 19px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 9px;
          letter-spacing: -0.3px;
        }

        .sc-modal-message {
          font-size: 14px;
          color: #64748b;
          line-height: 1.65;
          margin-bottom: 4px;
        }

        .sc-modal-btn {
          margin-top: 22px;
          padding: 11px 32px;
          font-size: 14.5px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          color: #ffffff;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          border-radius: 11px;
          cursor: pointer;
          width: 100%;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
          transition: opacity 0.2s, transform 0.15s;
        }

        .sc-modal-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .sc-modal-btn.sc-modal-btn-error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 4px 14px rgba(239,68,68,0.3);
        }

        @media (max-width: 900px) {
          .sc-page { padding: 100px 15px 40px; }
          .sc-page-title { font-size: 19px; }
          .sc-search-bar { flex-direction: column; align-items: stretch; }
          .sc-search-wrap { min-width: unset; }
        }

        @media (max-width: 640px) {
          .sc-page-header { flex-direction: column; align-items: flex-start; }
          .sc-back-btn { align-self: flex-end; }
          .sc-rates-row { flex-direction: column; }
          .sc-form-card { padding: 26px 18px 22px; }
          .sc-proceed-row { justify-content: stretch; }
          .sc-proceed-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      <Header userId={userId} />

      <div className="sc-page">
        <div className="sc-container">

          {/* ── Page Header ── */}
          <div className="sc-page-header">
            <div className="sc-page-header-left">
              <div className="sc-header-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <div>
                <div className="sc-page-title">Select Customer for Assignment</div>
                <div className="sc-page-subtitle">Choose an existing customer or add a new one to proceed</div>
              </div>
            </div>

            <button className="sc-back-btn" onClick={() => router.push(`/assignmentDashboard?userId=${userId}`)}>
              <svg viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          </div>

          {/* ── Toolbar ── */}
          <div className="sc-toolbar">
            <div className="sc-toolbar-hint">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Select a customer to proceed, or add a new one below.
            </div>
            <button className="sc-add-btn" onClick={() => handleOpenForm()}>
              <svg viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add New Customer
            </button>
          </div>

          {/* ── Search Bar ── */}
          <div className="sc-search-bar">
            <div className="sc-search-wrap">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="sc-search-input"
                placeholder="Search by company name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <button className="sc-search-clear-btn" onClick={() => setSearchQuery('')}>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Clear
              </button>
            )}
            <span className="sc-search-result-count">
              {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Customer Table ── */}
          <div className="sc-table-card">
            <table className="sc-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Company Name</th>
                  <th>Contact</th>
                  <th>Rates (Company / Driver)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr className="sc-empty">
                    <td colSpan="5">
                      <div className="sc-empty-icon">
                        <svg viewBox="0 0 24 24">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                          <path d="M16 3.13a4 4 0 010 7.75"/>
                        </svg>
                      </div>
                      {searchQuery ? 'No customers match your search.' : 'No customers found. Please add one.'}
                    </td>
                  </tr>
                ) : filteredCustomers.map(c => (
                  <tr
                    key={c.customer_id}
                    className={selectedCustomerId === c.customer_id ? 'sc-row-selected' : ''}
                  >
                    <td>
                      <input
                        type="radio"
                        name="customerSelect"
                        className="sc-radio"
                        checked={selectedCustomerId === c.customer_id}
                        onChange={() => setSelectedCustomerId(c.customer_id)}
                      />
                    </td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{capitalizeFirstLetter(c.company_name)}</td>
                    <td style={{ color: '#475569' }}>{c.contact}</td>
                    <td>
                      <div className="sc-rate-cell">
                        <span className="sc-rate-chip company">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round">
                            <rect x="2" y="7" width="20" height="14" rx="2"/>
                            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                          </svg>
                          {c.company_rate}
                        </span>
                        <span className="sc-rate-chip driver">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                          </svg>
                          {c.driver_rate}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="sc-edit-btn" onClick={() => handleOpenForm(c)}>
                        <svg viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button className="sc-delete-btn" onClick={() => handleDelete(c.customer_id)}>
                        <svg viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Proceed Row ── */}
          <div className="sc-proceed-row">
            {!selectedCustomerId && (
              <div className="sc-proceed-hint">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 8 12 12 14 14"/>
                </svg>
                Select a customer from the table above to continue
              </div>
            )}
            <button
              className={`sc-proceed-btn ${selectedCustomerId ? 'active' : 'disabled'}`}
              onClick={handleProceed}
            >
              Proceed to Create Assignment
              <svg viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* ── CUSTOMER ADD/EDIT MODAL ── */}
      {isFormOpen && (
        <div className="sc-form-overlay">
          <div className="sc-form-card">
            <div className="sc-form-header">
              <div className="sc-form-header-icon">
                {formData.customer_id ? (
                  <svg viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/>
                    <line x1="16" y1="11" x2="22" y2="11"/>
                  </svg>
                )}
              </div>
              <div className="sc-form-title">
                {formData.customer_id ? 'Edit Customer' : 'Add New Customer'}
              </div>
            </div>

            <div className="sc-form-body">
              <div className="sc-field">
                <label className="sc-field-label">
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                  </svg>
                  Company Name <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Max 100)</span>
                </label>
                <input
                  type="text"
                  maxLength="100"
                  className="sc-input"
                  placeholder="Enter company name"
                  value={capitalizeFirstLetter(formData.company_name)}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>

              <div className="sc-field">
                <label className="sc-field-label">
                  <svg viewBox="0 0 24 24">
                    <path d="M6.6 10.8a15.2 15.2 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/>
                  </svg>
                  Contact <span style={{ color: '#94a3b8', fontWeight: 400 }}>(0... or +94...)</span>
                </label>
                <input
                  type="text"
                  maxLength="12"
                  className="sc-input"
                  placeholder="0xxxxxxxxx or +94xxxxxxxxx"
                  value={formData.contact}
                  onChange={e => setFormData({ ...formData, contact: e.target.value })}
                />
              </div>

              <div className="sc-field">
                <label className="sc-field-label">
                  <svg viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Address <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Max 250)</span>
                </label>
                <textarea
                  maxLength="250"
                  className="sc-input sc-textarea"
                  placeholder="Enter company address"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="sc-rates-row">
                <div className="sc-field">
                  <label className="sc-field-label">
                    <svg viewBox="0 0 24 24">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                    </svg>
                    Company Rate / Km
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="sc-input"
                    placeholder="0.00"
                    value={formData.company_rate_per_km}
                    onChange={e => setFormData({ ...formData, company_rate_per_km: e.target.value })}
                  />
                </div>
                <div className="sc-field">
                  <label className="sc-field-label">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                    Driver Rate / Km
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="sc-input"
                    placeholder="0.00"
                    value={formData.driver_rate_per_km}
                    onChange={e => setFormData({ ...formData, driver_rate_per_km: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="sc-form-footer">
              <button className="sc-cancel-btn" onClick={() => setIsFormOpen(false)}>Cancel</button>
              <button className="sc-save-btn" onClick={handleSaveCustomer}>
                <svg viewBox="0 0 24 24">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GLOBAL ALERT DIALOG ── */}
      <AlertDialog
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={closeAlert}
      />
    </>
  );
}

export default function SelectCustomerPage() {
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
        <span style={{ fontSize: '16px', fontWeight: '500', color: '#64748b' }}>Loading...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <SelectCustomerPageContent />
    </Suspense>
  );
}