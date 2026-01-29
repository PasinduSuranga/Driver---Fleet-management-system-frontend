'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Fixed professional Line-art icons from hi2
import { 
  HiOutlineBell, 
  HiOutlineEllipsisHorizontal, // Fixed icon name
  HiOutlineEye, 
  HiOutlinePencilSquare, 
  HiOutlineTrash, 
  HiOutlinePlus, 
  HiOutlineChevronLeft,
  HiOutlineMagnifyingGlass
} from "react-icons/hi2";

// --- Mock Data ---
const initialDrivers = [
  { id: 'CLEDR - 0001', name: 'Kasun Perera', status: 'Active' },
  { id: 'CLEDR - 0002', name: 'Amal Silva', status: 'Active' },
  { id: 'CLEDR - 0003', name: 'Ruwan Kumara', status: 'Inactive' },
  { id: 'CLEDR - 0004', name: 'Nimal Fernando', status: 'Active' },
  { id: 'CLEDR - 0005', name: 'Sunil Shantha', status: 'Active' },
];

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', sans-serif",
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 40px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #bfdbfe',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  homeLink: {
    textDecoration: 'none',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    padding: '10px 25px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
    transition: 'transform 0.2s ease',
  },
  notificationContainer: {
    position: 'relative',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    border: '1px solid #bfdbfe',
  },
  bellIcon: {
    fontSize: '22px',
    color: '#475569',
  },
  badge: {
    position: 'absolute',
    top: '0px',
    right: '0px',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: 'bold',
    border: '2px solid #fff',
  },
  mainContent: {
    flexGrow: 1,
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '40px',
    color: '#1e293b',
    textAlign: 'center',
    letterSpacing: '-0.5px',
  },
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '900px',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  searchGroup: {
    display: 'flex',
    gap: '12px',
    flex: 1,
    minWidth: '300px',
  },
  searchInputWrapper: {
    position: 'relative',
    flex: 2,
  },
  searchIcon: {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    fontSize: '18px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 15px 12px 45px',
    borderRadius: '12px',
    border: '1.5px solid #cbd5e1',
    fontSize: '15px',
    outline: 'none',
    color: '#1e293b',
    backgroundColor: '#fff',
    transition: 'border-color 0.3s ease',
  },
  filterSelect: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '12px',
    border: '1.5px solid #cbd5e1',
    fontSize: '15px',
    outline: 'none',
    backgroundColor: 'white',
    color: '#475569',
    maxWidth: '140px',
    cursor: 'pointer',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
  },
  addButton: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    padding: '10px 25px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
    transition: 'all 0.3s ease',
  },
  backButton: {
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    color: 'white',
    border: 'none',
    padding: '10px 25px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)',
    transition: 'all 0.3s ease',
  },
  listContainer: {
    width: '100%',
    maxWidth: '900px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '24px',
    padding: '25px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    border: '1px solid #fff',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 25px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '100px', 
    backgroundColor: '#fff',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  driverId: {
    fontSize: '16px',
    color: '#1e293b',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  menuButton: {
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    color: '#64748b',
    transition: 'all 0.2s ease',
  },
  popupMenu: {
    position: 'absolute',
    right: '20px',
    top: '50px',
    backgroundColor: 'white',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    borderRadius: '14px',
    zIndex: 100,
    overflow: 'hidden',
    width: '160px',
    border: '1px solid #f1f5f9',
    animation: 'fadeIn 0.2s ease-out',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 18px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#475569',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    borderBottom: '1px solid #f1f5f9',
  },
  footer: {
    backgroundColor: '#1e40af',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    padding: '20px',
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '0.5px',
  }
};

export default function DriverDashboard() {
  const router = useRouter();
  const [drivers, setDrivers] = useState(initialDrivers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || driver.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleView = (id) => {
    router.push(`/viewDriver?id=${id}`);
  };

  const handleUpdate = (id) => {
    router.push(`/updateDriver?id=${id}`);
  };

  const handleDelete = (id) => {
    if(confirm('Are you sure you want to delete this driver?')) {
        setDrivers(drivers.filter(d => d.id !== id));
        setOpenMenuId(null);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link href="/" style={styles.homeLink}>Home</Link>
        <div style={styles.notificationContainer}>
          <HiOutlineBell style={styles.bellIcon} />
          <div style={styles.badge}>3</div>
        </div>
      </header>

      <main style={styles.mainContent}>
        <h1 style={styles.title}>Driver Fleet Management</h1>

        <div style={styles.controlsRow}>
          <div style={styles.searchGroup}>
            <div style={styles.searchInputWrapper}>
              <HiOutlineMagnifyingGlass style={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search by ID or Name..." 
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              style={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={styles.actionButtons}>
            <button 
              style={styles.addButton} 
              onClick={() => router.push('/addDriver')}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <HiOutlinePlus /> Add Driver
            </button>
            <button 
              style={styles.backButton} 
              onClick={() => router.back()}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <HiOutlineChevronLeft /> Back
            </button>
          </div>
        </div>

        <div style={styles.listContainer}>
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver) => (
              <div 
                key={driver.id} 
                style={styles.listItem}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <span style={styles.driverId}>{driver.id}</span>
                
                <div style={{position: 'relative'}} ref={openMenuId === driver.id ? menuRef : null}>
                  <button 
                    style={styles.menuButton} 
                    onClick={() => setOpenMenuId(openMenuId === driver.id ? null : driver.id)}
                    onMouseOver={(e) => e.currentTarget.style.background = '#e0f2fe'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
                  >
                    {/* Fixed Icon usage */}
                    <HiOutlineEllipsisHorizontal />
                  </button>

                  {openMenuId === driver.id && (
                    <div style={styles.popupMenu}>
                      <div 
                        style={styles.menuItem} 
                        onClick={() => handleView(driver.id)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <HiOutlineEye style={{color: '#3b82f6'}} /> View Profile
                      </div>
                      <div 
                        style={styles.menuItem} 
                        onClick={() => handleUpdate(driver.id)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <HiOutlinePencilSquare style={{color: '#f59e0b'}} /> Update
                      </div>
                      <div 
                        style={{...styles.menuItem, borderBottom: 'none'}} 
                        onClick={() => handleDelete(driver.id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#475569';
                        }}
                      >
                        <HiOutlineTrash style={{color: '#ef4444'}} /> Delete
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{textAlign: 'center', color: '#64748b', padding: '40px'}}>
              No drivers matching your search criteria.
            </div>
          )}
        </div>
      </main>

      <footer style={styles.footer}>
        © 2025 City Lion Express Tours • Driver Operations Management
      </footer>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}