import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, isStaff } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a customer tries to access staff-only dashboard routes, redirect to landing page
  if (user.type === "customer") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
