'use client';

import { useSearchParams, useRouter } from 'next/navigation'; // Updated for App Router
import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import Header from '../../components/userHeader';

// Component to handle the actual content
const VehicleContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const vehicleNumber = searchParams.get('vehicleNumber');
  const userId = searchParams.get('userId');

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog State
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    isError: false
  });

  useEffect(() => {
    if (vehicleNumber) {
      fetchVehicleDetails(vehicleNumber);
    }
  }, [vehicleNumber]);

  const fetchVehicleDetails = async (vNum) => {
    try {
      // Adjust this URL to match your backend port/route
      const response = await axios.get(`http://localhost:5000/vehicle/vehicleDetails?vehicleNumber=${vNum}`);
      setVehicle(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setDialog({
        isOpen: true,
        title: "Error",
        message: "Failed to fetch vehicle details.",
        isError: true
      });
    }
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
    if (dialog.isError) {
      router.push(`/vehicleDashboard?userId=${userId}`);
    }
  };

  if (loading) return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
      color: '#64748b',
      fontSize: '18px',
      fontWeight: '500'
    }}>
      Loading details...
    </div>
  );
  
  if (!vehicle && !dialog.isOpen) return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
      color: '#64748b',
      fontSize: '18px',
      fontWeight: '500'
    }}>
      No vehicle found.
    </div>
  );

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

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Dialog Styles */
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
          z-index: 3000;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.2s ease-out;
        }

        .dialog-content {
          background: white;
          padding: 30px;
          border-radius: 16px;
          width: 90%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25);
          border: 1px solid #e0f2fe;
          animation: popIn 0.3s ease-out;
        }

        .dialog-icon {
          font-size: 48px;
          margin-bottom: 15px;
          display: block;
        }

        .dialog-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 10px;
        }

        .dialog-message {
          font-size: 15px;
          color: #64748b;
          margin-bottom: 25px;
          line-height: 1.5;
        }

        .dialog-button {
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

        .dialog-button:hover {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        @media (max-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr !important;
          }
          .doc-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)', 
        padding: '24px',
        paddingTop: '120px'
      }}>
        <Header userId={userId} />
        
        {/* Navigation / Header */}
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          animation: 'fadeIn 0.6s ease-out'
        }}>
          <button 
            onClick={() => router.push(`/vehicleDashboard?userId=${userId}`)} 
            style={{
              padding: '12px 24px',
              background: 'white',
              color: '#3b82f6',
              border: '2px solid #bfdbfe',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
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
            ← Back
          </button>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '800',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Vehicle Details
          </h1>
        </div>

        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          background: 'white', 
          borderRadius: '20px', 
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.12)', 
          overflow: 'hidden',
          border: '1px solid #e0f2fe',
          animation: 'fadeIn 0.8s ease-out'
        }}>
          
          {/* Top Section: Main Photo & Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="details-grid">
            
            {/* Main Vehicle Photo */}
            <div style={{ 
              height: '350px', 
              position: 'relative', 
              background: '#f8fafc',
              borderRight: '1px solid #e0f2fe'
            }}>
              {vehicle.vehicle_photo ? (
                <img 
                  src={vehicle.vehicle_photo} 
                  alt={vehicle.vehicle_number} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%', 
                  color: '#cbd5e1',
                  fontSize: '16px'
                }}>
                  No Photo
                </div>
              )}
            </div>

            {/* Details Column */}
            <div style={{ padding: '40px' }}>
              <div style={{ 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px', 
                fontSize: '13px', 
                color: '#3b82f6', 
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                {capitalizeFirstLetter(vehicle.vehicle_type)}
              </div>
              
              <h2 style={{ 
                fontSize: '26px', 
                fontWeight: '700', 
                color: '#1e293b',
                marginBottom: '24px'
              }}>
                {toUpper(vehicle.vehicle_number)}
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '20px', 
                color: '#475569' 
              }}>
                <div>
                  <span style={{ 
                    display: 'block', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: '#94a3b8', 
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    letterSpacing: '0.5px'
                  }}>
                    Category
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: '500' }}>
                    {capitalizeFirstLetter(vehicle.category_name)}
                  </span>
                </div>
                
                <div>
                  <span style={{ 
                    display: 'block', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: '#94a3b8', 
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    letterSpacing: '0.5px'
                  }}>
                    Availability
                  </span>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '6px 14px', 
                    fontSize: '12px', 
                    borderRadius: '20px',
                    fontWeight: '600',
                    background: vehicle.availability === 1 
                      ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
                      : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                    color: vehicle.availability === 1 ? '#1e40af' : '#64748b',
                    border: vehicle.availability === 1 ? '1px solid #93c5fd' : '1px solid #cbd5e1'
                  }}>
                    {vehicle.availability === 1 ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                
                <div>
                  <span style={{ 
                    display: 'block', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: '#94a3b8', 
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    letterSpacing: '0.5px'
                  }}>
                    Owner Name
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: '500' }}>
                    {capitalizeFirstLetter(vehicle.owner_name)}
                  </span>
                </div>
                
                <div>
                  <span style={{ 
                    display: 'block', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: '#94a3b8', 
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    letterSpacing: '0.5px'
                  }}>
                    Contact
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: '500' }}>
                    {formatMobileNumber(vehicle.contact_no)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Documentation Images */}
          <div style={{ 
            padding: '40px', 
            borderTop: '1px solid #f0f9ff',
            background: '#fafbfc'
          }}>
            <h3 style={{ 
              fontSize: '22px', 
              fontWeight: '700', 
              color: '#1e293b', 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              📋︎ Documentation
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '24px' 
            }} className="doc-grid">
              
              {/* Book Copy */}
              <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                border: '2px solid #e0f2fe',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#bfdbfe';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0f2fe';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <p style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#475569', 
                  marginBottom: '12px' 
                }}>
                  Book Copy
                </p>
                <div style={{ 
                  height: '180px', 
                  background: '#f8fafc', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0'
                }}>
                  {vehicle.book_copy ? (
                    <img 
                      src={vehicle.book_copy} 
                      alt="Book Copy" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                      }}
                      onClick={() => window.open(vehicle.book_copy, '_blank')}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    />
                  ) : (
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%', 
                      fontSize: '13px',
                      color: '#cbd5e1'
                    }}>
                      No Image
                    </span>
                  )}
                </div>
              </div>

              {/* License */}
              <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                border: '2px solid #e0f2fe',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#bfdbfe';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0f2fe';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-end', 
                  marginBottom: '12px' 
                }}>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#475569' 
                  }}>
                    License
                  </p>
                  <p style={{ 
                    fontSize: '11px', 
                    color: '#3b82f6',
                    fontWeight: '600'
                  }}>
                    Exp: {formatDate(vehicle.license_expiry)}
                  </p>
                </div>
                <div style={{ 
                  height: '180px', 
                  background: '#f8fafc', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0'
                }}>
                  {vehicle.license_copy ? (
                    <img 
                      src={vehicle.license_copy} 
                      alt="License" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                      }}
                      onClick={() => window.open(vehicle.license_copy, '_blank')}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    />
                  ) : (
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%', 
                      fontSize: '13px',
                      color: '#cbd5e1'
                    }}>
                      No Image
                    </span>
                  )}
                </div>
              </div>

              {/* Insurance */}
              <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                border: '2px solid #e0f2fe',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#bfdbfe';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0f2fe';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-end', 
                  marginBottom: '12px' 
                }}>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#475569' 
                  }}>
                    Insurance
                  </p>
                  <p style={{ 
                    fontSize: '11px', 
                    color: '#3b82f6',
                    fontWeight: '600'
                  }}>
                    Exp: {formatDate(vehicle.insurance_expiry)}
                  </p>
                </div>
                <div style={{ 
                  height: '180px', 
                  background: '#f8fafc', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0'
                }}>
                  {vehicle.insurance_copy ? (
                    <img 
                      src={vehicle.insurance_copy} 
                      alt="Insurance" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                      }}
                      onClick={() => window.open(vehicle.insurance_copy, '_blank')}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    />
                  ) : (
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%', 
                      fontSize: '13px',
                      color: '#cbd5e1'
                    }}>
                      No Image
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* DIALOG BOX */}
        {dialog.isOpen && (
          <div className="modal-overlay">
            <div className="dialog-content">
              <span className="dialog-icon">
                {dialog.isError ? "⚠︎" : "✓"}
              </span>
              <h3 className="dialog-title">{dialog.title}</h3>
              <p className="dialog-message">{dialog.message}</p>
              <button className="dialog-button" onClick={closeDialog}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Main Page Component wrapping content in Suspense (Required for useSearchParams in App Router)
export default function ViewVehiclePage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
        color: '#64748b',
        fontSize: '18px',
        fontWeight: '500'
      }}>
        Loading Page...
      </div>
    }>
      <VehicleContent />
    </Suspense>
  );
}