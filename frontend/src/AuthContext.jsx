import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [attendee, setAttendee] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("attendee")) || null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");

  function login(data) {
    setAttendee(data.attendee);
    setToken(data.token);
    setRole(data.role);
    localStorage.setItem("attendee", JSON.stringify(data.attendee));
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
  }

  function logout() {
    setAttendee(null);
    setToken("");
    setRole("");
    localStorage.removeItem("attendee");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }

  return (
    <AuthContext.Provider value={{ attendee, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
