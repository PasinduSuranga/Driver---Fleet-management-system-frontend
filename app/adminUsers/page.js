'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../../components/adminNavbar';

const API_BASE_URL = "http://localhost:5000"; 

const UsersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loggedInUserId = searchParams.get('userId'); 

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Dialog State
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "", // 'confirm', 'success', 'error'
    title: "",
    message: "",
    onConfirm: null // Function to execute if confirmed
  });

  // Helper Functions
  function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function toUpper(str) {
    if (!str) return "";
    return str.toUpperCase();
  }

  // --- Fetch Users ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/user/list`);
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Filter Logic ---
  useEffect(() => {
    let result = users;

    // 0. Exclude the currently logged-in user
    if (loggedInUserId) {
      result = result.filter(user => user.user_id !== loggedInUserId);
    }

    // 1. Search by Name or ID
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(lowerTerm) || 
        user.user_id.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Filter by Role
    if (roleFilter !== "All") {
      result = result.filter(user => capitalizeFirstLetter(user.role) === roleFilter);
    }

    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users, loggedInUserId]);

  // --- Action Handlers ---

  // 1. Trigger the Confirmation Dialog
  const handleStatusChangeClick = (userId, email, newStatus) => {
    const actionName = newStatus === 3 ? "blacklist" : newStatus === 2 ? "decline" : "approve";
    
    setDialog({
        isOpen: true,
        type: 'confirm',
        title: 'Confirm Action',
        message: `Are you sure you want to ${actionName} this user?`,
        onConfirm: () => executeStatusChange(userId, email, newStatus)
    });
  };

  // 2. Execute the API call (Called when user clicks "Yes" in dialog)
  const executeStatusChange = async (userId, email, newStatus) => {
    // Close confirm dialog first (optional, or keep loading state)
    setDialog(prev => ({ ...prev, isOpen: false }));

    try {
      await axios.post(`${API_BASE_URL}/user/status`, {
        user_id: userId,
        email: email,
        status: newStatus
      });
      
      // Show Success Dialog
      setDialog({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Action completed successfully!',
          onConfirm: null
      });

      fetchUsers(); // Refresh list
    } catch (err) {
      // Show Error Dialog
      setDialog({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to update status. Please try again.',
          onConfirm: null
      });
      console.error(err);
    }
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
  };

  // Define Roles explicitly
  const roles = ["All", "User", "Admin"];

  return (
    <div style={{ display: 'flex' }}>
      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        
        @keyframes slideIn { 
          from { opacity: 0; transform: translateX(-20px); } 
          to { opacity: 1; transform: translateX(0); } 
        }

        /* Modal Styles */
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
          text-align: center; 
        }
        
        .msg-title { 
          font-size: 22px; 
          font-weight: 700; 
          margin-bottom: 12px; 
        }
        
        .msg-error { color: #1e293b; }
        .msg-success { color: #1e293b; }
        .msg-confirm { color: #1e293b; }

        .btn-group { 
          display: flex; 
          gap: 12px; 
          justify-content: center; 
          margin-top: 20px; 
        }
        
        .msg-btn { 
          padding: 12px 24px; 
          border-radius: 10px; 
          border: none; 
          color: white; 
          font-weight: 600; 
          cursor: pointer; 
          min-width: 100px; 
          transition: all 0.3s;
          font-size: 15px;
        }
        
        .btn-error { 
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }
        
        .btn-success { 
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }
        
        .btn-confirm { 
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }
        
        .btn-cancel { 
          background: #f1f5f9; 
          color: #64748b;
        }

        .btn-error:hover, .btn-success:hover, .btn-confirm:hover {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .btn-cancel:hover {
          background: #e2e8f0;
        }

        @media (max-width: 768px) {
          .modal-content {
            width: 90%;
            padding: 25px;
          }
        }
      `}</style>

      <Sidebar />
      <div style={{ 
        marginLeft: '260px', 
        width: '100%', 
        padding: '40px', 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)', 
        minHeight: '100vh' 
      }}>
        
        {/* Header Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          animation: 'fadeIn 0.6s ease-out'
        }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            👥︎ User Management
          </h1>
          <button 
            onClick={() => router.push(`/adminUsers/blacklistedUsers?userId=${loggedInUserId}`)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s',
              fontSize: '15px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.3)';
            }}
          >
            View Blacklist
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '30px',
          animation: 'fadeIn 0.8s ease-out'
        }}>
          <input 
            type="text" 
            placeholder="Search by User ID or Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '14px 18px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              outline: 'none',
              fontSize: '15px',
              background: '#f8fafc',
              color: '#1e293b',
              transition: 'all 0.2s'
            }}
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
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              outline: 'none',
              minWidth: '180px',
              fontSize: '15px',
              background: '#f8fafc',
              color: '#475569',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
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
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Table Section */}
        {loading ? (
          <div style={{
            textAlign: 'center', 
            marginTop: '80px', 
            fontSize: '18px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            Loading...
          </div>
        ) : (
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.12)', 
            overflow: 'hidden',
            border: '1px solid #e0f2fe',
            animation: 'fadeIn 1s ease-out'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ 
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' 
                }}>
                  <th style={{ padding: '18px 20px', color: 'white', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User ID</th>
                  <th style={{ padding: '18px 20px', color: 'white', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                  <th style={{ padding: '18px 20px', color: 'white', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                  <th style={{ padding: '18px 20px', color: 'white', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                  <th style={{ padding: '18px 20px', color: 'white', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '18px 20px', color: 'white', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{
                        padding: '40px', 
                        textAlign: 'center', 
                        color: '#94a3b8',
                        fontSize: '15px'
                      }}>
                        No users found.
                      </td>
                    </tr>
                ) : (
                    filteredUsers.map((user) => (
                    <tr key={user.user_id} style={{ 
                      borderBottom: '1px solid #f0f9ff',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <td style={{ padding: '16px 20px', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{user.user_id}</td>
                        <td style={{ padding: '16px 20px', color: '#475569', fontSize: '14px' }}>{capitalizeFirstLetter(user.name)}</td>
                        <td style={{ padding: '16px 20px', color: '#475569', fontSize: '14px' }}>{user.email}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ 
                            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
                            color: '#1e40af', 
                            padding: '6px 14px', 
                            borderRadius: '20px', 
                            fontSize: '12px', 
                            fontWeight: '600',
                            border: '1px solid #93c5fd',
                            display: 'inline-block'
                          }}>
                            {capitalizeFirstLetter(user.role)}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                          {user.is_approved === 1 && <span style={{color: '#3b82f6', fontWeight: '600'}}>Active</span>}
                          {user.is_approved === 0 && <span style={{color: '#2563eb', fontWeight: '600'}}>Pending</span>}
                        </td>
                        <td style={{ padding: '16px 20px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {/* Pending User Buttons */}
                            {user.is_approved === 0 && (
                                <>
                                <button 
                                  onClick={() => handleStatusChangeClick(user.user_id, user.email, 1)} 
                                  style={{ 
                                    padding: '8px 16px', 
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                                  }}
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleStatusChangeClick(user.user_id, user.email, 2)} 
                                  style={{ 
                                    padding: '8px 16px', 
                                    background: 'white', 
                                    color: '#3b82f6', 
                                    border: '2px solid #bfdbfe', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    fontSize: '13px',
                                    fontWeight: '600',
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
                                  Decline
                                </button>
                                <button 
                                  onClick={() => handleStatusChangeClick(user.user_id, user.email, 3)} 
                                  style={{ 
                                    padding: '8px 16px', 
                                    background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(30, 64, 175, 0.4)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.3)';
                                  }}
                                >
                                  Blacklist
                                </button>
                                </>
                            )}
                            {/* Approved User Button */}
                            {user.is_approved === 1 && (
                                <button 
                                  onClick={() => handleStatusChangeClick(user.user_id, user.email, 3)} 
                                  style={{ 
                                    padding: '8px 16px', 
                                    background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(30, 64, 175, 0.4)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.3)';
                                  }}
                                >
                                  Add to Blacklist
                                </button>
                            )}
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* DIALOG BOX */}
        {dialog.isOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className={`msg-title ${dialog.type === 'error' ? 'msg-error' : dialog.type === 'success' ? 'msg-success' : 'msg-confirm'}`}>
                        {dialog.type === 'error' ? '⚠︎ ' : dialog.type === 'success' ? '✓ ' : '⚠︎ '}
                        {dialog.title}
                    </div>
                    <p style={{color: '#64748b', marginTop: '10px', fontSize: '15px', lineHeight: '1.6'}}>{dialog.message}</p>
                    
                    <div className="btn-group">
                        {dialog.type === 'confirm' ? (
                            <>
                                <button className="msg-btn btn-cancel" onClick={closeDialog}>Cancel</button>
                                <button 
                                    className="msg-btn btn-confirm" 
                                    onClick={() => dialog.onConfirm && dialog.onConfirm()}
                                >
                                    Confirm
                                </button>
                            </>
                        ) : (
                            <button 
                                className={`msg-btn ${dialog.type === 'error' ? 'btn-error' : 'btn-success'}`} 
                                onClick={closeDialog}
                            >
                                OK
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default UsersPage;