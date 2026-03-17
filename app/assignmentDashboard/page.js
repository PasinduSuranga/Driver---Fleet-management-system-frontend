"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/userHeader";

const API_BASE_URL = "http://localhost:5000/assignment";

// --- CUSTOM ALERT DIALOG COMPONENT ---
const AlertDialog = ({ isOpen, title, message, onClose, onConfirm, type }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className={`modal-icon ${type || 'success'}`}>
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
        <button
          className={`msg-btn ${type === "error" ? "error-btn" : ""}`}
          onClick={() => { onClose(); if (onConfirm) onConfirm(); }}>
          OK
        </button>
      </div>
    </div>
  );
};

function FleetDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";

  const [activeTab, setActiveTab] = useState("ongoing");
  const [ongoingJobs, setOngoingJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);

  const [reportMonth, setReportMonth] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [reports, setReports] = useState({ driverPayments: [] });

  const [kmsModalOpen, setKmsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [totalKMS, setTotalKMS] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dialog, setDialog] = useState({ isOpen: false, type: "", title: "", message: "", onConfirm: null });

  // --- SEARCH & FILTER STATE ---
  const [ongoingSearch, setOngoingSearch] = useState("");
  const [ongoingMonth, setOngoingMonth] = useState("");
  const [completedSearch, setCompletedSearch] = useState("");
  const [completedMonth, setCompletedMonth] = useState("");
  const [reportsSearch, setReportsSearch] = useState("");

  // --- LOADING STATES FOR DOC & INVOICE GENERATION ---
  const [generatingDocId, setGeneratingDocId] = useState(null);
  const [generatingInvoiceId, setGeneratingInvoiceId] = useState(null);

  const showAlert = (type, title, message, onConfirm = null) => {
    setDialog({ isOpen: true, type, title, message, onConfirm });
  };

  const fetchOngoing = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/ongoing`);
      const data = await res.json();
      if (!res.ok) return showAlert("error", "Error", data.error || "Failed to load ongoing assignments.");
      setOngoingJobs(Array.isArray(data) ? data : []);
    } catch (err) { showAlert("error", "Error", "Failed to load ongoing assignments."); }
  };

  const fetchCompleted = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/completed`);
      const data = await res.json();
      if (!res.ok) return showAlert("error", "Error", data.error || "Failed to load completed assignments.");
      setCompletedJobs(Array.isArray(data) ? data : []);
    } catch (err) { showAlert("error", "Error", "Failed to load completed assignments."); }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/reports?month=${reportMonth}`);
      const data = await res.json();
      if (!res.ok) return showAlert("error", "Error", data.error || "Failed to load financial reports.");
      setReports({ driverPayments: Array.isArray(data.driverPayments) ? data.driverPayments : [] });
    } catch (err) { showAlert("error", "Error", "Failed to load financial reports."); }
  };

  useEffect(() => {
    if (activeTab === "ongoing") fetchOngoing();
    else if (activeTab === "completed") fetchCompleted();
    else if (activeTab === "reports") fetchReports();
  }, [activeTab, reportMonth]);

  // --- FILTERED DATA ---
  const filteredOngoing = ongoingJobs.filter(job => {
    const q = ongoingSearch.toLowerCase();
    const matchSearch = !q ||
      (job.vehicle_number || '').toLowerCase().includes(q) ||
      (job.driver_name || '').toLowerCase().includes(q) ||
      (job.company_name || '').toLowerCase().includes(q);
    const matchMonth = !ongoingMonth ||
      new Date(job.est_s_TD).toISOString().slice(0, 7) === ongoingMonth;
    return matchSearch && matchMonth;
  });

  const filteredCompleted = completedJobs.filter(job => {
    const q = completedSearch.toLowerCase();
    const matchSearch = !q ||
      (job.vehicle_number || '').toLowerCase().includes(q) ||
      (job.driver_name || '').toLowerCase().includes(q) ||
      (job.company_name || '').toLowerCase().includes(q);
    const matchMonth = !completedMonth ||
      new Date(job.est_e_TD).toISOString().slice(0, 7) === completedMonth;
    return matchSearch && matchMonth;
  });

  const filteredReportsPayments = (reports.driverPayments || []).filter(driver => {
    const q = reportsSearch.toLowerCase();
    return !q || (driver.driver_name || '').toLowerCase().includes(q);
  });

  const handleOpenKmsModal = (id) => {
    setSelectedJobId(id);
    setTotalKMS("");
    setKmsModalOpen(true);
  };

  const handleCompleteTrip = async () => {
    if (!totalKMS || isNaN(totalKMS) || parseFloat(totalKMS) <= 0) {
      return showAlert("error", "Invalid Input", "Please enter a valid number of kilometers.");
    }
    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/assignments/complete/${selectedJobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalKMS: parseFloat(totalKMS).toFixed(2) })
      });
      const data = await res.json();
      if (res.ok) {
        setKmsModalOpen(false);
        showAlert("success", "Success", data.message, fetchOngoing);
      } else {
        showAlert("error", "Error", data.error);
      }
    } catch (err) {
      showAlert("error", "Error", "Failed to complete trip.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchAsBase64 = async (url) => {
    if (!url) return '';
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) { return url; }
  };

  const handleGenerateDoc = async (id) => {
    try {
      setGeneratingDocId(id);
      const res = await fetch(`${API_BASE_URL}/api/assignments/document/${id}`);
      const data = await res.json();
      if (!res.ok) { showAlert("error", "Error", data.error || "Failed to fetch document data."); return; }

      const getImgSrc = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return `${API_BASE_URL}/api/assignments/proxy-image?url=${encodeURIComponent(path)}`;
        let cleanPath = path.replace(/\\/g, '/');
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
        return `http://localhost:5000/${cleanPath}`;
      };

      const b64DriverFront = await fetchAsBase64(getImgSrc(data.driver_license_front));
      const b64DriverBack = await fetchAsBase64(getImgSrc(data.driver_license_back));
      const b64VehiclePhoto = await fetchAsBase64(getImgSrc(data.vehicle_photo));
      const b64VehicleLicense = await fetchAsBase64(getImgSrc(data.vehicle_license_photo));
      const b64VehicleInsurance = await fetchAsBase64(getImgSrc(data.vehicle_insurance_photo));

      const printWindow = window.open('', '_blank');
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Assignment Document - ${id}</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              body { font-family: 'Inter', 'Helvetica Neue', sans-serif; color: #1e293b; background: #f8fafc; margin: 0; padding: 20px; font-size: 14px; }
              .action-bar { text-align: center; margin-bottom: 20px; padding: 15px; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
              .print-btn { background: #3b82f6; color: white; border: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 15px; }
              .print-btn:hover { background: #2563eb; }
              #pdf-content { background: #fff; max-width: 210mm; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .page { height: 262mm; width: 100%; box-sizing: border-box; position: relative; display: flex; flex-direction: column; padding: 15mm; }
              .header { text-align: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 20px; }
              h1 { margin: 0 0 6px 0; color: #0f172a; font-size: 22px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
              .subtitle { color: #64748b; font-size: 12px; font-weight: 500; }
              .section-title { font-size: 15px; font-weight: 700; background: #f8fafc; padding: 10px 14px; border-left: 4px solid #3b82f6; margin-bottom: 16px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
              .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
              .info-table td { padding: 10px 14px; border: 1px solid #e2e8f0; }
              .info-table td.label { font-weight: 600; background: #f8fafc; width: 30%; color: #475569; }
              .info-table td.value { font-weight: 500; color: #0f172a; }
              .images-container { display: flex; flex-direction: column; gap: 16px; flex-grow: 1; }
              .images-row { display: flex; gap: 16px; width: 100%; }
              .img-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; background: #fff; flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; box-sizing: border-box; }
              .img-box strong { font-size: 12px; color: #64748b; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
              .img-box img { max-width: 100%; margin: 0 auto; object-fit: contain; }
              .driver-img { height: 280px; }
              .veh-main-img { height: 280px; }
              .veh-sub-img { height: 220px; }
              .no-photo { height: 120px; display: flex; align-items: center; justify-content: center; background: #f8fafc; color: #94a3b8; font-style: italic; border-radius: 4px; font-size: 13px; }
              .footer { margin-top: auto; padding-top: 10px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; }
              @media print {
                @page { size: A4 portrait; margin: 0; }
                body { padding: 0; background: #fff; }
                .action-bar { display: none; }
                #pdf-content { max-width: 100%; box-shadow: none; }
                .page { page-break-after: always; height: 100vh; }
                .page:last-child { page-break-after: auto; }
              }
            </style>
          </head>
          <body>
            <div class="action-bar" data-html2canvas-ignore="true">
              <p style="margin: 0 0 10px 0; color: #64748b;">Your PDF will download automatically in a moment...</p>
              <button class="print-btn" onclick="window.print()">Print Document Instead</button>
            </div>
            <div id="pdf-content">
              <div class="page html2pdf__page-break">
                <div class="header">
                  <h1>Assignment Dispatch Document</h1>
                  <div class="subtitle">Reference ID: ${data.assignment_id} &nbsp;|&nbsp; Generated On: ${new Date().toLocaleDateString()}</div>
                </div>
                <div class="section-title">1. Driver Information</div>
                <table class="info-table">
                  <tr><td class="label">Driver Name</td><td class="value">${capitalizeFirstLetter(data.driver_name) || 'N/A'}</td></tr>
                  <tr><td class="label">Contact Number</td><td class="value">${data.driver_contact || 'N/A'}</td></tr>
                </table>
                <div class="images-container">
                  <div class="img-box"><strong>Driver License (Front)</strong>${b64DriverFront ? `<img class="driver-img pdf-image" crossorigin="anonymous" src="${b64DriverFront}" alt="License Front" />` : '<div class="no-photo">No Photo Available</div>'}</div>
                  <div class="img-box"><strong>Driver License (Back)</strong>${b64DriverBack ? `<img class="driver-img pdf-image" crossorigin="anonymous" src="${b64DriverBack}" alt="License Back" />` : '<div class="no-photo">No Photo Available</div>'}</div>
                </div>
                <div class="footer">Page 1 of 2 - Confidential Document</div>
              </div>
              <div class="page">
                <div class="header">
                  <h1>Assignment Dispatch Document</h1>
                  <div class="subtitle">Reference ID: ${data.assignment_id} &nbsp;|&nbsp; Generated On: ${new Date().toLocaleDateString()}</div>
                </div>
                <div class="section-title">2. Vehicle Information</div>
                <table class="info-table">
                  <tr><td class="label">Vehicle Number</td><td class="value">${toUpper(data.vehicle_number) || 'N/A'}</td></tr>
                </table>
                <div class="images-container">
                  <div class="img-box" style="flex: none;"><strong>Vehicle Photo</strong>${b64VehiclePhoto ? `<img class="veh-main-img pdf-image" crossorigin="anonymous" src="${b64VehiclePhoto}" alt="Vehicle" />` : '<div class="no-photo">No Photo Available</div>'}</div>
                  <div class="images-row">
                    <div class="img-box"><strong>Revenue License</strong>${b64VehicleLicense ? `<img class="veh-sub-img pdf-image" crossorigin="anonymous" src="${b64VehicleLicense}" alt="Revenue License" />` : '<div class="no-photo">No Photo Available</div>'}</div>
                    <div class="img-box"><strong>Insurance Document</strong>${b64VehicleInsurance ? `<img class="veh-sub-img pdf-image" crossorigin="anonymous" src="${b64VehicleInsurance}" alt="Insurance" />` : '<div class="no-photo">No Photo Available</div>'}</div>
                  </div>
                </div>
                <div class="footer">Page 2 of 2 - Confidential Document</div>
              </div>
            </div>
            <script>
              function generatePDF() {
                if (typeof html2pdf === 'undefined') { setTimeout(generatePDF, 100); return; }
                const element = document.getElementById('pdf-content');
                const opt = { margin: 0, filename: 'Assignment_${data.assignment_id}.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
                html2pdf().set(opt).from(element).save();
              }
              window.addEventListener('load', () => {
                const images = Array.from(document.querySelectorAll('.pdf-image'));
                let loadedImages = 0;
                if (images.length === 0) { generatePDF(); return; }
                images.forEach(img => {
                  if (img.complete && img.naturalHeight !== 0) { loadedImages++; if (loadedImages === images.length) setTimeout(generatePDF, 500); }
                  else {
                    img.onload = () => { loadedImages++; if (loadedImages === images.length) setTimeout(generatePDF, 500); };
                    img.onerror = () => { loadedImages++; if (loadedImages === images.length) setTimeout(generatePDF, 500); };
                  }
                });
              });
            </script>
          </body>
        </html>`;
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (err) { showAlert("error", "Error", "Failed to generate document."); }
    finally { setGeneratingDocId(null); }
  };

  const handleGenerateInvoice = async (id) => {
    try {
      setGeneratingInvoiceId(id);
      const res = await fetch(`${API_BASE_URL}/api/assignments/invoice/${id}`);
      const data = await res.json();
      if (!res.ok) { showAlert("error", "Error", data.error || "Failed to fetch invoice data."); return; }

      const b64HeaderImage = await fetchAsBase64('/header.png');
      const printWindow = window.open('', '_blank');
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice - ${id}</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
              body { font-family: 'Inter', 'Helvetica Neue', sans-serif; color: #1e293b; background: #f8fafc; margin: 0; padding: 20px; font-size: 14px; }
              .action-bar { text-align: center; margin-bottom: 20px; padding: 15px; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
              .print-btn { background: #10b981; color: white; border: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 15px; }
              .print-btn:hover { background: #059669; }
              #pdf-content { background: #fff; width: 210mm; min-height: 297mm; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); position: relative; box-sizing: border-box; }
              .full-header-img { width: 100%; height: auto; display: block; object-fit: cover; }
              .fallback-header { padding: 30px 20mm; background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: center; }
              .invoice-body { padding: 10mm 20mm 20mm 20mm; }
              .invoice-top { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
              .invoice-title { font-size: 36px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0; }
              .invoice-ref { font-size: 14px; color: #64748b; margin-top: 5px; }
              .billing-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
              .bill-to { width: 50%; }
              .invoice-details { width: 40%; text-align: right; }
              .section-label { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }
              .info-text { margin: 4px 0; color: #334155; line-height: 1.5; font-size: 14px; }
              .company-name { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 5px; }
              .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; margin-top: 10px; }
              .invoice-table th { background: #f8fafc; padding: 14px 16px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
              .invoice-table th.right { text-align: right; }
              .invoice-table td { padding: 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; vertical-align: top; }
              .invoice-table td.right { text-align: right; }
              .item-desc { font-weight: 600; color: #0f172a; margin-bottom: 4px; display: block; }
              .item-sub { font-size: 12px; color: #64748b; }
              .totals-wrapper { display: flex; justify-content: flex-end; margin-top: 20px; }
              .totals-table { width: 320px; border-collapse: collapse; }
              .totals-table td { padding: 10px 16px; font-size: 14px; }
              .totals-table .label { font-weight: 500; color: #475569; text-align: left; }
              .totals-table .value { text-align: right; color: #1e293b; font-weight: 500; }
              .totals-table tr.grand-total td { background: #f8fafc; border-top: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1; padding: 16px; }
              .totals-table .grand-total .label { font-size: 16px; font-weight: 700; color: #0f172a; }
              .totals-table .grand-total .value { font-size: 16px; font-weight: 700; color: #10b981; }
              .payment-terms { margin-top: 50px; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6; }
              .payment-terms h4 { margin: 0 0 8px 0; font-size: 14px; color: #0f172a; }
              .payment-terms p { margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; }
              .footer { position: absolute; bottom: 15mm; left: 20mm; right: 20mm; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
              @media print {
                @page { size: A4 portrait; margin: 0; }
                body { padding: 0; background: #fff; }
                .action-bar { display: none; }
                #pdf-content { max-width: 100%; box-shadow: none; min-height: 100vh; padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="action-bar" data-html2canvas-ignore="true">
              <p style="margin: 0 0 10px 0; color: #64748b;">Your Invoice PDF is preparing and will download automatically shortly...</p>
              <button class="print-btn" onclick="window.print()">Print Invoice Instead</button>
            </div>
            <div id="pdf-content">
              ${b64HeaderImage && b64HeaderImage !== '/header.png' ? `<img class="full-header-img pdf-image" src="${b64HeaderImage}" alt="Company Header" crossorigin="anonymous" />` : '<div class="fallback-header"><div style="font-size: 28px; font-weight: 800; color: #3b82f6; letter-spacing: 1px;">FLEET LOGISTICS</div></div>'}
              <div class="invoice-body">
                <div class="invoice-top">
                  <div>
                    <div class="invoice-title">INVOICE</div>
                    <div class="invoice-ref">REF: ${data.assignment_id.substring(0,8).toUpperCase()}</div>
                  </div>
                </div>
                <div class="billing-info">
                  <div class="bill-to">
                    <div class="section-label">Billed To</div>
                    <div class="company-name">${capitalizeFirstLetter(data.company_name) || 'N/A'}</div>
                    <div class="info-text">${capitalizeFirstLetter(data.customer_address) || 'N/A'}</div>
                    <div class="info-text">Contact: ${data.customer_contact || 'N/A'}</div>
                  </div>
                  <div class="invoice-details">
                    <div class="section-label">Invoice Details</div>
                    <div class="info-text"><strong>Issue Date:</strong> ${new Date().toLocaleDateString()}</div>
                    <div class="info-text"><strong>Trip Start:</strong> ${new Date(data.est_s_TD).toLocaleDateString()}</div>
                    <div class="info-text"><strong>Trip End:</strong> ${new Date(data.est_e_TD).toLocaleDateString()}</div>
                  </div>
                </div>
                <table class="invoice-table">
                  <thead>
                    <tr>
                      <th>Description</th><th>Vehicle</th><th class="right">Distance (KMS)</th><th class="right">Rate/KM</th><th class="right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span class="item-desc">Transportation Service</span><span class="item-sub">Route: ${data.start_location} to ${data.end_location}</span></td>
                      <td>${toUpper(data.vehicle_number)}</td>
                      <td class="right">${data.totalKMS}</td>
                      <td class="right">Rs. ${parseFloat(data.company_rate).toFixed(2)}</td>
                      <td class="right">Rs. ${parseFloat(data.company_payment).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                <div class="totals-wrapper">
                  <table class="totals-table">
                    <tr><td class="label">Subtotal</td><td class="value">Rs. ${parseFloat(data.company_payment).toFixed(2)}</td></tr>
                    <tr><td class="label">Tax (0%)</td><td class="value">Rs. 0.00</td></tr>
                    <tr class="grand-total"><td class="label">Total Due</td><td class="value">Rs. ${parseFloat(data.company_payment).toFixed(2)}</td></tr>
                  </table>
                </div>
                <div class="payment-terms">
                  <h4>Payment Terms</h4>
                  <p>Please make payment within 14 days of receiving this invoice. Thank you for your business!</p>
                </div>
                <div class="footer">Invoice Generated by Fleet Management System</div>
              </div>
            </div>
            <script>
              function generatePDF() {
                if (typeof html2pdf === 'undefined') { setTimeout(generatePDF, 100); return; }
                const element = document.getElementById('pdf-content');
                const opt = { margin: 0, filename: 'Invoice_${data.assignment_id.substring(0,8)}.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, pagebreak: { mode: 'css' } };
                html2pdf().set(opt).from(element).save();
              }
              window.addEventListener('load', () => {
                const images = Array.from(document.querySelectorAll('.pdf-image'));
                let loadedImages = 0;
                if (images.length === 0) { setTimeout(generatePDF, 500); return; }
                images.forEach(img => {
                  if (img.complete && img.naturalHeight !== 0) { loadedImages++; if (loadedImages === images.length) setTimeout(generatePDF, 500); }
                  else {
                    img.onload = () => { loadedImages++; if (loadedImages === images.length) setTimeout(generatePDF, 500); };
                    img.onerror = () => { loadedImages++; if (loadedImages === images.length) setTimeout(generatePDF, 500); };
                  }
                });
              });
            </script>
          </body>
        </html>`;
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (err) { showAlert("error", "Error", "Failed to generate Invoice."); }
    finally { setGeneratingInvoiceId(null); }
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .dashboard-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 108px 24px 60px;
        }

        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .dash-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .dash-header-icon {
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

        .dash-header-icon svg {
          width: 26px;
          height: 26px;
          stroke: #ffffff;
          fill: none;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .dash-title {
          font-size: 26px;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .dash-subtitle {
          font-size: 13px;
          color: #64748b;
          font-weight: 400;
          margin-top: 2px;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .new-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          border: none;
          padding: 11px 20px;
          border-radius: 11px;
          font-weight: 600;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: 0.1px;
        }

        .new-btn:hover {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.42);
        }

        .new-btn svg {
          width: 16px;
          height: 16px;
          stroke: #ffffff;
          fill: none;
          stroke-width: 2.2;
          stroke-linecap: round;
        }

        .back-btn {
          background: #ffffff;
          color: #475569;
          border: 1.5px solid #e2e8f0;
          padding: 11px 20px;
          border-radius: 11px;
          font-weight: 600;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }

        .back-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .back-btn svg {
          width: 16px;
          height: 16px;
          stroke: #475569;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
          background: #ffffff;
          border-radius: 12px;
          padding: 5px;
          box-shadow: 0 1px 3px rgba(59,130,246,0.08), 0 0 0 1px rgba(191,219,254,0.5);
          width: fit-content;
          flex-wrap: wrap;
        }

        .tab-btn {
          background: transparent;
          border: none;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          color: #64748b;
          padding: 9px 18px;
          cursor: pointer;
          border-radius: 9px;
          transition: background 0.2s, color 0.2s;
          display: flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
        }

        .tab-btn svg {
          width: 15px;
          height: 15px;
          stroke: currentColor;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1d4ed8;
          box-shadow: 0 1px 4px rgba(59,130,246,0.15);
        }

        .tab-btn:hover:not(.active) {
          background: #f8fafc;
          color: #475569;
        }

        .card {
          background: #ffffff;
          border-radius: 18px;
          padding: 28px;
          box-shadow: 0 4px 6px rgba(59,130,246,0.06), 0 16px 48px rgba(59,130,246,0.1), 0 0 0 1px rgba(191,219,254,0.4);
          animation: fadeIn 0.4s ease both;
          overflow-x: auto;
        }

        /* ── Filter / Search Bar ── */
        .filter-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          padding: 14px 16px;
          background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%);
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
        }

        .filter-search-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .filter-search-wrap svg {
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

        .filter-search-input {
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

        .filter-search-input::placeholder { color: #94a3b8; }

        .filter-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .filter-month-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .filter-month-wrap svg {
          width: 15px;
          height: 15px;
          stroke: #3b82f6;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex-shrink: 0;
        }

        .filter-month-label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
        }

        .filter-month-input {
          padding: 8px 12px;
          font-size: 13.5px;
          font-family: 'Inter', sans-serif;
          color: #1e293b;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .filter-month-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .filter-clear-btn {
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

        .filter-clear-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .filter-clear-btn svg {
          width: 13px;
          height: 13px;
          stroke: #94a3b8;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
        }

        .filter-result-count {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 500;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── Data Table ── */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          min-width: 640px;
        }

        .data-table thead tr {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        }

        .data-table th {
          padding: 14px 16px;
          color: #ffffff;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.7px;
        }

        .data-table th:first-child { border-radius: 10px 0 0 10px; }
        .data-table th:last-child { border-radius: 0 10px 10px 0; }

        .data-table td {
          padding: 15px 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
          font-size: 14px;
          vertical-align: middle;
        }

        .data-table tbody tr:last-child td { border-bottom: none; }

        .data-table tbody tr:hover td {
          background: #f0f9ff;
        }

        .table-empty td {
          text-align: center;
          padding: 48px 20px;
          color: #94a3b8;
          font-size: 14px;
        }

        .table-empty-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }

        .table-empty-icon svg {
          width: 40px;
          height: 40px;
          stroke: #cbd5e1;
          fill: none;
          stroke-width: 1.3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 11px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .badge svg {
          width: 9px;
          height: 9px;
          stroke: currentColor;
          fill: none;
          stroke-width: 2.5;
          stroke-linecap: round;
        }

        .badge.ongoing {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #b45309;
          border: 1px solid #fcd34d;
        }

        .badge.completed {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #065f46;
          border: 1px solid #6ee7b7;
        }

        .complete-action-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          width: 100%;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(16,185,129,0.28);
        }

        .complete-action-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .complete-action-btn svg {
          width: 13px; height: 13px; stroke: #ffffff; fill: none; stroke-width: 2;
          stroke-linecap: round; stroke-linejoin: round;
        }

        .doc-action-btn {
          background: #ffffff; color: #3b82f6; border: 1.5px solid #bfdbfe;
          padding: 8px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 600;
          font-family: 'Inter', sans-serif; cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s, opacity 0.2s;
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        .doc-action-btn:hover:not(:disabled) { background: #f0f9ff; border-color: #3b82f6; transform: translateY(-1px); }
        .doc-action-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .doc-action-btn svg {
          width: 13px; height: 13px; stroke: #3b82f6; fill: none;
          stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
        }

        .invoice-action-btn {
          background: #ffffff; color: #059669; border: 1.5px solid #6ee7b7;
          padding: 8px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 600;
          font-family: 'Inter', sans-serif; cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s, opacity 0.2s;
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        .invoice-action-btn:hover:not(:disabled) { background: #ecfdf5; border-color: #10b981; transform: translateY(-1px); }
        .invoice-action-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .invoice-action-btn svg {
          width: 13px; height: 13px; stroke: #059669; fill: none;
          stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
        }

        /* ── Button inline spinner ── */
        .btn-spinner {
          width: 13px;
          height: 13px;
          border: 2px solid rgba(59,130,246,0.3);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        .btn-spinner-green {
          width: 13px;
          height: 13px;
          border: 2px solid rgba(5,150,105,0.3);
          border-top-color: #059669;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        .report-month-bar {
          display: flex; align-items: center; gap: 12px; margin-bottom: 22px; flex-wrap: wrap;
        }

        .report-month-label {
          font-size: 13.5px; font-weight: 600; color: #475569;
          display: flex; align-items: center; gap: 7px;
        }

        .report-month-label svg {
          width: 15px; height: 15px; stroke: #3b82f6; fill: none;
          stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round;
        }

        .report-month-input {
          padding: 8px 13px; border: 1.5px solid #e2e8f0; border-radius: 9px;
          font-size: 14px; font-family: 'Inter', sans-serif; color: #1e293b;
          background: #f8fafc; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }

        .report-month-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }

        .driver-payment-card {
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px;
          padding: 22px; margin-bottom: 20px; transition: box-shadow 0.2s;
        }

        .driver-payment-card:hover { box-shadow: 0 4px 18px rgba(59,130,246,0.1); }

        .driver-payment-header {
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1.5px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 16px;
          flex-wrap: wrap; gap: 12px;
        }

        .driver-payment-name {
          font-size: 17px; font-weight: 700; color: #1e293b;
          display: flex; align-items: center; gap: 9px;
        }

        .driver-payment-name svg {
          width: 18px; height: 18px; stroke: #3b82f6; fill: none;
          stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round;
        }

        .driver-earnings-badge {
          font-size: 14.5px; font-weight: 700; color: #065f46;
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          border: 1px solid #6ee7b7; padding: 7px 16px; border-radius: 10px;
          display: flex; align-items: center; gap: 7px;
        }

        .driver-earnings-badge svg {
          width: 15px; height: 15px; stroke: #065f46; fill: none;
          stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round;
        }

        .driver-sub-table {
          width: 100%; border-collapse: collapse; background: #ffffff;
          border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(59,130,246,0.07);
        }

        .driver-sub-table thead tr { background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%); }

        .driver-sub-table th {
          padding: 11px 14px; font-size: 11.5px; font-weight: 700; color: #1e40af;
          text-transform: uppercase; letter-spacing: 0.6px; border-bottom: 1.5px solid #bfdbfe;
        }

        .driver-sub-table td {
          padding: 11px 14px; border-bottom: 1px solid #f1f5f9;
          font-size: 13.5px; color: #1e293b;
        }

        .driver-sub-table tbody tr:last-child td { border-bottom: none; }
        .driver-sub-table tbody tr:hover td { background: #f0f9ff; }

        .modal-overlay {
          position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; backdrop-filter: blur(5px); padding: 20px;
        }

        .modal-content {
          background: #ffffff; border-radius: 20px; padding: 38px 34px 32px;
          width: 100%; max-width: 420px; text-align: center;
          box-shadow: 0 20px 60px rgba(15,23,42,0.25), 0 0 0 1px rgba(191,219,254,0.4);
          animation: modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
          font-family: 'Inter', sans-serif;
        }

        .modal-icon {
          width: 62px; height: 62px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 18px;
        }

        .modal-icon svg { width: 28px; height: 28px; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
        .modal-icon.success { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
        .modal-icon.success svg { stroke: #2563eb; }
        .modal-icon.error { background: linear-gradient(135deg, #fee2e2, #fecaca); }
        .modal-icon.error svg { stroke: #ef4444; }

        .msg-title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 10px; letter-spacing: -0.3px; }

        .modal-message { color: #64748b; font-size: 14.5px; line-height: 1.65; margin-bottom: 4px; }

        .msg-btn {
          padding: 11px 28px; font-size: 14.5px; font-weight: 600;
          font-family: 'Inter', sans-serif; color: #ffffff;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: none; border-radius: 11px; cursor: pointer; width: 100%;
          margin-top: 22px; box-shadow: 0 4px 14px rgba(37,99,235,0.3);
          transition: opacity 0.2s, transform 0.15s;
        }

        .msg-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .msg-btn.error-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 4px 14px rgba(239,68,68,0.3);
        }

        .kms-modal-title {
          font-size: 19px; font-weight: 700; color: #1e293b; margin-bottom: 8px;
          display: flex; align-items: center; justify-content: center; gap: 9px; letter-spacing: -0.3px;
        }

        .kms-modal-title svg {
          width: 22px; height: 22px; stroke: #3b82f6; fill: none;
          stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round;
        }

        .form-input {
          width: 100%; padding: 12px 14px; font-size: 15px; font-family: 'Inter', sans-serif;
          border: 1.5px solid #e2e8f0; border-radius: 10px; margin-top: 16px; outline: none;
          background: #f8fafc; color: #1e293b; transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3.5px rgba(59,130,246,0.12); background: #fff; }

        .kms-btn-row { display: flex; gap: 10px; margin-top: 20px; }

        .cancel-btn {
          flex: 1; padding: 11px; font-size: 14px; font-weight: 600;
          font-family: 'Inter', sans-serif; color: #475569; background: #f1f5f9;
          border: 1.5px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: background 0.2s;
        }

        .cancel-btn:hover { background: #e2e8f0; }

        .confirm-btn {
          flex: 1; padding: 11px; font-size: 14px; font-weight: 700;
          font-family: 'Inter', sans-serif; color: #ffffff;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none; border-radius: 10px; cursor: pointer;
          box-shadow: 0 4px 14px rgba(16,185,129,0.3); transition: opacity 0.2s, transform 0.15s;
        }

        .confirm-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .confirm-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .ud-spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite;
          display: inline-block; vertical-align: middle; margin-right: 6px;
        }

        .route-arrow { color: #94a3b8; font-size: 12px; margin: 0 4px; }

        @media (max-width: 900px) {
          .dashboard-container { padding: 100px 15px 40px; }
          .dash-title { font-size: 20px; }
          .tabs { width: 100%; }
          .tab-btn { font-size: 13px; padding: 8px 13px; }
          .filter-bar { flex-direction: column; align-items: stretch; }
          .filter-search-wrap { min-width: unset; }
        }

        @media (max-width: 600px) {
          .dash-header { flex-direction: column; align-items: flex-start; }
          .action-buttons { width: 100%; }
          .new-btn, .back-btn { flex: 1; justify-content: center; }
          .driver-payment-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <Header userId={userId} />

      <div className="dashboard-container">

        {/* ── Header ── */}
        <div className="dash-header">
          <div className="dash-header-left">
            <div className="dash-header-icon">
              <svg viewBox="0 0 24 24">
                <rect x="1" y="3" width="15" height="13" rx="1"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div>
              <div className="dash-title">Fleet Management Dashboard</div>
              <div className="dash-subtitle">Manage assignments, track trips and driver payments</div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="back-btn" onClick={() => router.push(`/userDashboard?userId=${userId}`)}>
              <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back
            </button>
            <button className="new-btn" onClick={() => router.push(`/newAssaignment?userId=${userId}`)}>
              <svg viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Assignment
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'ongoing' ? 'active' : ''}`} onClick={() => setActiveTab('ongoing')}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Ongoing Assignments
          </button>
          <button className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
            <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Completed Assignments
          </button>
          <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            Driver Payments
          </button>
        </div>

        {/* ── Main Card ── */}
        <div className="card">

          {/* ONGOING TAB */}
          {activeTab === 'ongoing' && (
            <>
              <div className="filter-bar">
                <div className="filter-search-wrap">
                  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    type="text"
                    className="filter-search-input"
                    placeholder="Search by vehicle number, driver name or customer..."
                    value={ongoingSearch}
                    onChange={e => setOngoingSearch(e.target.value)}
                  />
                </div>
                <div className="filter-month-wrap">
                  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  <span className="filter-month-label">Month:</span>
                  <input
                    type="month"
                    className="filter-month-input"
                    value={ongoingMonth}
                    onChange={e => setOngoingMonth(e.target.value)}
                  />
                </div>
                {(ongoingSearch || ongoingMonth) && (
                  <button className="filter-clear-btn" onClick={() => { setOngoingSearch(''); setOngoingMonth(''); }}>
                    <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Clear
                  </button>
                )}
                <span className="filter-result-count">{filteredOngoing.length} result{filteredOngoing.length !== 1 ? 's' : ''}</span>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Start Date</th>
                    <th>Customer</th>
                    <th>Driver & Vehicle</th>
                    <th>Route</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right', minWidth: '160px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOngoing.length === 0 ? (
                    <tr className="table-empty">
                      <td colSpan="6">
                        <div className="table-empty-icon">
                          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        {ongoingSearch || ongoingMonth ? 'No results match your search or filter.' : 'No ongoing assignments right now.'}
                      </td>
                    </tr>
                  ) : null}
                  {filteredOngoing.map(job => (
                    <tr key={job.assignment_id}>
                      <td style={{ fontSize: 13 }}>{new Date(job.est_s_TD).toLocaleString()}</td>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{capitalizeFirstLetter(job.company_name)}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{capitalizeFirstLetter(job.driver_name)}</span><br />
                        <span style={{ fontSize: 12, color: '#64748b' }}>{toUpper(job.vehicle_number)}</span>
                      </td>
                      <td style={{ fontSize: 13 }}>{capitalizeFirstLetter(job.start_location)}<span className="route-arrow">→</span>{capitalizeFirstLetter(job.end_location)}</td>
                      <td>
                        <span className="badge ongoing">
                          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>
                          In Transit
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="complete-action-btn" onClick={() => handleOpenKmsModal(job.assignment_id)}>
                          <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                          Enter KMS
                        </button>
                        <button
                          className="doc-action-btn"
                          onClick={() => handleGenerateDoc(job.assignment_id)}
                          disabled={generatingDocId === job.assignment_id}
                        >
                          {generatingDocId === job.assignment_id ? (
                            <><div className="btn-spinner" /> Generating...</>
                          ) : (
                            <><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>Generate Doc</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* COMPLETED TAB */}
          {activeTab === 'completed' && (
            <>
              <div className="filter-bar">
                <div className="filter-search-wrap">
                  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    type="text"
                    className="filter-search-input"
                    placeholder="Search by vehicle number, driver name or customer..."
                    value={completedSearch}
                    onChange={e => setCompletedSearch(e.target.value)}
                  />
                </div>
                <div className="filter-month-wrap">
                  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  <span className="filter-month-label">Month:</span>
                  <input
                    type="month"
                    className="filter-month-input"
                    value={completedMonth}
                    onChange={e => setCompletedMonth(e.target.value)}
                  />
                </div>
                {(completedSearch || completedMonth) && (
                  <button className="filter-clear-btn" onClick={() => { setCompletedSearch(''); setCompletedMonth(''); }}>
                    <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Clear
                  </button>
                )}
                <span className="filter-result-count">{filteredCompleted.length} result{filteredCompleted.length !== 1 ? 's' : ''}</span>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Completed Date</th>
                    <th>Customer & Route</th>
                    <th>Driver Details</th>
                    <th>Total KMS</th>
                    <th>Customer Billed</th>
                    <th>Driver Pay</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right', minWidth: '155px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompleted.length === 0 ? (
                    <tr className="table-empty">
                      <td colSpan="8">
                        <div className="table-empty-icon">
                          <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                        {completedSearch || completedMonth ? 'No results match your search or filter.' : 'No completed assignments yet.'}
                      </td>
                    </tr>
                  ) : null}
                  {filteredCompleted.map(job => (
                    <tr key={job.assignment_id}>
                      <td style={{ fontSize: 13 }}>{new Date(job.est_e_TD).toLocaleDateString()}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{capitalizeFirstLetter(job.company_name)}</span><br />
                        <span style={{ fontSize: 12, color: '#64748b' }}>{capitalizeFirstLetter(job.start_location)}<span className="route-arrow">→</span>{capitalizeFirstLetter(job.end_location)}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{capitalizeFirstLetter(job.driver_name)}</span><br />
                        <span style={{ fontSize: 12, color: '#64748b' }}>{toUpper(job.vehicle_number)}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#1e293b' }}>{job.totalKMS} km</td>
                      <td style={{ fontWeight: 700, color: '#dc2626' }}>Rs {job.company_payment}</td>
                      <td style={{ fontWeight: 700, color: '#16a34a' }}>Rs {job.driver_payment}</td>
                      <td>
                        <span className="badge completed">
                          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                          Completed
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="invoice-action-btn"
                          onClick={() => handleGenerateInvoice(job.assignment_id)}
                          disabled={generatingInvoiceId === job.assignment_id}
                        >
                          {generatingInvoiceId === job.assignment_id ? (
                            <><div className="btn-spinner-green" /> Generating...</>
                          ) : (
                            <><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>Generate Invoice</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* DRIVER PAYMENTS TAB */}
          {activeTab === 'reports' && (
            <div>
              <div className="filter-bar">
                <div className="filter-search-wrap">
                  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    type="text"
                    className="filter-search-input"
                    placeholder="Search by driver name..."
                    value={reportsSearch}
                    onChange={e => setReportsSearch(e.target.value)}
                  />
                </div>
                <div className="filter-month-wrap">
                  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  <span className="filter-month-label">Month:</span>
                  <input
                    type="month"
                    className="filter-month-input"
                    value={reportMonth}
                    onChange={e => setReportMonth(e.target.value)}
                  />
                </div>
                {reportsSearch && (
                  <button className="filter-clear-btn" onClick={() => setReportsSearch('')}>
                    <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Clear
                  </button>
                )}
                <span className="filter-result-count">{filteredReportsPayments.length} driver{filteredReportsPayments.length !== 1 ? 's' : ''}</span>
              </div>

              {filteredReportsPayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                    </svg>
                  </div>
                  {reportsSearch ? 'No drivers match your search.' : 'No driver payments found for this month.'}
                </div>
              ) : null}

              {filteredReportsPayments.map((driver, idx) => (
                <div key={idx} className="driver-payment-card">
                  <div className="driver-payment-header">
                    <div className="driver-payment-name">
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                      {capitalizeFirstLetter(driver.driver_name)}
                    </div>
                    <div className="driver-earnings-badge">
                      <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                      Total Earnings: Rs {parseFloat(driver.total_pay).toFixed(2)}
                    </div>
                  </div>

                  <table className="driver-sub-table">
                    <thead>
                      <tr>
                        <th>Date Completed</th>
                        <th>Route</th>
                        <th>Distance</th>
                        <th style={{ textAlign: 'right' }}>Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driver.assignments.map(a => (
                        <tr key={a.assignment_id}>
                          <td>{new Date(a.date).toLocaleDateString()}</td>
                          <td>{capitalizeFirstLetter(a.route)}</td>
                          <td>{a.kms} km</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>
                            Rs {parseFloat(a.payment).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── KMS ENTRY MODAL ── */}
      {kmsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="kms-modal-title">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Complete Assignment
            </div>
            <p className="modal-message" style={{ marginTop: 4 }}>
              Enter the total kilometers driven to finalize this trip and calculate payments.
            </p>

            <input
              type="number"
              placeholder="e.g., 145.5"
              value={totalKMS}
              onChange={(e) => setTotalKMS(e.target.value)}
              className="form-input"
              step="0.01"
            />

            <div className="kms-btn-row">
              <button className="cancel-btn" onClick={() => setKmsModalOpen(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleCompleteTrip} disabled={isSubmitting}>
                {isSubmitting ? <><span className="ud-spinner" />Processing...</> : "Submit & Complete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GLOBAL ALERTS ── */}
      <AlertDialog
        isOpen={dialog.isOpen}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        onConfirm={dialog.onConfirm}
      />
    </>
  );
}

export default function FleetDashboard() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '16px', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: '44px', height: '44px', border: '3px solid #bfdbfe',
          borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '17px', fontWeight: '500', color: '#64748b' }}>Loading...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <FleetDashboardContent />
    </Suspense>
  );
}