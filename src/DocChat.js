import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './docchat.css';

const socket = io('http://localhost:5001'); // Backend server URL

const DoctorChat = () => {
  const room = 'hospital123'; // Shared room ID for both doctor and patient
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Join the room on mount
    socket.emit('joinRoom', { room });

    // Listen for incoming messages
    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Clean up listener on unmount
    return () => {
      socket.off('message');
    };
  }, []);

  const sendReply = () => {
    if (input.trim()) {
      socket.emit('sendMessage', { room, text: input, sender: 'doctor' });
      setInput('');
    }
  };

  return (
    <div className="chat-box">
      <h2>Live Chat with Patient</h2>

      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <strong>{msg.sender === 'doctor' ? 'You' : 'Patient'}:</strong> {msg.text}
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
  );
};

export default DoctorChat;
