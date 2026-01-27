'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import axios from "axios";
import Header from "../../components/userHeader";

const API_BASE_URL = "http://localhost:5000"; 

const initialFormData = {
  regNo: "",
  licenseExpiry: "",
  insuranceExpiry: "",
  vehiclePhoto: null,
  licensePhoto: null,
  insurancePhoto: null,
  bookCopyPhoto: null,
  category: "", 
  vehicleType: "",
  owner_id: "",
};

const initialPreviews = {
  vehiclePhoto: "",
  licensePhoto: "",
  insurancePhoto: "",
  bookCopyPhoto: "",
};

const SearchableSelect = ({ options, value, onChange, placeholder, labelKey, valueKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    const selected = options.find(opt => opt[valueKey] === value);
    if (selected) {
      setSearchTerm(selected[labelKey]);
    } 
    // Removed the else block that clears searchTerm if value is empty.
    // This allows the user to type to filter without the input clearing itself immediately
    // because we clear the parent value on type.
  }, [value, options, labelKey, valueKey]);

  const filteredOptions = options.filter(opt => 
    opt[labelKey].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="searchable-select-wrapper" ref={wrapperRef}>
      <input 
        type="text" 
        className="form-input" 
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
          // If the user types manually, clear the selected parent value.
          // This forces them to select from the list (or add new), preventing custom typed text submission.
          if (value) onChange(""); 
        }}
        onClick={() => setIsOpen(true)}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className="searchable-options">
          {filteredOptions.map((opt) => (
            <li 
              key={opt[valueKey]} 
              onClick={() => {
                onChange(opt[valueKey]);
                setSearchTerm(opt[labelKey]);
                setIsOpen(false);
              }}
            >
              {opt[labelKey]} {opt.contact ? `(${opt.contact})` : ''}
            </li>
          ))}
        </ul>
      )}
      {isOpen && filteredOptions.length === 0 && (
          <div className="no-options">No results found</div>
      )}
    </div>
  );
};

const AddVehiclePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [formData, setFormData] = useState(initialFormData);
  const [previews, setPreviews] = useState(initialPreviews);
  const [categories, setCategories] = useState([]);
  const [owners, setOwners] = useState([]);
  
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [isAddingOwner, setIsAddingOwner] = useState(false);
  const [newOwnerData, setNewOwnerData] = useState({ id: "", name: "", contact: "" });

  const [regNoExists, setRegNoExists] = useState(false);
  const [regNoChecking, setRegNoChecking] = useState(false);

  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "", 
    title: "",
    message: "",
    list: []
  });

  const [errors, setErrors] = useState({});
  const topRef = useRef(null);

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [catRes, ownerRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/category/categories`),
        axios.get(`${API_BASE_URL}/owner/owners`)
      ]);
      setCategories(catRes.data);
      setOwners(ownerRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const checkReg = async () => {
      if (!formData.regNo || formData.regNo.length < 5) {
          setRegNoExists(false);
          return;
      }
      setRegNoChecking(true);
      try {
        const res = await axios.post(`${API_BASE_URL}/vehicle/checkRegistration`, { regNo: formData.regNo });
        setRegNoExists(res.data.exists);
      } catch (err) {
        console.error("Check failed");
      } finally {
        setRegNoChecking(false);
      }
    };

    const timeoutId = setTimeout(() => {
        checkReg();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.regNo]);


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      if (!file || !file.type.startsWith("image/")) {
        e.target.value = '';
        return;
      }
      setFormData({ ...formData, [name]: file });
      setErrors({ ...errors, [name]: "" });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleRemoveImage = (field) => {
    setFormData((prev) => ({ ...prev, [field]: null }));
    setPreviews((prev) => ({ ...prev, [field]: "" }));
    const fileInput = document.querySelector(`input[name="${field}"]`);
    if (fileInput) fileInput.value = '';
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
    if (dialog.type === 'success') {
       window.location.reload();
    }
  };


  const handleAddCategory = async () => {
    // Validation 5: All inputs mandatory (Name)
    if (!newCategoryName.trim()) {
        setDialog({ isOpen: true, type: "error", title: "Validation Error", message: "Category Name is required." });
        return;
    }
    // Validation 4: Keep existing validation (max 50)
    if (newCategoryName.length > 50) {
        setDialog({ isOpen: true, type: "error", title: "Validation Error", message: "Category name max 50 characters." });
        return;
    }
    setIsAddingCategory(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/category/categories`, { category_name: newCategoryName });
      await fetchData(); 
      setFormData(prev => ({ ...prev, category: res.data.category_id }));
      setNewCategoryName("");
      setShowCategoryModal(false);
    } catch (err) {
      setDialog({ isOpen: true, type: "error", title: "Error", message: "Failed to add category." });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleAddOwner = async () => {
    // Validation 5: All inputs mandatory
    if (!newOwnerData.id || !newOwnerData.name || !newOwnerData.contact) {
        setDialog({ isOpen: true, type: "error", title: "Validation Error", message: "All fields are required for Owner registration." });
        return;
    }

    // Validation 3: Owner Identity Check (12 digits OR 9 digits + v/V)
    const idRegex = /^(\d{12}|\d{9}[vV])$/;
    if (!idRegex.test(newOwnerData.id)) {
        setDialog({ isOpen: true, type: "error", title: "Validation Error", message: "Owner ID must be either 12 digits or 9 digits followed by 'v'." });
        return;
    }

    // Validation 3: Name max 250
    if (newOwnerData.name.length > 250) {
        setDialog({ isOpen: true, type: "error", title: "Validation Error", message: "Owner Name cannot exceed 250 characters." });
        return;
    }

    // Validation 3: Mobile Number Check (Start with 0 -> 10 digits | Start with +94 -> 12 characters)
    // ^0\d{9}$ matches 0 followed by exactly 9 digits (total 10)
    // ^\+94\d{9}$ matches +94 followed by exactly 9 digits (total 12)
    const mobileRegex = /^(0\d{9}|\+94\d{9})$/;
    if (!mobileRegex.test(newOwnerData.contact)) {
        setDialog({ isOpen: true, type: "error", title: "Validation Error", message: "Invalid Mobile Number. Must start with '0' (10 digits) or '+94' (12 characters)." });
        return;
    }

    setIsAddingOwner(true);
    try {
      // POST to add owner
      const res = await axios.post(`${API_BASE_URL}/owner/add`, {
          owner_id: newOwnerData.id,
          name: newOwnerData.name,
          contact: newOwnerData.contact
      });
      await fetchData();
      setFormData(prev => ({ ...prev, owner_id: newOwnerData.id }));
      setNewOwnerData({ id: "", name: "", contact: "" });
      setShowOwnerModal(false);
    } catch (err) {
      setDialog({ 
          isOpen: true, 
          type: "error", 
          title: "Error", 
          message: err.response?.data?.message || "Failed to add owner." 
      });
    } finally {
      setIsAddingOwner(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    const validationErrorsObj = {};
    const validationErrorsList = [];
    
    // Validation 1: Keep existing regNo validation
    const regNoRegex = /^([A-Z]{2}-[A-Z]{2,3}-\d{4}|\d{2}-\d{4}|[A-Z]{2}-\d{2}-\d{4}|\d{3}-\d{4}|[A-Z]{2}-\d{3}-\d{4})$/i;
    if (!regNoRegex.test(formData.regNo)) {
       validationErrorsObj.regNo = "Invalid Format";
       validationErrorsList.push("Registration Number: Invalid format");
    }
    if (regNoExists) {
        validationErrorsObj.regNo = "Already Exists";
        validationErrorsList.push("This Vehicle Number is already registered.");
    }

    // Validation 2: Owner ID must be selected (cannot be just typed, controlled by SearchableSelect logic)
    if (!formData.owner_id) {
        validationErrorsObj.owner_id = "Required";
        validationErrorsList.push("Owner is required. Please select from the list or register a new one.");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.licenseExpiry) {
          validationErrorsObj.licenseExpiry = "Required";
          validationErrorsList.push("License Expiry Date is required");
    } else if (new Date(formData.licenseExpiry) <= today) {
          validationErrorsObj.licenseExpiry = "Invalid Date";
          validationErrorsList.push("License Expiry must be a future date.");
    }

    if (!formData.insuranceExpiry) {
          validationErrorsObj.insuranceExpiry = "Required";
          validationErrorsList.push("Insurance Expiry Date is required");
    } else if (new Date(formData.insuranceExpiry) <= today) {
          validationErrorsObj.insuranceExpiry = "Invalid Date";
          validationErrorsList.push("Insurance Expiry must be a future date.");
    }

    // Validation 3: Category must be selected
    if (!formData.category) {
        validationErrorsObj.category = "Required";
        validationErrorsList.push("Category is required. Please select from the list or add a new one.");
    }
    
    // Validation 5: All inputs mandatory (Vehicle Type, Bank details, Photos)
    if (!formData.vehicleType) {
        validationErrorsObj.vehicleType = "Required";
        validationErrorsList.push("Vehicle Type is required");
    }
    if (!formData.vehiclePhoto) {
        validationErrorsObj.vehiclePhoto = "Required";
        validationErrorsList.push("Vehicle Photo is required");
    }
    if (!formData.licensePhoto) {
        validationErrorsObj.licensePhoto = "Required";
        validationErrorsList.push("License Photo is required");
    }
    if (!formData.insurancePhoto) {
        validationErrorsObj.insurancePhoto = "Required";
        validationErrorsList.push("Insurance Photo is required");
    }
    if (!formData.bookCopyPhoto) {
        validationErrorsObj.bookCopyPhoto = "Required";
        validationErrorsList.push("Book Copy Photo is required");
    }

    if (validationErrorsList.length > 0) {
      setErrors(validationErrorsObj);
      setDialog({
          isOpen: true,
          type: "error",
          title: "Validation Error",
          message: "Please fix the following issues:",
          list: validationErrorsList
      });
      return;
    }

    const data = new FormData();
    data.append("registrationNumber", formData.regNo.toLowerCase());
    data.append("owner_id", formData.owner_id);
    data.append("vehiclePhoto", formData.vehiclePhoto);
    data.append("licensePhoto", formData.licensePhoto);
    data.append("licenseExpiry", formData.licenseExpiry);
    data.append("insurancePhoto", formData.insurancePhoto);
    data.append("insuranceExpiry", formData.insuranceExpiry);
    data.append("bookCopyPhoto", formData.bookCopyPhoto);
    data.append("category", formData.category);
    data.append("vehicleType", formData.vehicleType);
    data.append("bankName", formData.bankName);
    data.append("branch", formData.branch);
    data.append("accountNumber", formData.accountNumber);

    try {
      setIsSubmitting(true);
      await axios.post(`${API_BASE_URL}/vehicle/add`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDialog({ isOpen: true, type: "success", title: "Success", message: "Vehicle successfully registered!" });
    } catch (err) {
      setDialog({
          isOpen: true,
          type: "error",
          title: "Submission Error",
          message: err.response?.data?.message || "Error adding vehicle."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .add-vehicle-page { 
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%); 
          min-height: 100vh; 
          padding: 120px 20px 40px; 
        }
        
        .form-container { 
          max-width: 900px; 
          margin: 0 auto; 
          background: white; 
          padding: 45px; 
          border-radius: 20px; 
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12); 
          border: 1px solid #e0f2fe;
          animation: fadeIn 0.6s ease-out;
        }
        
        .form-title { 
          font-size: 32px; 
          font-weight: 800; 
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 35px; 
          text-align: center; 
        }
        
        .grid-container { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 24px; 
        }
        
        .full-width { grid-column: span 2; }
        
        .input-group { 
          margin-bottom: 0; 
          position: relative; 
        }
        
        .input-label { 
          display: block; 
          font-weight: 600; 
          margin-bottom: 10px; 
          color: #475569; 
          font-size: 14px; 
        }
        
        .form-input, .form-select { 
          width: 100%; 
          padding: 13px 16px; 
          border: 2px solid #e2e8f0; 
          border-radius: 10px; 
          outline: none; 
          transition: all 0.2s; 
          background: #f8fafc;
          color: #1e293b;
          font-size: 14px;
        }
        
        .form-input:focus, .form-select:focus { 
          border-color: #3b82f6; 
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: white;
        }
        
        .error-text { 
          color: #3b82f6; 
          font-size: 12px; 
          margin-top: 6px; 
          font-weight: 500;
        }
        
        .preview-image { 
          width: 100%; 
          height: 220px; 
          object-fit: cover; 
          margin-top: 12px; 
          border-radius: 12px; 
          border: 2px solid #e0f2fe;
        }
        
        /* Searchable Select Styles */
        .searchable-select-wrapper { position: relative; }
        
        .searchable-options { 
          position: absolute; 
          top: 100%; 
          left: 0; 
          width: 100%; 
          max-height: 220px; 
          overflow-y: auto; 
          background: white; 
          border: 2px solid #e0f2fe; 
          border-radius: 10px; 
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15); 
          z-index: 50; 
          list-style: none; 
          padding: 0; 
          margin: 6px 0 0 0; 
        }
        
        .searchable-options li { 
          padding: 12px 16px; 
          cursor: pointer; 
          border-bottom: 1px solid #f0f9ff; 
          font-size: 14px; 
          color: #475569;
          transition: all 0.2s;
        }
        
        .searchable-options li:hover { 
          background: #f0f9ff; 
          color: #1e40af; 
        }
        
        .no-options { 
          position: absolute; 
          top: 100%; 
          background: white; 
          padding: 12px 16px; 
          width: 100%; 
          border: 2px solid #e0f2fe; 
          border-radius: 10px;
          font-size: 13px; 
          color: #64748b; 
          z-index: 50; 
          margin: 6px 0 0 0;
        }

        .spinner { 
          width: 16px; 
          height: 16px; 
          border: 2px solid rgba(255,255,255,0.3); 
          border-top: 2px solid white; 
          border-radius: 50%; 
          animation: spin 0.8s linear infinite; 
          display: inline-block; 
          margin-right: 8px; 
        }

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
          animation: fadeIn 0.3s ease-out;
        }
        
        .modal-content { 
          background: white; 
          padding: 30px; 
          border-radius: 16px; 
          width: 440px; 
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25); 
          border: 1px solid #e0f2fe;
          animation: slideIn 0.4s ease-out;
        }

        .modal-content h3 {
          font-size: 22px;
          font-weight: 700;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 20px;
        }
        
        .add-cat-btn { 
          background: none; 
          border: none; 
          color: #3b82f6; 
          font-weight: 600; 
          cursor: pointer; 
          margin-top: 6px; 
          font-size: 13px; 
          transition: all 0.2s;
        }

        .add-cat-btn:hover {
          color: #1e40af;
        }

        .submit-button { 
          width: 100%; 
          padding: 16px; 
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
          color: white; 
          border: none; 
          border-radius: 12px; 
          font-size: 16px; 
          font-weight: 600; 
          cursor: pointer; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          margin-top: 25px; 
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
          transition: all 0.3s;
        }
        
        .submit-button:hover:not(:disabled) { 
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
        }
        
        .submit-button:disabled { 
          opacity: 0.7; 
          cursor: not-allowed;
        }
        
        .back-button { 
          width: 100%; 
          padding: 14px; 
          background: white; 
          color: #3b82f6; 
          border: 2px solid #bfdbfe; 
          border-radius: 12px; 
          font-size: 16px; 
          font-weight: 600; 
          cursor: pointer; 
          margin-top: 12px; 
          transition: all 0.2s;
        }

        .back-button:hover {
          background: #f0f9ff;
          border-color: #3b82f6;
        }
        
        .msg-title { 
          font-size: 22px; 
          font-weight: 700; 
          margin-bottom: 12px; 
        }
        
        .msg-error { color: #1e293b; }
        .msg-success { color: #1e293b; }
        
        .msg-btn { 
          width: 100%; 
          padding: 12px; 
          border-radius: 10px; 
          border: none; 
          color: white; 
          font-weight: 600; 
          cursor: pointer; 
          margin-top: 20px; 
          transition: all 0.3s;
        }
        
        .btn-error { 
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }
        
        .btn-success { 
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }

        .btn-error:hover, .btn-success:hover {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .modal-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .modal-btn-cancel {
          background: #f1f5f9;
          color: #64748b;
        }

        .modal-btn-cancel:hover {
          background: #e2e8f0;
        }

        .modal-btn-save {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          display: flex;
          align-items: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .modal-btn-save:hover {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .add-vehicle-page {
            padding: 100px 15px 30px;
          }

          .form-container {
            padding: 30px 20px;
          }

          .grid-container {
            grid-template-columns: 1fr;
          }

          .full-width {
            grid-column: span 1;
          }

          .modal-content {
            width: 90%;
            padding: 25px;
          }
        }

        @media (max-width: 480px) {
          .form-title {
            font-size: 26px;
          }

          .input-label {
            font-size: 13px;
          }

          .form-input, .form-select {
            padding: 11px 14px;
            font-size: 13px;
          }
        }
      `}</style>

      <div className="add-vehicle-page" ref={topRef}>
      <Header userId={userId} />
        <div className="form-container">
          <h2 className="form-title">🚗︎ Add Vehicle</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid-container">
              
              <div className="input-group">
                <label className="input-label">Registration Number</label>
                <input type="text" name="regNo" value={formData.regNo} onChange={handleChange} className="form-input" placeholder="Enter vehicle number" />
                {regNoChecking && <p className="error-text">Checking availability...</p>}
                {regNoExists && !regNoChecking && <p className="error-text" style={{color:'#3b82f6'}}>✗ This Vehicle is already registered.</p>}
                {!regNoExists && !regNoChecking && formData.regNo.length > 0 && <p className="error-text">✓ This Vehicle is not registered.</p>}
                {errors.regNo && <p className="error-text" style={{color:'#3b82f6'}}>{errors.regNo}</p>}
              </div>

              <div className="input-group">
                <label className="input-label">Owner</label>
                <SearchableSelect 
                  options={owners} 
                  labelKey="name" 
                  valueKey="owner_id" 
                  value={formData.owner_id}
                  placeholder="Search Owner by Name..."
                  onChange={(val) => setFormData({...formData, owner_id: val})}
                />
                <button type="button" className="add-cat-btn" onClick={() => setShowOwnerModal(true)}>+ Register New Owner</button>
                {errors.owner_id && <p className="error-text" style={{color:'#3b82f6'}}>{errors.owner_id}</p>}
              </div>

              <div className="input-group">
                <label className="input-label">Category</label>
                <SearchableSelect 
                  options={categories} 
                  labelKey="category_name" 
                  valueKey="category_id"
                  value={formData.category} 
                  placeholder="Search Category..."
                  onChange={(val) => setFormData({...formData, category: val})}
                />
                <button type="button" className="add-cat-btn" onClick={() => setShowCategoryModal(true)}>+ Add New Category</button>
                {errors.category && <p className="error-text" style={{color:'#3b82f6'}}>{errors.category}</p>}
              </div>

              <div className="input-group">
                <label className="input-label">Vehicle Type</label>
                <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="form-select">
                   <option value="">Select Type</option>
                   <option value="Own Fleet">Own Fleet</option>
                   <option value="Out Source">Out Source</option>
                </select>
                {errors.vehicleType && <p className="error-text" style={{color:'#3b82f6'}}>{errors.vehicleType}</p>}
              </div>

              <div className="input-group full-width">
                 <label className="input-label">Vehicle Photo</label>
                 <input type="file" name="vehiclePhoto" onChange={handleChange} className="form-input" accept="image/*" />
                 {previews.vehiclePhoto && (
                   <div>
                     <img src={previews.vehiclePhoto} className="preview-image" alt="Preview" />
                     <button type="button" onClick={() => handleRemoveImage('vehiclePhoto')} className="add-cat-btn" style={{color:'#3b82f6'}}>Remove</button>
                   </div>
                 )}
                 {errors.vehiclePhoto && <p className="error-text" style={{color:'#3b82f6'}}>{errors.vehiclePhoto}</p>}
              </div>

              <div className="input-group">
                 <label className="input-label">License Expiry</label>
                 <input type="date" name="licenseExpiry" value={formData.licenseExpiry} onChange={handleChange} className="form-input" />
                 {errors.licenseExpiry && <p className="error-text" style={{color:'#3b82f6'}}>{errors.licenseExpiry}</p>}
              </div>
              <div className="input-group">
                 <label className="input-label">License Photo</label>
                 <input type="file" name="licensePhoto" onChange={handleChange} className="form-input" accept="image/*" />
                 {previews.licensePhoto && <img src={previews.licensePhoto} className="preview-image" alt="Preview" />}
                 {errors.licensePhoto && <p className="error-text" style={{color:'#3b82f6'}}>{errors.licensePhoto}</p>}
              </div>

              <div className="input-group">
                 <label className="input-label">Insurance Expiry</label>
                 <input type="date" name="insuranceExpiry" value={formData.insuranceExpiry} onChange={handleChange} className="form-input" />
                 {errors.insuranceExpiry && <p className="error-text" style={{color:'#3b82f6'}}>{errors.insuranceExpiry}</p>}
              </div>
              <div className="input-group">
                 <label className="input-label">Insurance Photo</label>
                 <input type="file" name="insurancePhoto" onChange={handleChange} className="form-input" accept="image/*" />
                 {previews.insurancePhoto && <img src={previews.insurancePhoto} className="preview-image" alt="Preview" />}
                 {errors.insurancePhoto && <p className="error-text" style={{color:'#3b82f6'}}>{errors.insurancePhoto}</p>}
              </div>

              <div className="input-group full-width">
                 <label className="input-label">Book Copy Photo</label>
                 <input type="file" name="bookCopyPhoto" onChange={handleChange} className="form-input" accept="image/*" />
                 {previews.bookCopyPhoto && <img src={previews.bookCopyPhoto} className="preview-image" alt="Preview" />}
                 {errors.bookCopyPhoto && <p className="error-text" style={{color:'#3b82f6'}}>{errors.bookCopyPhoto}</p>}
              </div>
              
              
                
              

            </div>

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? <><div className="spinner"></div> Processing...</> : "Add Vehicle"}
            </button>
            <button type="button" className="back-button" onClick={() => router.push(`/vehicleDashboard?userId=${userId}`)}>Back</button>
          </form>
        </div>

        {showCategoryModal && (
          <div className="modal-overlay">
            <div className="modal-content">
               <h3>Add New Category</h3>
               <div style={{marginTop: '15px'}}>
                 <label className="input-label">Category Name</label>
                 <input type="text" className="form-input" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} autoFocus placeholder="Max 50 characters" />
               </div>
               <div style={{display:'flex', justifyContent:'flex-end', gap:'12px', marginTop:'20px'}}>
                  <button onClick={() => setShowCategoryModal(false)} className="modal-btn modal-btn-cancel">Cancel</button>
                  <button onClick={handleAddCategory} disabled={isAddingCategory} className="modal-btn modal-btn-save">
                    {isAddingCategory && <div className="spinner" style={{width:'12px', height:'12px'}}></div>} Save
                  </button>
               </div>
            </div>
          </div>
        )}

        {showOwnerModal && (
          <div className="modal-overlay">
            <div className="modal-content">
               <h3>Register New Owner</h3>
               <div style={{marginTop: '15px'}}>
                 <label className="input-label">Owner ID Number (NIC/Passport)</label>
                 <input type="text" className="form-input" value={newOwnerData.id} onChange={(e) => setNewOwnerData({...newOwnerData, id: e.target.value})} placeholder="Enter here" />
                 
                 <label className="input-label" style={{marginTop:'12px'}}>Name</label>
                 <input type="text" className="form-input" value={newOwnerData.name} onChange={(e) => setNewOwnerData({...newOwnerData, name: e.target.value})} placeholder="Name" />
                 
                 <label className="input-label" style={{marginTop:'12px'}}>Contact</label>
                 <input type="text" className="form-input" value={newOwnerData.contact} onChange={(e) => setNewOwnerData({...newOwnerData, contact: e.target.value})} placeholder="0xxxxxxxxx or +94..." />
               </div>
               <div style={{display:'flex', justifyContent:'flex-end', gap:'12px', marginTop:'20px'}}>
                  <button onClick={() => setShowOwnerModal(false)} className="modal-btn modal-btn-cancel">Cancel</button>
                  <button onClick={handleAddOwner} disabled={isAddingOwner} className="modal-btn modal-btn-save">
                    {isAddingOwner && <div className="spinner" style={{width:'12px', height:'12px'}}></div>} Register
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* GENERIC MESSAGE DIALOG */}
        {dialog.isOpen && (
            <div className="modal-overlay">
                <div className="modal-content" style={{textAlign: 'center'}}>
                    <div className={`msg-title ${dialog.type === 'error' ? 'msg-error' : 'msg-success'}`}>
                        {dialog.type === 'error' ? '⚠︎ ' : '✓ '}
                        {dialog.title}
                    </div>
                    <p style={{color: '#64748b', fontSize: '15px', lineHeight: '1.6'}}>{dialog.message}</p>
                    
                    {dialog.list && dialog.list.length > 0 && (
                        <ul style={{textAlign: 'left', marginTop: '15px', paddingLeft: '20px', color: '#3b82f6', fontSize: '14px', lineHeight: '1.8'}}>
                            {dialog.list.map((item, index) => (
                                <li key={index} style={{marginBottom:'6px'}}>{item}</li>
                            ))}
                        </ul>
                    )}

                    <button 
                        className={`msg-btn ${dialog.type === 'error' ? 'btn-error' : 'btn-success'}`} 
                        onClick={closeDialog}
                    >
                        {dialog.type === 'error' ? 'Close' : 'OK'}
                    </button>
                </div>
            </div>
        )}

      </div>
    </>
  );
};

export default AddVehiclePage;