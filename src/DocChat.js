import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './docchat.css';

const socket = io('http://localhost:5001');

const DoctorChat = () => {
  const room = 'hospital123';
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userData, setUserData] = useState(null); // selected patient
  const [doctorData, setDoctorData] = useState(null); // logged-in doctor
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newTreatment, setNewTreatment] = useState('');

  const getStoredEmail = () => {
    return localStorage.getItem('useremail') || localStorage.getItem('userEmail') || localStorage.getItem('email');
  };

  useEffect(() => {
    socket.emit('joinRoom', { room });
    socket.on('message', (msg) => setMessages(prev => [...prev, msg]));
    return () => socket.off('message');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const email = getStoredEmail();
      if (!email) {
        setError('Please login first - no user email found');
        setLoading(false);
        return;
      }

      try {
        // Fetch all users
        const usersRes = await fetch('http://localhost:8080/se-ems/user/all', {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
        });
        const usersData = await usersRes.json();
        setAllUsers(usersData);

        // Fetch current logged-in doctor
        const doctorRes = await fetch(`http://localhost:8080/se-ems/user/byEmail?email=${encodeURIComponent(email)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
        });
        const doctorData = await doctorRes.json();
        setDoctorData(doctorData);

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
      setError('');
      const res = await fetch(`http://localhost:8080/se-ems/user/byEmail?email=${encodeURIComponent(patient.email)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
      });
      const patientData = await res.json();
      setUserData(patientData);

      const historyRes = await fetch(`http://localhost:8080/se-ems/user/medical/history?userId=${patientData.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
      });
      const historyData = await historyRes.json();
      setMedicalHistory(historyData);

    } catch (err) {
      setError(err.message);
    }
  };

  const sendReply = () => {
    if (input.trim()) {
      socket.emit('sendMessage', { room, text: input, sender: 'doctor' });
      setInput('');
    }
  };

  const addPrescription = async () => {
    if (!newDiagnosis.trim() || !newTreatment.trim() || !userData?.id || !doctorData?.fullName) return;

    try {
      const res = await fetch('http://localhost:8080/se-ems/user/medical/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({
          userId: userData.id,
          diagnosis: newDiagnosis,
          treatment: newTreatment,
          doctor: `Dr. ${doctorData.fullName}`,
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (!res.ok) throw new Error('Failed to add medical record');
      const newEntry = await res.json();
      setMedicalHistory(prev => [...prev, newEntry]);
      setNewDiagnosis('');
      setNewTreatment('');
    } catch (err) {
      alert('Error adding record: ' + err.message);
    }
  };

  return (
    <div className="doctor-dashboard">
      <div className="sidebar">
        <h2>All Patients</h2>
        {allUsers.length > 0 ? allUsers.map(user => (
          <div key={user.id} className={`patient-card ${userData?.id === user.id ? 'active' : ''}`} onClick={() => handlePatientClick(user)}>
            <h3>{user.fullName}</h3>
            <p>Age: {user.age}</p>
            <p>Gender: {user.gender}</p>
          </div>
        )) : <p>No patients found</p>}
      </div>

      <div className="main-content">
        <div className="patient-details">
          <h2>Patient Overview</h2>
          {loading ? (
            <p>Loading data...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="detail-card">
              <h3>{userData?.fullName || 'No patient selected'}</h3>
              <div className="stats-grid">
                <div className="stat-item"><strong>Blood Group</strong><div>{userData?.blood || 'N/A'}</div></div>
                <div className="stat-item"><strong>Contact</strong><div>{userData?.emergencyContact || 'N/A'}</div></div>
                <div className="stat-item"><strong>Allergies</strong><div>{userData?.allergies || 'None'}</div></div>
              </div>

              <h3>Medical History</h3>
              <table className="medical-history-table">
                <thead>
                  <tr><th>Date</th><th>Diagnosis</th><th>Treatment</th><th>Doctor</th></tr>
                </thead>
                <tbody>
                  {medicalHistory.map((entry, idx) => (
                    <tr key={idx}>
                      <td>{entry.date || 'N/A'}</td>
                      <td>{entry.diagnosis}</td>
                      <td>{entry.treatment}</td>
                      <td>{entry.doctor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3>Add Medical Record</h3>
              <div className="prescription-input">
                <input type="text" value={newDiagnosis} onChange={(e) => setNewDiagnosis(e.target.value)} placeholder="Diagnosis" />
                <input type="text" value={newTreatment} onChange={(e) => setNewTreatment(e.target.value)} placeholder="Treatment" />
                <button onClick={addPrescription}>Add</button>
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
                  <strong>{msg.sender === 'doctor' ? 'You' : (!userData?.fullName || 'Patient')}:</strong> {msg.text}
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