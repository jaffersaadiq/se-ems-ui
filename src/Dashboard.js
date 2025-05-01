import React, { useEffect, useState } from 'react';
import './Dashboard_Module.css';
import Frontpage from './frontpage';

const Dashboard = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    age: '',
    gender: '',
    blood: '',
    emergencyContact: '',
    allergies: ''
  });
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getStoredEmail = () => {
    return (
      localStorage.getItem('useremail') ||
      localStorage.getItem('userEmail') ||
      localStorage.getItem('email')
    );
  };

  useEffect(() => {
    const userEmail = getStoredEmail();
    if (!userEmail) {
      setError('Please login first - no user email found');
      setLoading(false);
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/se-ems/user/byEmail?email=${(userEmail)}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
            }
          }
        );
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    const fetchMedicalHistory = async () => {
      try {
        const res = await fetch('http://localhost:8080/se-ems/user/medical/history', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch medical history');
        const history = await res.json();
        setMedicalHistory(history);
      } catch (err) {
        console.error('Medical history error:', err);
      }
    };

    if (showDashboard) {
      fetchUserInfo();
      fetchMedicalHistory();
    }
  }, [showDashboard]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const userEmail = getStoredEmail();
    try {
      const res = await fetch('http://localhost:8080/se-ems/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({ ...userData, email: userEmail })
      });

      if (!res.ok) throw new Error('Update failed');
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile');
    }
  };

  return (
    <div className="dashboard">
      {!showDashboard ? (
        <Frontpage onGetStarted={() => setShowDashboard(true)} />
      ) : (
        <div className="dashboard-container">
          <h1>Emergency Medical Service Dashboard</h1>

          <button 
             onClick={() => setShowDashboard(false)}
             className="back-btn"
             >
             ← Back to Home
             </button>

          <button
            onClick={() => setIsEditing((prev) => !prev)}
            className="edit-btn"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>

          {error && <div className="error-message">{error}</div>}
          {loading ? (
            <p>Loading user data...</p>
          ) : (
            <>
              <div className="details-grid">
                {[
                  { label: 'Full Name', name: 'fullName' },
                  { label: 'Age', name: 'age' },
                  { label: 'Gender', name: 'gender' },
                  { label: 'Blood Group', name: 'blood' },
                  { label: 'Emergency Contact', name: 'emergencyContact' },
                  { label: 'Allergies', name: 'allergies' }
                ].map(({ label, name }) => (
                  <div className="detail-item" key={name}>
                    <label>{label}:</label>
                    {isEditing ? (
                      name === 'allergies' ? (
                        <textarea
                          name={name}
                          value={userData[name] || ''}
                          onChange={handleChange}
                        />
                      ) : (
                        <input
                          type="text"
                          name={name}
                          value={userData[name] || ''}
                          onChange={handleChange}
                        />
                      )
                    ) : (
                      <p>{userData[name] || 'N/A'}</p>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <button onClick={handleSave} className="submit-button">
                  Save Changes
                </button>
              )}

              {/* 🏥 Medical History Table */}
              <div className="medical-history-section">
                <h2>Medical History</h2>
                {medicalHistory.length === 0 ? (
                  <p>No medical history available.</p>
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
                          <td>{entry.date}</td>
                          <td>{entry.diagnosis}</td>
                          <td>{entry.treatment}</td>
                          <td>{entry.doctor || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
