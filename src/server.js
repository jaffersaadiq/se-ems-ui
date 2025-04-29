const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

let hospitalRooms = {};
let users = [];     // Patients (temporary, should use DB later)
let doctors = [];   // Doctors (temporary, should use DB later)

// 🔌 Socket.IO Logic
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Joining the same room for both users and doctors
  socket.on('joinRoom', ({ room }) => {
    socket.join(room);
    console.log(`Client ${socket.id} joined room ${room}`);
  });

  // Unified messaging event for both doctor and user
  socket.on('sendMessage', ({ room, text, sender }) => {
    io.to(room).emit('message', { text, sender });
    console.log(`Message from ${sender}: ${text}`);
  });

  socket.on('doctorOnline', ({ hospitalId }) => {
    hospitalRooms[hospitalId] = true;
    io.emit('hospitalStatus', { hospitalId, status: 'online' });
  });

  socket.on('doctorOffline', ({ hospitalId }) => {
    hospitalRooms[hospitalId] = false;
    io.emit('hospitalStatus', { hospitalId, status: 'offline' });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ✅ Registration Endpoint
app.post('/api/register', (req, res) => {
  const { userType, fullName, email, phone, password, specialty, licenseNumber } = req.body;

  const commonData = { fullName, email, phone, password };

  if (userType === 'doctor') {
    if (!specialty || !licenseNumber) {
      return res.status(400).json({ error: 'Incomplete doctor registration data.' });
    }
    doctors.push({ ...commonData, specialty, licenseNumber });
    console.log('New Doctor registered:', fullName);
  } else {
    users.push(commonData);
    console.log('New Patient registered:', fullName);
  }

  res.status(201).json({ message: 'Registration successful.' });
});

// ✅ Login Endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);
  const doctor = doctors.find(d => d.email === email && d.password === password);

  if (doctor) {
    return res.json({ userType: 'doctor' });
  } else if (user) {
    return res.json({ userType: 'user' });
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});

// 🏥 Get all registered doctors
app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

// 🏁 Server running
server.listen(5001, () => {
  console.log('Server running on port 5001');
});
