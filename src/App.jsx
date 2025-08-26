import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import NotFound from "./page/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Visitors from "./components/Visitors";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LoginForm />} />

        <Route
          path="/visitors"
          element={
            <ProtectedRoute>
              <Visitors />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
