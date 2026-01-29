'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Professional Line-art / Sketch icons
import { 
  HiOutlineBell, 
  HiOutlineTruck, 
  HiOutlineUserCircle, 
  HiOutlineMagnifyingGlass,
  HiOutlineChevronRight,
  HiOutlineArrowLeft
} from "react-icons/hi2";

// --- Mock Data ---
const initialVehicles = [
  { id: 'v1', regNumber: 'WP - AB - 1111' },
  { id: 'v2', regNumber: 'WP - CB - 2222' },
  { id: 'v3', regNumber: 'WP - XY - 3333' },
  { id: 'v4', regNumber: 'WP - ZQ - 4444' },
  { id: 'v5', regNumber: 'WP - GA - 5555' },
];

const initialDrivers = [
  { id: 'd1', name: 'CLEDR - 0001' },
  { id: 'd2', name: 'CLEDR - 0002' },
  { id: 'd3', name: 'CLEDR - 0003' },
  { id: 'd4', name: 'CLEDR - 0004' },
  { id: 'd5', name: 'CLEDR - 0005' },
];

// --- Updated Styles using the Gradient Palette ---
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
  selectionContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '30px',
    width: '100%',
    maxWidth: '1100px',
    marginBottom: '40px',
  },
  columnCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '24px',
    padding: '30px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    height: '550px',
    border: '1px solid #ffffff',
  },
  columnHeader: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  searchWrapper: {
    position: 'relative',
    marginBottom: '20px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    fontSize: '18px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 15px 12px 40px',
    borderRadius: '12px',
    border: '1.5px solid #cbd5e1',
    fontSize: '15px',
    outline: 'none',
    color: '#1e293b',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease',
  },
  listContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingRight: '8px',
  },
  listItem: {
    padding: '14px 20px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '100px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    alignItems: 'center',
    width: '100%',
  },
  nextButton: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 0',
    borderRadius: '14px',
    fontSize: '17px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '320px',
    boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'transform 0.2s ease',
  },
  backButton: {
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 0',
    borderRadius: '14px',
    fontSize: '17px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '320px',
    boxShadow: '0 8px 16px rgba(30, 64, 175, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'transform 0.2s ease',
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

export default function CreateAssignmentPage() {
  const router = useRouter();

  const [vehicleSearch, setVehicleSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const filteredVehicles = initialVehicles.filter(v => 
    v.regNumber.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const filteredDrivers = initialDrivers.filter(d => 
    d.name.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const handleNext = () => {
    if (!selectedVehicle || !selectedDriver) {
      alert("Please select both a Vehicle and a Driver.");
      return;
    }
    router.push(`/assaignmentassign/?vehicleId=${selectedVehicle}&driverId=${selectedDriver}`);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <Link href="/" style={styles.homeLink}>Home</Link>
        <div style={styles.notificationContainer}>
          <HiOutlineBell style={styles.bellIcon} />
          <div style={styles.badge}>3</div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <h1 style={styles.title}>Asset Assignment Portal</h1>

        <div style={styles.selectionContainer}>
          
          {/* Column 1: Available Vehicles */}
          <div style={styles.columnCard}>
            <h2 style={styles.columnHeader}>
              <HiOutlineTruck style={{fontSize: '22px', color: '#3b82f6'}} /> 
              Available Vehicles
            </h2>
            <div style={styles.searchWrapper}>
              <HiOutlineMagnifyingGlass style={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Registration Number..." 
                style={styles.searchInput}
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
              />
            </div>
            <div style={styles.listContainer}>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <div 
                    key={vehicle.id} 
                    style={{
                      ...styles.listItem,
                      backgroundColor: selectedVehicle === vehicle.id ? '#3b82f6' : '#fff',
                      color: selectedVehicle === vehicle.id ? 'white' : '#475569',
                      borderColor: selectedVehicle === vehicle.id ? '#3b82f6' : '#cbd5e1',
                      boxShadow: selectedVehicle === vehicle.id ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                    }}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                    onMouseOver={(e) => { if(selectedVehicle !== vehicle.id) e.currentTarget.style.backgroundColor = '#f0f9ff'; }}
                    onMouseOut={(e) => { if(selectedVehicle !== vehicle.id) e.currentTarget.style.backgroundColor = '#fff'; }}
                  >
                    {vehicle.regNumber}
                  </div>
                ))
              ) : (
                <div style={{textAlign:'center', color:'#94a3b8', padding: '20px'}}>No vehicles found</div>
              )}
            </div>
          </div>

          {/* Column 2: Available Drivers */}
          <div style={styles.columnCard}>
            <h2 style={styles.columnHeader}>
              <HiOutlineUserCircle style={{fontSize: '22px', color: '#3b82f6'}} /> 
              Available Drivers
            </h2>
            <div style={styles.searchWrapper}>
              <HiOutlineMagnifyingGlass style={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Driver ID or Name..." 
                style={styles.searchInput}
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
              />
            </div>
            <div style={styles.listContainer}>
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver) => (
                  <div 
                    key={driver.id} 
                    style={{
                      ...styles.listItem,
                      backgroundColor: selectedDriver === driver.id ? '#3b82f6' : '#fff',
                      color: selectedDriver === driver.id ? 'white' : '#475569',
                      borderColor: selectedDriver === driver.id ? '#3b82f6' : '#cbd5e1',
                      boxShadow: selectedDriver === driver.id ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                    }}
                    onClick={() => setSelectedDriver(driver.id)}
                    onMouseOver={(e) => { if(selectedDriver !== driver.id) e.currentTarget.style.backgroundColor = '#f0f9ff'; }}
                    onMouseOut={(e) => { if(selectedDriver !== driver.id) e.currentTarget.style.backgroundColor = '#fff'; }}
                  >
                    {driver.name}
                  </div>
                ))
              ) : (
                <div style={{textAlign:'center', color:'#94a3b8', padding: '20px'}}>No drivers found</div>
              )}
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <button 
            style={styles.nextButton} 
            onClick={handleNext}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Confirm Selection <HiOutlineChevronRight />
          </button>
          
          <button 
            style={styles.backButton} 
            onClick={() => router.back()}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <HiOutlineArrowLeft /> Dashboard
          </button>
        </div>

      </main>

      <footer style={styles.footer}>
        © 2025 City Lion Express Tours • Enterprise Resource Allocation
      </footer>
    </div>
  );
}