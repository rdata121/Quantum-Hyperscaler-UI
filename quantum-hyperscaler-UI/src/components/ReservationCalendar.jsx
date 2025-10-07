import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthProvider';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './ReservationCalendar.css';

const ReservationCalendar = () => {
  const { user, logout } = useAuth();
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    duration_hours: 2,
    job_description: '',
    job_type: 'research',
    priority: 'medium',
    estimated_qubits: 10,
    requires_special_access: false,
    contact_email: user?.email || ''
  });

  const calendarRef = useRef(null);
  const API_BASE = 'http://localhost:8000';

  // Fetch machines on component mount
  useEffect(() => {
    // Get fresh token first
    getFreshToken().then(() => {
      fetchMachines();
    });
  }, []);

  const getFreshToken = async () => {
    try {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('firebase_token', token);
        console.log('✅ Fresh Firebase token stored');
      }
    } catch (error) {
      console.error('❌ Error getting fresh token:', error);
    }
  };

  // Fetch availability when machine or date changes
  useEffect(() => {
    if (selectedMachine) {
      console.log('🎯 Machine selected, fetching availability for:', selectedMachine.name);
      fetchAvailability();
    } else {
      console.log('❌ No machine selected');
    }
  }, [selectedMachine]);

  const fetchMachines = async () => {
    try {
      console.log('🚀 Starting to fetch machines...');
      
      let token = localStorage.getItem('firebase_token');
      console.log('🔑 Token available:', !!token);
      
      // If no token, get a fresh one
      if (!token && user) {
        console.log('🔄 No token, getting fresh token...');
        await getFreshToken();
        token = localStorage.getItem('firebase_token');
        console.log('🔑 Fresh token available:', !!token);
      }
      
      if (!token) {
        console.error('❌ No Firebase token available');
        alert('❌ No authentication token. Please login again.');
        return;
      }

      console.log('🔗 Fetching machines from:', `${API_BASE}/api/reservations/machines`);
      const response = await fetch(`${API_BASE}/api/reservations/machines`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Machines fetched successfully:', data);
        console.log('📊 Number of machines:', data.length);
        
        // Debug: Check if data is an array or has machines property
        let machinesArray = data;
        if (data.machines && Array.isArray(data.machines)) {
          machinesArray = data.machines;
          console.log('🔍 Found machines in data.machines property');
        } else if (!Array.isArray(data)) {
          console.log('⚠️ Data is not an array:', typeof data);
          machinesArray = [];
        }
        
        console.log('🤖 Final machines array:', machinesArray);
        setMachines(machinesArray);
        
        if (machinesArray.length > 0) {
          setSelectedMachine(machinesArray[0]);
          console.log('🎯 Selected first machine:', machinesArray[0].name);
        } else {
          console.log('⚠️ No machines returned from API');
          alert('⚠️ No quantum machines available. Please contact support.');
        }
      } else if (response.status === 401) {
        console.log('🔄 Token expired, refreshing...');
        await getFreshToken();
        // Retry once with fresh token
        const newToken = localStorage.getItem('firebase_token');
        const retryResponse = await fetch(`${API_BASE}/api/reservations/machines`, {
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          console.log('✅ Machines fetched on retry:', data.length, 'machines');
          setMachines(data);
          if (data.length > 0) {
            setSelectedMachine(data[0]);
          }
        } else {
          console.error('❌ Retry failed:', retryResponse.status);
          alert(`❌ Failed to fetch machines: ${retryResponse.status}`);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch machines:', response.status, response.statusText, errorText);
        alert(`❌ Failed to fetch machines: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('💥 Error fetching machines:', error);
      alert(`💥 Network error: ${error.message}`);
    }
  };

  const fetchAvailability = async () => {
    if (!selectedMachine) {
      console.log('❌ No machine selected, skipping availability fetch');
      alert('❌ Please select a quantum machine first!');
      return;
    }

    console.log('🔄 Fetching availability for machine:', selectedMachine.name);
    console.log('🤖 Machine details:', {
      id: selectedMachine.id,
      name: selectedMachine.name,
      type: selectedMachine.machine_type
    });

    try {
      setLoading(true);
      const token = localStorage.getItem('firebase_token');
      
      if (!token) {
        console.error('❌ No Firebase token for availability fetch');
        alert('❌ No authentication token. Please login again.');
        return;
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14); // Next 2 weeks

      const url = `${API_BASE}/api/reservations/availability?` +
        `start_date=${startDate.toISOString().split('T')[0]}&` +
        `end_date=${endDate.toISOString().split('T')[0]}&` +
        `machine_type=${selectedMachine.machine_type}`;

      console.log('🔗 Fetching availability from:', url);
      console.log('📅 Date range:', {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      });

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Availability response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Availability fetched successfully:', data);
        console.log('📊 Number of availability entries:', data.length);
        
        if (data.length === 0) {
          alert('⚠️ No availability data returned. This might be normal if the machine is fully booked.');
        } else {
          alert(`✅ Loaded ${data.length} availability entries successfully!`);
        }
        
        setAvailability(data);
        updateCalendarEvents(data);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch availability:', response.status, response.statusText, errorText);
        
        let errorMessage = `Failed to fetch availability (${response.status})`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        alert(`❌ ${errorMessage}\n\nCheck browser console for more details.`);
      }
    } catch (error) {
      console.error('💥 Error fetching availability:', error);
      alert(`💥 Network error: ${error.message}\n\nCheck browser console for more details.`);
    } finally {
      setLoading(false);
    }
  };


  const fetchMyReservations = async () => {
    try {
      const token = localStorage.getItem('firebase_token');
      const response = await fetch(`${API_BASE}/api/reservations/my-reservations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data);
        updateCalendarWithReservations(data);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const updateCalendarEvents = (availabilityData) => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    // Clear existing events
    calendarApi.removeAllEvents();

    // Add availability events
    availabilityData.forEach(day => {
      day.time_slots.forEach(slot => {
        const startTime = new Date(slot.start_time);
        const endTime = new Date(slot.end_time);
        
        calendarApi.addEvent({
          id: `slot-${slot.machine_id}-${startTime.getTime()}`,
          title: slot.available ? 'Available' : 'Reserved',
          start: startTime,
          end: endTime,
          color: slot.available ? '#10b981' : '#ef4444',
          display: 'block',
          extendedProps: {
            available: slot.available,
            price: slot.price_per_hour,
            machineId: slot.machine_id,
            machineName: slot.machine_name
          }
        });
      });
    });
  };

  const updateCalendarWithReservations = (reservationsData) => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    // Add reservation events
    reservationsData.forEach(reservation => {
      calendarApi.addEvent({
        id: `reservation-${reservation.id}`,
        title: `${reservation.machine_name} - ${reservation.status}`,
        start: new Date(reservation.start_time),
        end: new Date(reservation.end_time),
        color: getStatusColor(reservation.status),
        display: 'block',
        extendedProps: {
          type: 'reservation',
          reservation: reservation
        }
      });
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'active': return '#10b981';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleDateClick = (info) => {
    console.log('📅 Date clicked:', info);
    
    if (info.event) {
      const event = info.event;
      console.log('📅 Event clicked:', event.extendedProps);
      
      if (event.extendedProps.available && event.extendedProps.machineId === selectedMachine?.id) {
        console.log('✅ Available slot selected');
        setSelectedDate(info.date);
        setSelectedTime(event.start);
        setShowBookingModal(true);
      } else {
        console.log('❌ Slot not available or wrong machine');
        alert('This time slot is not available for booking or is for a different machine.');
      }
    } else {
      // User clicked on empty space - show info about how to book
      console.log('📅 Empty space clicked');
      alert('💡 To book a reservation:\n\n1. Select a quantum machine from the dropdown above\n2. Click on a GREEN "Available" time slot\n3. Fill out the booking form\n\nGreen slots are available for booking!');
    }
  };

  const handleCreateReservation = async () => {
    try {
      setLoading(true);
      
      // Get fresh token first
      let token = localStorage.getItem('firebase_token');
      if (!token && user) {
        await getFreshToken();
        token = localStorage.getItem('firebase_token');
      }
      
      if (!token) {
        alert('No authentication token available. Please login again.');
        return;
      }
      
      const reservationData = {
        machine_id: selectedMachine.id,
        start_time: selectedTime.toISOString(),
        duration_hours: bookingForm.duration_hours,
        job_description: bookingForm.job_description,
        job_type: bookingForm.job_type,
        priority: bookingForm.priority,
        estimated_qubits: bookingForm.estimated_qubits,
        requires_special_access: bookingForm.requires_special_access,
        contact_email: bookingForm.contact_email
      };

      console.log('🚀 Creating reservation with data:', reservationData);

      const response = await fetch(`${API_BASE}/api/reservations/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
      });

      console.log('📡 Booking response status:', response.status);

      if (response.ok) {
        const newReservation = await response.json();
        console.log('✅ Reservation created:', newReservation);
        alert(`✅ Reservation created successfully!\n\nReservation ID: ${newReservation.id}\nStatus: ${newReservation.status}\nCost: $${newReservation.total_cost}`);
        setShowBookingModal(false);
        // Refresh data
        fetchMyReservations();
        fetchAvailability();
      } else {
        const errorText = await response.text();
        console.error('❌ Booking failed:', response.status, errorText);
        let errorMessage = `Failed to create reservation (${response.status})`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        alert(`❌ ${errorMessage}`);
      }
    } catch (error) {
      console.error('💥 Error creating reservation:', error);
      alert(`💥 Error creating reservation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reservation-calendar">
      {/* Header */}
      <div className="calendar-header">
        <div className="header-left">
          <h1>🔬 Quantum Machine Reservations</h1>
          <p>Book time on quantum computing systems</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span>👤 {user?.email}</span>
            <span style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 10px' }}>
              {machines.length > 0 ? `✅ ${machines.length} machines loaded` : '❌ No machines loaded'}
            </span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>

      {/* Machine Selection */}
      <div className="machine-selector">
        <label htmlFor="machine-select">Select Quantum Machine:</label>
        <select 
          id="machine-select"
          value={selectedMachine?.id || ''} 
          onChange={(e) => {
            const machine = machines.find(m => m.id === e.target.value);
            setSelectedMachine(machine);
          }}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
            marginBottom: '10px'
          }}
        >
          <option value="">{machines.length === 0 ? 'Loading machines...' : 'Choose a quantum machine...'}</option>
          {machines.map(machine => (
            <option key={machine.id} value={machine.id}>
              {machine.name} - ${machine.hourly_rate}/hour ({machine.min_duration}-{machine.max_duration}h)
            </option>
          ))}
        </select>
        
        
        {selectedMachine && (
          <div className="machine-info">
            <h3>📋 {selectedMachine.name}</h3>
            <div className="machine-details">
              <span className="detail">💰 ${selectedMachine.hourly_rate}/hour</span>
              <span className="detail">⏱️ {selectedMachine.min_duration}-{selectedMachine.max_duration} hours</span>
              <span className="detail">👥 Capacity: {selectedMachine.capacity} user(s)</span>
              <span className="detail">🔧 Features: {selectedMachine.features.join(', ')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color available"></span>
          <span>Available Slots</span>
        </div>
        <div className="legend-item">
          <span className="legend-color reserved"></span>
          <span>Reserved</span>
        </div>
        <div className="legend-item">
          <span className="legend-color pending"></span>
          <span>My Reservations (Pending)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color confirmed"></span>
          <span>My Reservations (Confirmed)</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          slotDuration="01:00:00"
          snapDuration="01:00:00"
          selectable={false}
          selectMirror={false}
          dateClick={handleDateClick}
          eventClick={handleDateClick}
          events={[]} // Events are added programmatically
          eventDisplay="block"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={fetchMyReservations} className="action-btn">
          📋 View My Reservations
        </button>
        <button 
          onClick={fetchAvailability}
          className="action-btn"
          style={{ backgroundColor: '#8b5cf6', color: 'white' }}
          disabled={!selectedMachine}
        >
          🎯 Load Availability
        </button>
        <button 
          onClick={() => alert('💡 How to Book:\n\n1. Select a quantum machine above\n2. Click "Load Availability" to fetch slots\n3. Click on GREEN "Available" time slots\n4. Fill out the booking form\n5. Click "Book Reservation"')}
          className="action-btn help-btn"
          style={{ backgroundColor: '#10b981', color: 'white' }}
        >
          ❓ How to Book
        </button>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="booking-modal">
            <div className="modal-header">
              <h3>📝 Create Reservation</h3>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="booking-info" style={{
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#0c4a6e' }}>📅 Reservation Details</h4>
                <p><strong>Machine:</strong> {selectedMachine?.name}</p>
                <p><strong>Type:</strong> {selectedMachine?.machine_type}</p>
                <p><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedTime?.toLocaleTimeString()}</p>
                <p><strong>Duration:</strong> {bookingForm.duration_hours} hour{bookingForm.duration_hours > 1 ? 's' : ''}</p>
                <p><strong>Hourly Rate:</strong> ${selectedMachine?.hourly_rate}/hour</p>
                <p><strong>Total Cost:</strong> <span style={{ color: '#059669', fontWeight: 'bold' }}>${selectedMachine?.hourly_rate * bookingForm.duration_hours}</span></p>
              </div>

              <div className="form-group">
                <label>Duration (hours):</label>
                <select 
                  value={bookingForm.duration_hours}
                  onChange={(e) => setBookingForm({...bookingForm, duration_hours: parseInt(e.target.value)})}
                >
                  {selectedMachine && Array.from({length: selectedMachine.max_duration - selectedMachine.min_duration + 1}, (_, i) => 
                    selectedMachine.min_duration + i
                  ).map(hours => (
                    <option key={hours} value={hours}>{hours} hour{hours > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Job Type:</label>
                <select 
                  value={bookingForm.job_type}
                  onChange={(e) => setBookingForm({...bookingForm, job_type: e.target.value})}
                >
                  <option value="research">Research</option>
                  <option value="education">Education</option>
                  <option value="commercial">Commercial</option>
                  <option value="prototyping">Prototyping</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority:</label>
                <select 
                  value={bookingForm.priority}
                  onChange={(e) => setBookingForm({...bookingForm, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Estimated Qubits:</label>
                <input 
                  type="number"
                  value={bookingForm.estimated_qubits}
                  onChange={(e) => setBookingForm({...bookingForm, estimated_qubits: parseInt(e.target.value)})}
                  min="1"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label>Job Description:</label>
                <textarea 
                  value={bookingForm.job_description}
                  onChange={(e) => setBookingForm({...bookingForm, job_description: e.target.value})}
                  placeholder="Describe your quantum computing task..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input 
                    type="checkbox"
                    checked={bookingForm.requires_special_access}
                    onChange={(e) => setBookingForm({...bookingForm, requires_special_access: e.target.checked})}
                  />
                  Requires Special Access
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setShowBookingModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateReservation}
                disabled={loading || !bookingForm.job_description.trim()}
                className="book-btn"
              >
                {loading ? 'Creating...' : '📅 Book Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationCalendar;
