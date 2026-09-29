import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("luxurystay_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem("luxurystay_bookings");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "BK-70921",
            roomName: "Presidential Sky Suite",
            roomType: "Presidential Suite",
            checkIn: "2026-10-12",
            checkOut: "2026-10-16",
            guests: 2,
            totalPrice: 3400,
            status: "Confirmed",
            createdAt: "2026-09-14",
          },
        ];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("luxurystay_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("luxurystay_user");
      localStorage.removeItem("luxurystay_token");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("luxurystay_bookings", JSON.stringify(bookings));
  }, [bookings]);

  const login = (userData, token = null) => {
    setUser(userData);
    if (token) {
      localStorage.setItem("luxurystay_token", token);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    setUser(null);
  };

  const addBooking = (bookingData) => {
    const newBooking = {
      id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString().split("T")[0],
      status: "Confirmed",
      ...bookingData,
    };
    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const cancelBooking = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b))
    );
  };

  const isCustomer = user?.type === "customer" || user?.role === "Customer";
  const isStaff = user?.type === "staff" || (!user?.type && user?.role && user.role !== "Customer");
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        bookings,
        addBooking,
        cancelBooking,
        isCustomer,
        isStaff,
        isLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
