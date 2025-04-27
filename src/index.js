import React from "react";
import ReactDOM from "react-dom/client";
import Login from "./login";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import "./index.css";
import Frontpage from './frontpage';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    
    <React.StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} /> {/* Login page as the default route */}
          <Route path="/" element={<Frontpage />} /> {/* Frontpage */}
          <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard route */}
        </Routes>
      </Router>
    </React.StrictMode>
  );
  