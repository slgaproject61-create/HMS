import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

// Public Guest Luxury Pages
import LandingPage from "./pages/LandingPage";
import SuitesPage from "./pages/SuitesPage";
import DiningPage from "./pages/DiningPage";
import SpaPage from "./pages/SpaPage";
import ExperiencesPage from "./pages/ExperiencesPage";
import HeritagePage from "./pages/HeritagePage";
import ContactPage from "./pages/ContactPage";

// Authentication
import Login from "./pages/Login";
import StaffLogin from "./pages/StaffLogin";

// Protected Staff & Management Console Pages
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import GuestProfiles from "./pages/GuestProfiles";
import RoomManagement from "./pages/RoomManagement";
import Reservations from "./pages/Reservations";
import Billing from "./pages/Billing";
import Operations from "./pages/Operations";
import Analytics from "./pages/Analytics";
import Feedback from "./pages/Feedback";
import Services from "./pages/Services";
import Settings from "./pages/Settings";

import "./index.css";
import "./landing.css";

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="main-area">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="page-content page-enter">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Guest Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/suites" element={<SuitesPage />} />
          <Route path="/dining" element={<DiningPage />} />
          <Route path="/spa" element={<SpaPage />} />
          <Route path="/experiences" element={<ExperiencesPage />} />
          <Route path="/heritage" element={<HeritagePage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Guest Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login initialTab="customer-signup" />} />

          {/* Dedicated Separate Staff & Admin Login */}
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/admin/login" element={<StaffLogin />} />

          {/* Protected Staff Management Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><AppLayout><UserManagement /></AppLayout></ProtectedRoute>} />
          <Route path="/guests" element={<ProtectedRoute><AppLayout><GuestProfiles /></AppLayout></ProtectedRoute>} />
          <Route path="/rooms" element={<ProtectedRoute><AppLayout><RoomManagement /></AppLayout></ProtectedRoute>} />
          <Route path="/reservations" element={<ProtectedRoute><AppLayout><Reservations /></AppLayout></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute><AppLayout><Billing /></AppLayout></ProtectedRoute>} />
          <Route path="/operations" element={<ProtectedRoute><AppLayout><Operations /></AppLayout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><AppLayout><Feedback /></AppLayout></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><AppLayout><Services /></AppLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />

          {/* Redirect old routes */}
          <Route path="/housekeeping" element={<Navigate to="/operations" replace />} />
          <Route path="/maintenance" element={<Navigate to="/operations" replace />} />
          <Route path="/checkinout" element={<Navigate to="/reservations" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
