import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from "./login";
import Dashboard from "./Dashboard";
import Frontpage from "./frontpage";
import Registration from "./Registration";
import DoctorChat from "./DocChat"; // 👈 make sure you import this
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/frontpage" element={<Frontpage />} />
        <Route path="/docchat" element={<DoctorChat />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Registration />} />
        {/* Optional fallback */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  </React.StrictMode>
);
