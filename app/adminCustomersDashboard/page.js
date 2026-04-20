"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../components/adminNavbar";
import ProtectedRoute from "../../components/protectedRoute";

function AdminCustomersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "", isError: false });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/assignment/api/customers/admingetall");
      const data = await res.json();

      if (res.ok) {
        const customerData = Array.isArray(data) ? data : [];
        setCustomers(customerData);
        setFilteredCustomers(customerData);
      } else {
        setDialog({ isOpen: true, title: "Error", message: data.error || "Failed to load customers", isError: true });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setDialog({ isOpen: true, title: "Network Error", message: "Failed to connect to server.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      setFilteredCustomers(customers.filter(c =>
        (c.company_name && c.company_name.toLowerCase().includes(lowerCaseQuery)) ||
        (c.contact && c.contact.includes(lowerCaseQuery))
      ));
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatMobileNumber = (number) => {
    if (!number) return "-";
    const str = number.toString().replace(/\s+/g, '');
    if (str.startsWith('+94')) return str.replace(/(\+94)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4");
    if (str.startsWith('07')) return str.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    return number;
  };

  return (
    <ProtectedRoute>
      <div className="admin-layout">
        <Sidebar />
        <div className="admin-main">

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideIn {
              from { opacity: 0; transform: translateX(-20px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes modalPop {
              from { opacity: 0; transform: scale(0.88) translateY(16px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }

            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

            /* ── Layout ── */
            .admin-layout {
              display: flex;
              min-height: 100vh;
              font-family: 'Inter', sans-serif;
            }

            .admin-main {
              margin-left: 250px;
              min-height: 100vh;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
              display: flex;
              flex-direction: column;
              flex: 1;
            }

            @media (max-width: 768px) {
              .admin-main { margin-left: 220px; }
            }

            /* ── Page Container ── */
            .page-container {
              padding: 40px;
              animation: fadeIn 0.6s ease-out;
              flex-grow: 1;
              max-width: 1400px;
              margin: 0 auto;
              width: 100%;
            }

            /* ── Page Header ── */
            .page-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              animation: slideIn 0.5s ease-out;
              flex-wrap: wrap;
              gap: 16px;
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

            /* ── Filter Bar ── */
            .filter-bar {
              background: #ffffff;
              padding: 20px 24px;
              border-radius: 16px;
              box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
              display: flex;
              gap: 20px;
              align-items: center;
              margin-bottom: 28px;
              border: 1px solid #e0f2fe;
              animation: fadeIn 0.8s ease-out;
              flex-wrap: wrap;
            }

            .search-wrap {
              position: relative;
              flex: 1;
              min-width: 220px;
              max-width: 500px;
            }

            .search-icon {
              position: absolute;
              left: 14px;
              top: 50%;
              transform: translateY(-50%);
              width: 16px;
              height: 16px;
              stroke: #94a3b8;
              fill: none;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-linejoin: round;
              pointer-events: none;
            }

            .search-input {
              width: 100%;
              padding: 14px 18px 14px 40px;
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              font-size: 15px;
              font-family: 'Inter', sans-serif;
              outline: none;
              background: #f8fafc;
              color: #1e293b;
              transition: all 0.2s;
            }

            .search-input::placeholder { color: #94a3b8; }

            .search-input:focus {
              border-color: #3b82f6;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
              background: #ffffff;
            }

            .result-count {
              font-size: 13px;
              font-weight: 600;
              color: #1e40af;
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              border: 1px solid #93c5fd;
              padding: 6px 14px;
              border-radius: 20px;
              white-space: nowrap;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              gap: 6px;
            }

            .result-count svg {
              width: 13px;
              height: 13px;
              stroke: #1e40af;
              fill: none;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            /* ── Table Container ── */
            .table-container {
              background: #ffffff;
              border-radius: 16px;
              box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
              overflow: hidden;
              border: 1px solid #e0f2fe;
              animation: fadeIn 1s ease-out;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              min-width: 800px;
              text-align: left;
            }

            thead tr {
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            }

            th {
              padding: 18px 20px;
              text-align: left;
              color: #ffffff;
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              white-space: nowrap;
            }

            td {
              padding: 18px 20px;
              border-bottom: 1px solid #f0f9ff;
              color: #1e293b;
              font-size: 14px;
              vertical-align: middle;
            }

            tbody tr:last-child td { border-bottom: none; }

            tbody tr {
              transition: background 0.2s;
            }

            tbody tr:hover td { background: #f0f9ff; }

            /* ── Company Name Cell ── */
            .company-cell {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .company-cell-icon {
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

            .company-cell-icon svg {
              width: 15px;
              height: 15px;
              stroke: #1e40af;
              fill: none;
              stroke-width: 1.8;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            /* ── Rate Badges ── */
            .rate-badge {
              display: inline-flex;
              align-items: center;
              gap: 5px;
              padding: 6px 14px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 700;
              border: 1px solid #93c5fd;
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              color: #1e40af;
            }

            .rate-badge svg {
              width: 12px;
              height: 12px;
              stroke: currentColor;
              fill: none;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            .rate-badge-secondary {
              border-color: #cbd5e1;
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              color: #475569;
            }

            /* ── Empty / Loading Row ── */
            .empty-row td {
              text-align: center;
              padding: 52px 20px;
              color: #94a3b8;
              font-size: 15px;
            }

            .empty-icon {
              display: flex;
              justify-content: center;
              margin-bottom: 10px;
            }

            .empty-icon svg {
              width: 42px;
              height: 42px;
              stroke: #bfdbfe;
              fill: none;
              stroke-width: 1.3;
              stroke-linecap: round;
              stroke-linejoin: round;
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
            .dialog-content {
              background: #ffffff;
              padding: 30px;
              border-radius: 16px;
              width: 90%;
              max-width: 440px;
              text-align: center;
              box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25);
              border: 1px solid #e0f2fe;
              animation: modalPop 0.4s ease-out both;
              font-family: 'Inter', sans-serif;
            }

            .dialog-icon-wrap {
              width: 62px;
              height: 62px;
              border-radius: 50%;
              background: linear-gradient(135deg, #dbeafe, #bfdbfe);
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 18px;
            }

            .dialog-icon-wrap svg {
              width: 28px;
              height: 28px;
              stroke: #1e40af;
              fill: none;
              stroke-width: 2;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            .dialog-title {
              font-size: 22px;
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 10px;
            }

            .dialog-message {
              font-size: 15px;
              color: #64748b;
              margin-bottom: 4px;
              line-height: 1.6;
            }

            .dialog-button {
              margin-top: 24px;
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              color: #ffffff;
              border: none;
              padding: 12px 24px;
              border-radius: 10px;
              font-weight: 600;
              font-size: 15px;
              font-family: 'Inter', sans-serif;
              cursor: pointer;
              transition: all 0.3s;
              width: 100%;
              box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
            }

            .dialog-button:hover {
              background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            }

            @media (max-width: 900px) {
              .page-container { padding: 24px 16px; }
              .title { font-size: 24px; }
            }
          `}</style>

          <div className="page-container">

            {/* ── Page Header ── */}
            <div className="page-header">
              <h1 className="title">Registered Customers</h1>
            </div>

            {/* ── Filter Bar ── */}
            <div className="filter-bar">
              <div className="search-wrap">
                <svg className="search-icon" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search by Company Name or Contact..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="result-count">
                <svg viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
                {filteredCustomers.length} Customer{filteredCustomers.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* ── Table ── */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Contact</th>
                    <th style={{ width: '30%' }}>Address</th>
                    <th>Company Rate (per KM)</th>
                    <th>Driver Rate (per KM)</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr className="empty-row">
                      <td colSpan={5}>
                        <div className="empty-icon">
                          <svg viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                          </svg>
                        </div>
                        Loading customers...
                      </td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan={5}>
                        <div className="empty-icon">
                          <svg viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                          </svg>
                        </div>
                        No customers found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr key={c.customer_id}>
                        <td>
                          <div className="company-cell">
                            <div className="company-cell-icon">
                              <svg viewBox="0 0 24 24">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                              </svg>
                            </div>
                            <span style={{ fontWeight: '700', color: '#1e293b' }}>
                              {capitalizeFirstLetter(c.company_name)}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontWeight: '500', color: '#475569' }}>
                          {formatMobileNumber(c.contact)}
                        </td>
                        <td style={{ color: '#475569', lineHeight: '1.6' }}>
                          {c.address || '-'}
                        </td>
                        <td>
                          <span className="rate-badge">
                            Rs {parseFloat(c.company_rate || 0).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span className="rate-badge rate-badge-secondary">
                            Rs {parseFloat(c.driver_rate || 0).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Dialog Modal ── */}
          {dialog.isOpen && (
            <div className="modal-overlay">
              <div className="dialog-content">
                <div className="dialog-icon-wrap">
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
                <button className="dialog-button" onClick={() => setDialog({ ...dialog, isOpen: false })}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AdminCustomers() {
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
      <AdminCustomersContent />
    </Suspense>
  );
}