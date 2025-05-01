import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './docchat.css';

const socket = io('http://localhost:5001');

const DoctorChat = () => {
  const room = 'hospital123';
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [newPrescription, setNewPrescription] = useState('');
  const [userData, setUserData] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientLoading, setPatientLoading] = useState(false);
  const [error, setError] = useState('');

  const getStoredEmail = () => {
    return localStorage.getItem('useremail') || 
           localStorage.getItem('userEmail') ||
           localStorage.getItem('email');
  };

  useEffect(() => {
    socket.emit('joinRoom', { room });
    socket.on('message', (msg) => setMessages(prev => [...prev, msg]));
    return () => socket.off('message');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const userEmail = getStoredEmail();
      if (!userEmail) {
        setError('Please login first - no user email found');
        setLoading(false);
        return;
      }

      try {
        // Fetch all users
        const usersRes = await fetch('http://localhost:8080/se-ems/user/all', {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
        });
        
        if (!usersRes.ok) throw new Error('Failed to load users');
        const usersData = await usersRes.json();
        setAllUsers(usersData);

        // Fetch initial patient data (current user)
        const userRes = await fetch(
          `http://localhost:8080/se-ems/user/byEmail?email=${encodeURIComponent(userEmail)}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` } }
        );

        if (!userRes.ok) throw new Error('Failed to load user');
        const userData = await userRes.json();
        setUserData(userData);

        // Fetch initial medical history
        const historyRes = await fetch(
          `http://localhost:8080/se-ems/user/medical/history?userId=${userData.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` } }
        );

        if (!historyRes.ok) throw new Error('Failed to load medical history');
        const historyData = await historyRes.json();
        setMedicalHistory(historyData);

      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePatientClick = async (patient) => {
    try {
      setPatientLoading(true);
      setError('');

      // Fetch selected patient's data
      const userRes = await fetch(
        `http://localhost:8080/se-ems/user/byEmail?email=${encodeURIComponent(patient.email)}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` } }
      );
      
      if (!userRes.ok) throw new Error('Failed to load patient data');
      const patientData = await userRes.json();
      setUserData(patientData);

      // Fetch selected patient's medical history
      const historyRes = await fetch(
        `http://localhost:8080/se-ems/user/medical/history?userId=${patientData.id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` } }
      );
      
      if (!historyRes.ok) throw new Error('Failed to load medical history');
      const historyData = await historyRes.json();
      setMedicalHistory(historyData);

      // Clear prescriptions when switching patients
      setPrescriptions([]);

    } catch (err) {
      setError(err.message);
    } finally {
      setPatientLoading(false);
    }
  };

  const sendReply = () => {
    if (input.trim()) {
      socket.emit('sendMessage', { room, text: input, sender: 'doctor' });
      setInput('');
    }
  };

  const addPrescription = () => {
    if (newPrescription.trim()) {
      setPrescriptions(prev => [...prev, newPrescription]);
      setNewPrescription('');
    }
  };

  return (
    <div className="doctor-dashboard">
      <div className="sidebar">
        <h2>All Patients</h2>
        {allUsers.length > 0 ? (
          allUsers.map(user => (
            <div 
              key={user.id} 
              className={`patient-card ${userData?.id === user.id ? 'active' : ''}`}
              onClick={() => handlePatientClick(user)}
            >
              <h3>{user.fullName}</h3>
              <p>Age: {user.age}</p>
              <p>Gender: {user.gender}</p>
            </div>
          ))
        ) : (
          <p>No patients found</p>
        )}
      </div>

      <div className="main-content">
        <div className="patient-details">
          <h2>Patient Overview</h2>

          {loading ? (
            <p>Loading initial data...</p>
          ) : patientLoading ? (
            <p>Loading patient data...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="detail-card">
              <div className="vital-stats">
                <h3>{userData?.fullName || 'No patient selected'}</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Blood Group</span>
                    <span className="stat-value">{userData?.blood || 'N/A'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Contact</span>
                    <span className="stat-value">{userData?.emergencyContact || 'N/A'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Allergies</span>
                    <span className="stat-value">{userData?.allergies || 'None'}</span>
                  </div>
                </div>
              </div>

              <div className="appointment-section">
                <h3>Medical History</h3>
                {medicalHistory.length === 0 ? (
                  <p>No medical records available.</p>
                ) : (
                  <table className="medical-history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Diagnosis</th>
                        <th>Treatment</th>
                        <th>Doctor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicalHistory.map((entry, idx) => (
                        <tr key={idx}>
                          <td>{entry.date || 'Invalid'}</td>
                          <td>{entry.diagnosis || '-'}</td>
                          <td>{entry.treatment || '-'}</td>
                          <td>{entry.doctor || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="prescription-section">
                <h3>Prescriptions</h3>
                <div className="prescription-input">
                  <input
                    type="text"
                    value={newPrescription}
                    onChange={(e) => setNewPrescription(e.target.value)}
                    placeholder="Add new prescription..."
                  />
                  <button onClick={addPrescription}>Add</button>
                </div>
                <div className="prescription-list">
                  {prescriptions.map((prescription, index) => (
                    <div key={index} className="prescription-item">
                      ✓ {prescription}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-section">
          <div className="chat-box">
            <h2>Live Chat</h2>
            <div className="chat-window">
              {messages.map((msg, index) => (
                <div key={index} className={`message-wrapper ${msg.sender === 'doctor' ? 'right' : 'left'}`}>
                  <div className={`message ${msg.sender === 'doctor' ? 'doctor' : 'patient'}`}>
                    <strong>{msg.sender === 'doctor' ? 'You' : 'Patient'}:</strong> {msg.text}
                  </div>
                  <small className="timestamp">{new Date().toLocaleTimeString()}</small>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your reply..."
                onKeyDown={(e) => e.key === 'Enter' && sendReply()}
              />
              <button onClick={sendReply}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorChat;