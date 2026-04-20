"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../components/adminNavbar";
import ProtectedRoute from "../../components/protectedRoute";

const API_BASE_URL = "http://localhost:5000/admin";

function AdminReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  const [monthFilter, setMonthFilter] = useState("");
  const [fleetFilter, setFleetFilter] = useState("");

  const [dialog, setDialog] = useState({ isOpen: false, type: "", title: "", message: "" });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        month: monthFilter,
        fleetType: fleetFilter
      }).toString();

      const res = await fetch(`${API_BASE_URL}/dashboard?${queryParams}`);
      const data = await res.json();

      if (res.ok) {
        setReportData(data);
      } else {
        setDialog({ isOpen: true, type: "error", title: "Error", message: data.error || "Failed to load reports." });
      }
    } catch (err) {
      setDialog({ isOpen: true, type: "error", title: "Network Error", message: "Could not reach the server." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [monthFilter, fleetFilter]);

  const capitalize = (str) => str ? str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "";
  const toUpper = (str) => str ? str.toUpperCase() : "";

  const formatCurrency = (val) => {
    const num = parseFloat(val || 0);
    return `Rs ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handlePrint = () => {
    window.print();
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
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 24px 60px;
            width: 100%;
            flex-grow: 1;
            animation: fadeIn 0.6s ease-out;
          }

          /* ── Page Header ── */
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 15px;
            animation: slideIn 0.5s ease both;
          }

          .title {
            font-size: 32px;
            font-weight: 800;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .title-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            border-radius: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
            flex-shrink: 0;
          }

          .title-icon svg {
            width: 22px;
            height: 22px;
            stroke: #ffffff;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
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
            margin-bottom: 30px;
            border: 1px solid #e0f2fe;
            flex-wrap: wrap;
          }

          .filter-group {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .filter-label {
            font-size: 14px;
            font-weight: 600;
            color: #475569;
            white-space: nowrap;
          }

          .filter-input {
            padding: 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
            outline: none;
            background: #f8fafc;
            color: #1e293b;
            min-width: 180px;
            transition: all 0.2s;
          }

          .filter-input:focus {
            border-color: #3b82f6;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .clear-btn {
            background: transparent;
            border: 2px solid #e2e8f0;
            color: #475569;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            font-size: 13px;
            cursor: pointer;
            padding: 10px 16px;
            border-radius: 10px;
            transition: all 0.2s;
          }

          .clear-btn:hover {
            background: #f0f9ff;
            border-color: #bfdbfe;
            color: #1e40af;
          }

          .print-btn {
            margin-left: auto;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: #ffffff;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
            transition: all 0.3s;
          }

          .print-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          }

          .print-btn svg {
            width: 16px;
            height: 16px;
            stroke: #ffffff;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          /* ── Stats Grid ── */
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            margin-bottom: 30px;
          }

          .stat-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 28px 28px 28px 36px;
            border: 1px solid #e0f2fe;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
            position: relative;
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 36px rgba(59, 130, 246, 0.16);
          }

          .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 5px;
            height: 100%;
            background: linear-gradient(180deg, #1e40af 0%, #3b82f6 100%);
          }

          .stat-card.revenue::before { background: linear-gradient(180deg, #1e40af 0%, #3b82f6 100%); }
          .stat-card.payout::before  { background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%); }
          .stat-card.margin::before  { background: linear-gradient(180deg, #3b82f6 0%, #93c5fd 100%); }

          .stat-card-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #93c5fd;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 14px;
          }

          .stat-card-icon svg {
            width: 18px;
            height: 18px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .stat-title {
            font-size: 12px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            margin-bottom: 8px;
          }

          .stat-value {
            font-size: 28px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: -0.5px;
          }

          .stat-value.value-primary { color: #1e40af; }

          /* ── Section Grid ── */
          .section-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
            gap: 24px;
            margin-bottom: 28px;
          }

          .section-grid-full {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
            margin-bottom: 28px;
          }

          .report-section {
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #e0f2fe;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          .section-header {
            padding: 18px 24px;
            border-bottom: 1px solid #e0f2fe;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .section-header svg {
            width: 18px;
            height: 18px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
            flex-shrink: 0;
          }

          .section-header-dark {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: #ffffff;
          }

          .section-header-dark svg { stroke: #ffffff; }

          .table-wrap {
            overflow-x: auto;
            max-height: 400px;
            overflow-y: auto;
          }

          /* ── Table ── */
          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }

          th {
            position: sticky;
            top: 0;
            background: #f8fafc;
            padding: 14px 20px;
            font-size: 12px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            z-index: 10;
            border-bottom: 2px solid #e0f2fe;
            white-space: nowrap;
          }

          td {
            padding: 14px 20px;
            border-bottom: 1px solid #f0f9ff;
            font-size: 14px;
            color: #1e293b;
            vertical-align: middle;
          }

          tbody tr:last-child td { border-bottom: none; }

          tbody tr {
            transition: background 0.15s;
          }

          tbody tr:hover td { background: #f0f9ff; }

          /* ── Value Highlights ── */
          .highlight-primary { color: #1e40af; font-weight: 700; }
          .highlight-secondary { color: #3b82f6; font-weight: 700; }
          .highlight-neutral { color: #475569; font-weight: 600; }

          .sub-text {
            font-size: 12px;
            color: #94a3b8;
            display: block;
            margin-top: 2px;
            font-weight: 500;
          }

          /* ── Blacklist Section ── */
          .blacklist-columns {
            display: flex;
            flex-direction: row;
            background: #f8fafc;
            max-height: 300px;
            overflow-y: auto;
          }

          .blacklist-col {
            flex: 1;
            border-right: 1px solid #e0f2fe;
          }

          .blacklist-col:last-child { border-right: none; }

          .blacklist-col-title {
            padding: 14px 18px;
            border-bottom: 1px solid #e0f2fe;
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
            background: #ffffff;
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .blacklist-col-title svg {
            width: 13px;
            height: 13px;
            stroke: #1e40af;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          /* ── Loading State ── */
          .loading-state {
            text-align: center;
            padding: 80px 20px;
            color: #64748b;
            font-size: 15px;
            font-weight: 500;
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #e0f2fe;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.08);
          }

          .loading-state svg {
            width: 42px;
            height: 42px;
            stroke: #bfdbfe;
            fill: none;
            stroke-width: 1.3;
            stroke-linecap: round;
            stroke-linejoin: round;
            margin: 0 auto 14px;
            display: block;
          }

          /* ── Empty Cell ── */
          .empty-cell {
            text-align: center;
            padding: 28px 20px;
            color: #94a3b8;
            font-size: 13px;
          }

          /* ── Print Styles ── */
          @media print {
            .sidebar-container, .page-header button, .filter-bar { display: none !important; }
            .admin-main { margin-left: 0 !important; background: white !important; }
            .page-container { padding: 0 !important; max-width: 100% !important; }
            .stat-card { border: 1px solid #000; break-inside: avoid; }
            .report-section { break-inside: avoid; border: 1px solid #000; margin-bottom: 20px; }
            .table-wrap { max-height: none !important; overflow: visible !important; }
            .blacklist-columns { max-height: none !important; overflow: visible !important; }
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
            color: #1e293b;
            margin-bottom: 10px;
          }

          .modal-message {
            font-size: 15px;
            color: #64748b;
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

          @media (max-width: 900px) {
            .page-container { padding: 24px 16px 40px; }
            .title { font-size: 24px; }
            .section-grid { grid-template-columns: 1fr; }
            .blacklist-columns { flex-direction: column; }
            .blacklist-col { border-right: none; border-bottom: 1px solid #e0f2fe; }
          }
        `}</style>

        <div className="page-container">

          {/* ── Page Header ── */}
          <div className="page-header">
            <h1 className="title">
              <div className="title-icon">
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              Analytics & Reports
            </h1>
          </div>

          {/* ── Filter Bar ── */}
          <div className="filter-bar">
            <div className="filter-group">
              <span className="filter-label">Timeframe:</span>
              <input
                type="month"
                className="filter-input"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <span className="filter-label">Fleet Category:</span>
              <select className="filter-input" value={fleetFilter} onChange={(e) => setFleetFilter(e.target.value)}>
                <option value="">All Vehicles</option>
                <option value="Own Fleet">Own Fleet</option>
                <option value="Out Source">Outsource</option>
              </select>
            </div>
            {(monthFilter || fleetFilter) && (
              <button className="clear-btn" onClick={() => { setMonthFilter(""); setFleetFilter(""); }}>
                Clear Filters
              </button>
            )}
            <button className="print-btn" onClick={handlePrint}>
              <svg viewBox="0 0 24 24">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Export Report
            </button>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="loading-state">
              <svg viewBox="0 0 24 24">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Aggregating Data...
            </div>
          )}

          {/* ── Report Content ── */}
          {!loading && reportData && (
            <>
              {/* ── 1. Gross Margin Stats ── */}
              <div className="stats-grid">
                <div className="stat-card revenue">
                  <div className="stat-card-icon">
                    <svg viewBox="0 0 24 24">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                    </svg>
                  </div>
                  <div className="stat-title">Total Customer Revenue</div>
                  <div className="stat-value">{formatCurrency(reportData.grossMargin.total_revenue)}</div>
                </div>
                <div className="stat-card payout">
                  <div className="stat-card-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="stat-title">Total Driver Payouts</div>
                  <div className="stat-value">{formatCurrency(reportData.grossMargin.total_payout)}</div>
                </div>
                <div className="stat-card margin">
                  <div className="stat-card-icon">
                    <svg viewBox="0 0 24 24">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                      <polyline points="16 7 22 7 22 13"/>
                    </svg>
                  </div>
                  <div className="stat-title">Gross Profit Margin</div>
                  <div className="stat-value value-primary">{formatCurrency(reportData.grossMargin.gross_margin)}</div>
                </div>
              </div>

              {/* ── 2. Financial Breakdowns ── */}
              <div className="section-grid">

                {/* Customer Billing */}
                <div className="report-section">
                  <div className="section-header">
                    <svg viewBox="0 0 24 24">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    Customer Billing Summary
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Total Trips</th>
                          <th style={{ textAlign: 'right' }}>Total Billed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.customerBilling.length === 0 && (
                          <tr><td colSpan="3" className="empty-cell">No data available</td></tr>
                        )}
                        {reportData.customerBilling.map((c, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{capitalize(c.company_name)}</td>
                            <td style={{ color: '#475569' }}>{c.total_trips}</td>
                            <td className="highlight-primary" style={{ textAlign: 'right' }}>{formatCurrency(c.total_billed)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Driver Earnings */}
                <div className="report-section">
                  <div className="section-header">
                    <svg viewBox="0 0 24 24">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                    Driver Earnings & Payroll
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Driver</th>
                          <th>Trips / KMS</th>
                          <th style={{ textAlign: 'right' }}>Total Payout</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.driverEarnings.length === 0 && (
                          <tr><td colSpan="3" className="empty-cell">No data available</td></tr>
                        )}
                        {reportData.driverEarnings.map((d, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{capitalize(d.driver_name)}</td>
                            <td>
                              {d.total_trips} Trips
                              <span className="sub-text">{d.total_kms} KMS driven</span>
                            </td>
                            <td className="highlight-secondary" style={{ textAlign: 'right' }}>{formatCurrency(d.total_earnings)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ── 3. Operations & Utilization ── */}
              <div className="section-grid">

                {/* Vehicle Mileage */}
                <div className="report-section">
                  <div className="section-header">
                    <svg viewBox="0 0 24 24">
                      <rect x="1" y="3" width="15" height="13" rx="1"/>
                      <path d="M16 8h4l3 3v5h-7V8z"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    Vehicle Utilization (Mileage)
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Vehicle</th>
                          <th>Type</th>
                          <th style={{ textAlign: 'right' }}>Total Distance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.vehicleMileage.length === 0 && (
                          <tr><td colSpan="3" className="empty-cell">No data available</td></tr>
                        )}
                        {reportData.vehicleMileage.map((v, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{toUpper(v.vehicle_number)}</td>
                            <td style={{ color: '#475569' }}>{v.vehicle_type}</td>
                            <td className="highlight-neutral" style={{ textAlign: 'right' }}>{v.total_kms} KMS</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Route Frequency */}
                <div className="report-section">
                  <div className="section-header">
                    <svg viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Route Demand Analysis
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Start Location</th>
                          <th>End Location</th>
                          <th style={{ textAlign: 'right' }}>Frequency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.routeFrequency.length === 0 && (
                          <tr><td colSpan="3" className="empty-cell">No data available</td></tr>
                        )}
                        {reportData.routeFrequency.map((r, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 500 }}>{capitalize(r.start_location)}</td>
                            <td style={{ fontWeight: 500 }}>{capitalize(r.end_location)}</td>
                            <td className="highlight-primary" style={{ textAlign: 'right' }}>{r.trip_count} Trips</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ── 4. Compliance & Logs ── */}
              <div className="section-grid-full">

                {/* Cancelled Trips */}
                <div className="report-section">
                  <div className="section-header">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                    Cancelled Trips Log
                  </div>
                  <div className="table-wrap" style={{ maxHeight: '300px' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Customer & Route</th>
                          <th>Vehicle & Driver</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.cancelledTrips.length === 0 && (
                          <tr><td colSpan="3" className="empty-cell">No cancellations in this period</td></tr>
                        )}
                        {reportData.cancelledTrips.map((c, i) => (
                          <tr key={i}>
                            <td style={{ color: '#475569', fontSize: 13 }}>{new Date(c.est_s_TD).toLocaleDateString()}</td>
                            <td>
                              <strong style={{ color: '#1e293b' }}>{capitalize(c.company_name)}</strong>
                              <span className="sub-text">
                                {capitalize(c.start_location)}
                                {' '}
                                <svg style={{ width: 10, height: 10, stroke: '#94a3b8', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', verticalAlign: 'middle', margin: '0 2px' }} viewBox="0 0 24 24">
                                  <line x1="5" y1="12" x2="19" y2="12"/>
                                  <polyline points="12 5 19 12 12 19"/>
                                </svg>
                                {' '}
                                {capitalize(c.end_location)}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 600 }}>{toUpper(c.vehicle_number)}</span>
                              <span style={{ color: '#475569', marginLeft: 6, fontSize: 12 }}>({c.vehicle_type})</span>
                              <span className="sub-text">Driver: {capitalize(c.driver_name)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Blacklist Audit */}
                <div className="report-section">
                  <div className="section-header section-header-dark">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                    Global Blacklist Audit
                  </div>
                  <div className="blacklist-columns">

                    {/* Vehicles */}
                    <div className="blacklist-col">
                      <div className="blacklist-col-title">
                        <svg viewBox="0 0 24 24">
                          <rect x="1" y="3" width="15" height="13" rx="1"/>
                          <path d="M16 8h4l3 3v5h-7V8z"/>
                          <circle cx="5.5" cy="18.5" r="2.5"/>
                          <circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                        Blacklisted Vehicles
                      </div>
                      <table style={{ background: '#ffffff' }}>
                        <tbody>
                          {reportData.blacklists.vehicles.length === 0 && (
                            <tr><td className="empty-cell">None</td></tr>
                          )}
                          {reportData.blacklists.vehicles.map((v, i) => (
                            <tr key={i}>
                              <td>
                                <strong style={{ color: '#1e293b' }}>{toUpper(v.vehicle_number)}</strong>
                                <span className="sub-text">{v.vehicle_type}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Drivers */}
                    <div className="blacklist-col">
                      <div className="blacklist-col-title">
                        <svg viewBox="0 0 24 24">
                          <circle cx="12" cy="8" r="4"/>
                          <path d="M20 21a8 8 0 10-16 0"/>
                        </svg>
                        Blacklisted Drivers
                      </div>
                      <table style={{ background: '#ffffff' }}>
                        <tbody>
                          {reportData.blacklists.drivers.length === 0 && (
                            <tr><td className="empty-cell">None</td></tr>
                          )}
                          {reportData.blacklists.drivers.map((d, i) => (
                            <tr key={i}>
                              <td>
                                <strong style={{ color: '#1e293b' }}>{capitalize(d.name)}</strong>
                                <span className="sub-text">{d.contact}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Users */}
                    <div className="blacklist-col">
                      <div className="blacklist-col-title">
                        <svg viewBox="0 0 24 24">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <line x1="17" y1="11" x2="23" y2="11"/>
                        </svg>
                        Suspended System Users
                      </div>
                      <table style={{ background: '#ffffff' }}>
                        <tbody>
                          {reportData.blacklists.users.length === 0 && (
                            <tr><td className="empty-cell">None</td></tr>
                          )}
                          {reportData.blacklists.users.map((u, i) => (
                            <tr key={i}>
                              <td>
                                <strong style={{ color: '#1e293b' }}>{capitalize(u.name)}</strong>
                                <span className="sub-text">{u.role}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Global Dialog ── */}
        {dialog.isOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-icon">
                {dialog.type === "error" ? (
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
              <h3 className="msg-title">{dialog.title}</h3>
              <p className="modal-message">{dialog.message}</p>
              <button className="msg-btn" onClick={() => setDialog({ ...dialog, isOpen: false })}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}

export default function AdminReports() {
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
      <AdminReportsContent />
    </Suspense>
  );
}