import React, { useEffect, useState } from 'react';
import './Dashboard_Module.css';
import Frontpage from './frontpage';

const Dashboard = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [userData, setUserData] = useState({
    id: '',
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
    return localStorage.getItem('useremail') || 
           localStorage.getItem('userEmail') ||
           localStorage.getItem('email');
  };

  useEffect(() => {
    const fetchData = async () => {
      const userEmail = getStoredEmail();
      if (!userEmail) {
        setError('Please login first - no user email found');
        setLoading(false);
        return;
      }

      try {
        // Fetch user info
        const userRes = await fetch(
          `http://localhost:8080/se-ems/user/byEmail?email=${encodeURIComponent(userEmail)}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
            }
          }
        );
        
        if (!userRes.ok) throw new Error(`Failed to fetch user data: ${userRes.status}`);
        const userData = await userRes.json();
        setUserData(userData);

        // Fetch medical history with userId
        const historyRes = await fetch(
          `http://localhost:8080/se-ems/user/medical/history?userId=${userData.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
            }
          }
        );
        
        if (!historyRes.ok) throw new Error('Failed to fetch medical history');
        const history = await historyRes.json();
        setMedicalHistory(history);

      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (showDashboard) fetchData();
  }, [showDashboard, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const userEmail = getStoredEmail();
      
      if (!token || !userEmail) {
        throw new Error('Authentication required - Please login again');
      }

      if (!userData.id) {
        throw new Error('User ID not found - Try refreshing the page');
      }

      // Prepare the update payload
      const payload = {
        userId: userData.id,
        email: userEmail,
        fullName: userData.fullName,
        age: Number(userData.age),  // Convert to number
        gender: userData.gender,
        blood: userData.blood,
        emergencyContact: userData.emergencyContact,
        allergies: userData.allergies
      };

      console.log('Sending update payload:', payload); // Debug log

      const res = await fetch('http://localhost:8080/se-ems/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      // Handle response
      const contentType = res.headers.get('content-type');
      const data = contentType?.includes('application/json') 
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        throw new Error(
          data.message || 
          data.error || 
          `Update failed with status ${res.status}`
        );
      }

      // Refresh user data after successful update
      const refreshedRes = await fetch(
        `http://localhost:8080/se-ems/user/byEmail?email=${encodeURIComponent(userEmail)}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const refreshedData = await refreshedRes.json();
      
      setUserData(refreshedData);
      setIsEditing(false);
      setError('');
      
      // Show success message
      setTimeout(() => {
        alert('Profile updated successfully!');
      }, 100);

    } catch (err) {
      console.error('Update error:', err);
      setError(err.message);
      
      // Show specific error messages
      if (err.message.includes('400')) {
        alert('Validation error - Check your input values');
      } else if (err.message.includes('401')) {
        alert('Session expired - Please login again');
      } else {
        alert(`Update failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="dashboard">
      {!showDashboard ? (
        <Frontpage onGetStarted={() => setShowDashboard(true)} />
      ) : (
        <div className="dashboard-container">
          <div className="dashboard-header">
            <button onClick={() => setShowDashboard(false)} className="back-btn">
              ← Back to Home
            </button>
            <h1>Emergency Medical Service Dashboard</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`edit-btn ${isEditing ? 'cancel' : ''}`}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <>
              <div className="profile-section">
                <div className="details-grid">
                  {[
                    { label: 'Full Name', name: 'fullName', type: 'text' },
                    { label: 'Age', name: 'age', type: 'number' },
                    { label: 'Gender', name: 'gender', type: 'text' },
                    { label: 'Blood Group', name: 'blood', type: 'text' },
                    { label: 'Emergency Contact', name: 'emergencyContact', type: 'tel' }
                  ].map(({ label, name, type }) => (
                    <div className="detail-item" key={name}>
                      <label>{label}:</label>
                      {isEditing ? (
                        <input
                          type={type}
                          name={name}
                          value={userData[name] || ''}
                          onChange={handleChange}
                        />
                      ) : (
                        <p>{userData[name] || 'N/A'}</p>
                      )}
                    </div>
                  ))}
                  <div className="detail-item allergy-item">
                    <label>Allergies:</label>
                    {isEditing ? (
                      <textarea
                        name="allergies"
                        value={userData.allergies || ''}
                        onChange={handleChange}
                        rows={3}
                      />
                    ) : (
                      <p>{userData.allergies || 'None reported'}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="action-buttons">
                    <button onClick={handleSave} className="save-btn">
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="medical-history-section">
                <h2>Medical History</h2>
                {medicalHistory.length > 0 ? (
                  <div className="table-container">
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
                            <td>{new Date(entry.date).toLocaleDateString()}</td>
                            <td>{entry.diagnosis}</td>
                            <td>{entry.treatment}</td>
                            <td>{entry.doctor || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-history">No medical history records found.</p>
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