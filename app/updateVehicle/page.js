'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';

// --- Simple Dialog Component for Success/Error Messages ---
const StatusModal = ({ isOpen, type, message, onClose }) => {
  if (!isOpen) return null;
  
  const isSuccess = type === 'success';
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(30, 64, 175, 0.15)',
      backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(59, 130, 246, 0.25)',
        padding: '30px',
        width: '90%',
        maxWidth: '400px',
        margin: '0 16px',
        position: 'relative',
        animation: 'popIn 0.3s ease-out',
        border: '1px solid #e0f2fe',
        textAlign: 'center'
      }}>
        <div style={{
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '48px',
          width: '48px',
          borderRadius: '50%',
          marginBottom: '16px',
          fontSize: '28px'
        }}>
          {isSuccess ? '✓' : '⚠︎'}
        </div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '10px',
          color: '#1e293b'
        }}>
          {isSuccess ? 'Success!' : 'Error'}
        </h3>
        <p style={{
          fontSize: '15px',
          color: '#64748b',
          textAlign: 'center',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            display: 'inline-flex',
            justifyContent: 'center',
            borderRadius: '10px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
            padding: '12px 16px',
            fontSize: '15px',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
          }}
        >
          OK
        </button>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

const UpdateVehicleContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const vehicleNumberParam = searchParams.get('vehicleNumber');
  const userId = searchParams.get('userId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // -- Modal State --
  const [modal, setModal] = useState({ isOpen: false, type: 'success', message: '' });

  // -- Owner Management State --
  const [owners, setOwners] = useState([]);
  const [isChangingOwner, setIsChangingOwner] = useState(false);
  const [isAddingOwner, setIsAddingOwner] = useState(false);
  const [newOwnerData, setNewOwnerData] = useState({ owner_id: '', name: '', contact: '' });

  // -- Form Data State --
  const [formData, setFormData] = useState({
    vehicleType: 'Own Fleet',
    ownerId: '',
    ownerName: '',
    ownerContact: '',
    licenseExpiry: '',
    insuranceExpiry: ''
  });

  // -- Image States --
  const [previews, setPreviews] = useState({
    vehiclePhoto: '',
    bookCopyPhoto: '',
    licensePhoto: '',
    insurancePhoto: ''
  });

  const [dbPreviews, setDbPreviews] = useState({
    vehiclePhoto: '',
    bookCopyPhoto: '',
    licensePhoto: '',
    insurancePhoto: ''
  });

  const [files, setFiles] = useState({
    vehiclePhoto: null,
    bookCopyPhoto: null,
    licensePhoto: null,
    insurancePhoto: null
  });

  // 1. Fetch Existing Details
  useEffect(() => {
    if (vehicleNumberParam) {
      fetchDetails(vehicleNumberParam);
    }
  }, [vehicleNumberParam]);

  const fetchDetails = async (vNum) => {
    try {
      const res = await axios.get(`http://localhost:5000/vehicle/vehicleDetails?vehicleNumber=${vNum}`);
      const data = res.data;
      
      // FIX: Use local date components to avoid UTC timezone shift
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      setFormData({
        vehicleType: data.vehicle_type || 'Own Fleet',
        ownerId: data.owner_id || '',
        ownerName: data.owner_name || '',
        ownerContact: data.contact_no || '',
        licenseExpiry: formatDate(data.license_expiry),
        insuranceExpiry: formatDate(data.insurance_expiry)
      });

      const initialPreviews = {
        vehiclePhoto: data.vehicle_photo || '',
        bookCopyPhoto: data.book_copy || '',
        licensePhoto: data.license_copy || '',
        insurancePhoto: data.insurance_copy || ''
      };

      setPreviews(initialPreviews);
      setDbPreviews(initialPreviews);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setModal({ isOpen: true, type: 'error', message: 'Error loading vehicle data.' });
      setLoading(false);
    }
  };

  // 2. Owner Helpers
  const fetchOwners = async () => {
    try {
      const res = await axios.get('http://localhost:5000/owner/owners'); 
      setOwners(res.data);
    } catch (err) {
      console.error("Failed to fetch owners", err);
      setModal({ isOpen: true, type: 'error', message: 'Failed to load owner list.' });
    }
  };

  const handleOwnerSelect = (selectedId) => {
    const selectedOwner = owners.find(o => o.owner_id === selectedId);
    if (selectedOwner) {
      setFormData(prev => ({
        ...prev,
        ownerId: selectedOwner.owner_id,
        ownerName: selectedOwner.name,
        ownerContact: selectedOwner.contact
      }));
      setIsChangingOwner(false);
    }
  };

  // --- Strict Validation for New Owner ---
  const validateNewOwner = (data) => {
    // NIC: 12 digits OR 9 digits + v/V
    const nicRegex = /^([0-9]{9}[vV]|[0-9]{12})$/;
    if (!nicRegex.test(data.owner_id)) {
      setModal({ isOpen: true, type: 'error', message: 'Invalid NIC. Must be 12 digits or 9 digits followed by "v".' });
      return false;
    }

    // Name: Max 250 chars
    if (data.name.length > 250) {
      setModal({ isOpen: true, type: 'error', message: 'Name cannot exceed 250 characters.' });
      return false;
    }

    // Contact: Start with 0 (10 digits) OR Start with + (11 digits after +)
    const contactRegex = /^(0\d{9}|\+\d{11})$/;
    if (!contactRegex.test(data.contact)) {
      setModal({ isOpen: true, type: 'error', message: 'Invalid Contact. Must start with 0 (10 digits) or + (12 digits).' });
      return false;
    }
    
    return true;
  };

  const handleAddNewOwner = async () => {
    const { owner_id, name, contact } = newOwnerData;
    
    if (!owner_id || !name || !contact) {
      setModal({ isOpen: true, type: 'error', message: 'All fields are required for new owner.' });
      return;
    }

    if (!validateNewOwner(newOwnerData)) return;

    try {
      await axios.post('http://localhost:5000/owner/add', newOwnerData);
      setFormData(prev => ({ ...prev, ownerId: owner_id, ownerName: name, ownerContact: contact }));
      setIsAddingOwner(false);
      setIsChangingOwner(false);
      setNewOwnerData({ owner_id: '', name: '', contact: '' });
      setModal({ isOpen: true, type: 'success', message: 'New owner added and selected successfully!' });
    } catch (err) {
      console.error(err);
      setModal({ isOpen: true, type: 'error', message: err.response?.data?.message || "Failed to add owner" });
    }
  };

  // 3. Input Handlers
  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name; 
    if (file) {
      setFiles({ ...files, [name]: file });
      setPreviews({ ...previews, [name]: URL.createObjectURL(file) });
    }
  };

  // 4. Remove File Handler
  const handleRemoveFile = (name) => {
    setFiles({ ...files, [name]: null });
    setPreviews({ ...previews, [name]: dbPreviews[name] });
  };

  // --- Date Validation for Update ---
  const validateDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (formData.licenseExpiry) {
      const licDate = new Date(formData.licenseExpiry);
      if (licDate <= today) {
         setModal({ isOpen: true, type: 'error', message: 'License expiry date must be in the future.' });
         return false;
      }
    }

    if (formData.insuranceExpiry) {
      const insDate = new Date(formData.insuranceExpiry);
      if (insDate <= today) {
         setModal({ isOpen: true, type: 'error', message: 'Insurance expiry date must be in the future.' });
         return false;
      }
    }
    return true;
  };

  // 5. Submit Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateDates()) return;

    setSubmitting(true);

    const data = new FormData();
    data.append('vehicleNumber', vehicleNumberParam);
    data.append('vehicleType', formData.vehicleType);
    data.append('ownerId', formData.ownerId);
    data.append('ownerContact', formData.ownerContact);
    data.append('licenseExpiry', formData.licenseExpiry);
    data.append('insuranceExpiry', formData.insuranceExpiry);

    if (files.vehiclePhoto) data.append('vehiclePhoto', files.vehiclePhoto);
    if (files.bookCopyPhoto) data.append('bookCopyPhoto', files.bookCopyPhoto);
    if (files.licensePhoto) data.append('licensePhoto', files.licensePhoto);
    if (files.insurancePhoto) data.append('insurancePhoto', files.insurancePhoto);

    try {
      await axios.put('http://localhost:5000/vehicle/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setModal({ isOpen: true, type: 'success', message: 'Vehicle Updated Successfully!' });
    } catch (err) {
      console.error(err);
      setModal({ isOpen: true, type: 'error', message: 'Failed to update details: ' + (err.response?.data?.message || err.message) });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Closing Modal
  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
    // If it was a successful update, navigate back
    if (modal.type === 'success' && modal.message === 'Vehicle Updated Successfully!') {
       router.push(`/viewVehicle?userId=${userId}&vehicleNumber=${vehicleNumberParam}`);
    }
  };

  if (loading) return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: '500',
      color: '#64748b'
    }}>
      Loading Details...
    </div>
  );

  function toUpper(str) {
    if (!str) return "";
    return str.toUpperCase();
  }

  function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function formatMobileNumber(number) {
    if (!number) return "";
    
    // Remove any existing spaces first
    const str = number.toString().replace(/\s+/g, '');

    // Handle +94 start (e.g., +94771234567 -> +94 77 123 4567)
    if (str.startsWith('+94')) {
      return str.replace(/(\+94)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4");
    }

    // Handle 07 start (e.g., 0771234567 -> 077 123 4567)
    if (str.startsWith('07')) {
      return str.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    }

    // Return original if no pattern matches
    return number;
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', // "January" (use 'short' for "Jan")
      day: 'numeric' // "28"
    });
  }

  const inputStyle = {
    marginTop: '4px',
    display: 'block',
    width: '100%',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    padding: '10px 14px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    background: '#f8fafc',
    color: '#1e293b'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '4px'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
      padding: '24px',
      paddingTop: '40px'
    }}>
      
      {/* Dialog Component */}
      <StatusModal 
        isOpen={modal.isOpen} 
        type={modal.type} 
        message={modal.message} 
        onClose={closeModal} 
      />

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.12)',
        padding: '40px',
        border: '1px solid #e0f2fe'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '2px solid #f0f9ff'
        }}>
          <h1 style={{
            fontSize: '26px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Update Vehicle: {toUpper(vehicleNumberParam)}
          </h1>
          <button 
            onClick={() => router.push(`/vehicleDashboard?userId=${userId}`)}
            style={{
              padding: '10px 20px',
              background: 'white',
              color: '#3b82f6',
              border: '2px solid #bfdbfe',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0f9ff';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#bfdbfe';
            }}
          >
            Back
          </button>
        </div>

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Section 1: Vehicle Basic Info */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e0f2fe'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#3b82f6',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🚗︎ Vehicle Info
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px'
            }}>
              <div>
                <label style={labelStyle}>Vehicle Type</label>
                <select 
                  name="vehicleType" 
                  value={formData.vehicleType} 
                  onChange={handleTextChange}
                  style={selectStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                >
                  <option value="Own Fleet">Own Fleet</option>
                  <option value="Out Source">Out Source</option>
                </select>
              </div>
              
              <div>
                <label style={labelStyle}>Vehicle Photo</label>
                <input 
                  type="file" 
                  name="vehiclePhoto" 
                  onChange={handleFileChange}
                  style={{
                    ...inputStyle,
                    padding: '8px 12px',
                    fontSize: '13px'
                  }}
                />
                
                {previews.vehiclePhoto && (
                  <div style={{ position: 'relative', marginTop: '12px', display: 'inline-block' }}>
                    <img 
                      src={previews.vehiclePhoto} 
                      alt="Preview" 
                      style={{
                        height: '100px',
                        borderRadius: '8px',
                        border: '2px solid #e0f2fe'
                      }}
                    />
                    {files.vehiclePhoto && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveFile('vehiclePhoto')}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                          color: 'white',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Owner Info - Continuing in next part due to length */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e0f2fe'
          }}>
             <div style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'flex-end',
               marginBottom: '20px'
             }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  👤︎ Owner Info
                </h3>
                {!isChangingOwner && !isAddingOwner && (
                    <button 
                      type="button" 
                      onClick={() => { setIsChangingOwner(true); fetchOwners(); }}
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#3b82f6',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#1e40af'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
                    >
                      Change Owner
                    </button>
                )}
             </div>

             {/* Change Owner Dropdown */}
             {isChangingOwner && !isAddingOwner && (
                <div style={{
                  marginBottom: '16px',
                  padding: '20px',
                  background: 'white',
                  border: '2px solid #bfdbfe',
                  borderRadius: '12px'
                }}>
                   <label style={{ ...labelStyle, marginBottom: '12px', color: '#1e40af' }}>Select New Owner</label>
                   <div style={{ display: 'flex', gap: '12px' }}>
                      <select 
                        style={{ ...selectStyle, flex: 1 }}
                        onChange={(e) => handleOwnerSelect(e.target.value)} 
                        value=""
                      >
                         <option value="" disabled>-- Select from List --</option>
                         {owners.map(owner => (
                           <option key={owner.owner_id} value={owner.owner_id}>
                             {capitalizeFirstLetter(owner.name)} ({formatMobileNumber(owner.contact)})
                           </option>
                         ))}
                      </select>
                      <button 
                        type="button" 
                        onClick={() => setIsAddingOwner(true)}
                        style={{
                          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                          color: 'white',
                          padding: '10px 20px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        + Add New
                      </button>
                   </div>
                   <button 
                     type="button" 
                     onClick={() => setIsChangingOwner(false)}
                     style={{
                       fontSize: '12px',
                       color: '#3b82f6',
                       marginTop: '8px',
                       background: 'none',
                       border: 'none',
                       cursor: 'pointer',
                       textDecoration: 'underline'
                     }}
                   >
                     Cancel Selection
                   </button>
                </div>
             )}

             {/* Add New Owner */}
             {isAddingOwner && (
                <div style={{
                  marginBottom: '16px',
                  padding: '20px',
                  background: 'white',
                  border: '2px solid #bfdbfe',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)'
                }}>
                   <h4 style={{
                     fontSize: '14px',
                     fontWeight: '700',
                     color: '#1e293b',
                     marginBottom: '16px'
                   }}>
                     Register New Owner
                   </h4>
                   <div style={{
                     display: 'grid',
                     gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                     gap: '16px',
                     marginBottom: '16px'
                   }}>
                      <input 
                        placeholder="NIC (12 digits or 9+V)" 
                        value={newOwnerData.owner_id} 
                        onChange={e => setNewOwnerData({...newOwnerData, owner_id: e.target.value})}
                        style={{ ...inputStyle, padding: '10px 12px', fontSize: '13px' }}
                      />
                      <input 
                        placeholder="Name (Max 250)" 
                        value={newOwnerData.name} 
                        onChange={e => setNewOwnerData({...newOwnerData, name: e.target.value})}
                        style={{ ...inputStyle, padding: '10px 12px', fontSize: '13px' }}
                      />
                      <input 
                        placeholder="Contact (0xx... or +xx...)" 
                        value={newOwnerData.contact} 
                        onChange={e => setNewOwnerData({...newOwnerData, contact: e.target.value})}
                        style={{ ...inputStyle, padding: '10px 12px', fontSize: '13px' }}
                      />
                   </div>
                   <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        type="button" 
                        onClick={handleAddNewOwner}
                        style={{
                          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                          color: 'white',
                          padding: '10px 20px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: '600',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        Save & Select
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsAddingOwner(false)}
                        style={{
                          background: '#f1f5f9',
                          color: '#64748b',
                          padding: '10px 20px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: '600',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                   </div>
                </div>
             )}

             {/* Standard Owner View */}
             <div style={{
               display: 'grid',
               gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
               gap: '24px'
             }}>
                <div>
                   <label style={labelStyle}>Current Owner Name</label>
                   <input 
                     type="text" 
                     value={capitalizeFirstLetter(formData.ownerName)} 
                     disabled
                     style={{
                       ...inputStyle,
                       background: '#e2e8f0',
                       color: '#94a3b8',
                       cursor: 'not-allowed'
                     }}
                   />
                </div>
                <div>
                   <label style={labelStyle}>Contact Number (Editable)</label>
                   <input 
                     type="text" 
                     name="ownerContact" 
                     value={formatMobileNumber(formData.ownerContact)} 
                     onChange={handleTextChange}
                     style={inputStyle}
                     onFocus={(e) => {
                       e.currentTarget.style.borderColor = '#3b82f6';
                       e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                       e.currentTarget.style.background = 'white';
                     }}
                     onBlur={(e) => {
                       e.currentTarget.style.borderColor = '#e2e8f0';
                       e.currentTarget.style.boxShadow = 'none';
                       e.currentTarget.style.background = '#f8fafc';
                     }}
                   />
                   <p style={{
                     fontSize: '11px',
                     color: '#94a3b8',
                     marginTop: '6px',
                     fontStyle: 'italic'
                   }}>
                     Note: Changing this updates the owner's profile.
                   </p>
                </div>
             </div>
          </div>

          {/* Section 3: Documents */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e0f2fe'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#3b82f6',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📋︎ Documents
            </h3>
            
            {/* Book Copy */}
            <div style={{ marginBottom: '24px' }}>
               <label style={labelStyle}>Book Copy</label>
               <input 
                 type="file" 
                 name="bookCopyPhoto" 
                 onChange={handleFileChange}
                 style={{
                   ...inputStyle,
                   padding: '8px 12px',
                   fontSize: '13px'
                 }}
               />
               
               {previews.bookCopyPhoto && (
                 <div style={{ position: 'relative', marginTop: '12px', display: 'inline-block' }}>
                   <img 
                     src={previews.bookCopyPhoto} 
                     alt="Preview" 
                     style={{
                       height: '90px',
                       borderRadius: '8px',
                       border: '2px solid #e0f2fe'
                     }}
                   />
                   {files.bookCopyPhoto && (
                     <button 
                       type="button" 
                       onClick={() => handleRemoveFile('bookCopyPhoto')}
                       style={{
                         position: 'absolute',
                         top: '-8px',
                         right: '-8px',
                         background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                         color: 'white',
                         borderRadius: '50%',
                         width: '24px',
                         height: '24px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         fontSize: '12px',
                         fontWeight: '700',
                         border: 'none',
                         cursor: 'pointer',
                         boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                       }}
                     >
                       ×
                     </button>
                   )}
                 </div>
               )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
               {/* License */}
               <div style={{
                 border: '2px solid #e0f2fe',
                 padding: '20px',
                 background: 'white',
                 borderRadius: '12px'
               }}>
                  <h4 style={{
                    fontWeight: '700',
                    color: '#475569',
                    marginBottom: '12px',
                    fontSize: '15px'
                  }}>
                    License
                  </h4>
                  <input 
                    type="file" 
                    name="licensePhoto" 
                    onChange={handleFileChange}
                    style={{
                      ...inputStyle,
                      padding: '8px 12px',
                      fontSize: '13px',
                      marginBottom: '12px'
                    }}
                  />
                  {previews.licensePhoto && (
                    <div style={{ position: 'relative', marginBottom: '12px', display: 'inline-block' }}>
                      <img 
                        src={previews.licensePhoto} 
                        alt="Preview" 
                        style={{
                          height: '90px',
                          borderRadius: '8px',
                          border: '2px solid #e0f2fe'
                        }}
                      />
                      {files.licensePhoto && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveFile('licensePhoto')}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}
                  <label style={{
                    ...labelStyle,
                    marginTop: '12px',
                    fontSize: '12px'
                  }}>
                    Expiry Date
                  </label>
                  <input 
                    type="date" 
                    name="licenseExpiry" 
                    value={formData.licenseExpiry} 
                    onChange={handleTextChange}
                    style={inputStyle}
                  />
               </div>

               {/* Insurance */}
               <div style={{
                 border: '2px solid #e0f2fe',
                 padding: '20px',
                 background: 'white',
                 borderRadius: '12px'
               }}>
                  <h4 style={{
                    fontWeight: '700',
                    color: '#475569',
                    marginBottom: '12px',
                    fontSize: '15px'
                  }}>
                    Insurance
                  </h4>
                  <input 
                    type="file" 
                    name="insurancePhoto" 
                    onChange={handleFileChange}
                    style={{
                      ...inputStyle,
                      padding: '8px 12px',
                      fontSize: '13px',
                      marginBottom: '12px'
                    }}
                  />
                  {previews.insurancePhoto && (
                    <div style={{ position: 'relative', marginBottom: '12px', display: 'inline-block' }}>
                      <img 
                        src={previews.insurancePhoto} 
                        alt="Preview" 
                        style={{
                          height: '90px',
                          borderRadius: '8px',
                          border: '2px solid #e0f2fe'
                        }}
                      />
                      {files.insurancePhoto && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveFile('insurancePhoto')}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}
                  <label style={{
                    ...labelStyle,
                    marginTop: '12px',
                    fontSize: '12px'
                  }}>
                    Expiry Date
                  </label>
                  <input 
                    type="date" 
                    name="insuranceExpiry" 
                    value={formData.insuranceExpiry} 
                    onChange={handleTextChange}
                    style={inputStyle}
                  />
               </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: 'white',
              fontWeight: '700',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              fontSize: '16px',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
              opacity: submitting ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
             {submitting ? 'Updating Files...' : 'Save Changes'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default function UpdateVehiclePage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: '500',
        color: '#64748b'
      }}>
        Loading...
      </div>
    }>
      <UpdateVehicleContent />
    </Suspense>
  );
}