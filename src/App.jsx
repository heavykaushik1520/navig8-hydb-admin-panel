import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import NotFound from "./page/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Visitors from "./components/Visitors";
import UpdateVisitor from "./components/UpdateVisitor.jsx";
import PrestigePanache from "./components/PrestigePanache.jsx";
import StructuralSpectrum from "./components/StructuralSpectrum.jsx";
import InnovationSphere from "./components/InnovationSphere.jsx";
import Navbar from "./components/Navbar.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <>
      
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

          <Route
            path="/edit-visitor/:id"
            element={
              <ProtectedRoute>
                <UpdateVisitor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/prestige-and-panache"
            element={
              <ProtectedRoute>
                <PrestigePanache />
              </ProtectedRoute>
            }
          />

          <Route
            path="/structural-spectrum"
            element={
              <ProtectedRoute>
                <StructuralSpectrum />
              </ProtectedRoute>
            }
          />

          <Route
            path="/innovation-sphere"
            element={
              <ProtectedRoute>
                <InnovationSphere />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
