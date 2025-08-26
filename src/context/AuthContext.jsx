/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { useNavigate , useLocation  } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const navigate = useNavigate();
  const location = useLocation();
  // Use a ref to store the timeout ID
  const inactivityTimeoutRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000; 
  const REFRESH_TOLERANCE = 5 * 60; 

  // Function to decode JWT to get expiry time
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error decoding JWT:", e);
      return null;
    }
  };

  // --- Login/Logout Handlers ---
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    resetInactivityTimer(); // Start timer on login
  };

  const logout = (redirect = true) => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current); // Clear timer on logout
    }
    if (redirect) {
      navigate("/");
      // alert(
      //   "Your session has expired or you have been logged out due to inactivity."
      // );
    }
  };

  // --- Token Refresh Logic ---
  const refreshToken = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      logout();
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/api/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        login(data.token); // Store and set the new token
        console.log("Token refreshed successfully.");
        return true;
      } else {
        console.error("Failed to refresh token:", res.status, await res.text());
        logout(); // Log out if refresh fails
        return false;
      }
    } catch (error) {
      console.error("Error during token refresh:", error);
      logout(); // Log out on network error
      return false;
    }
  };

  // --- Inactivity Timer Logic ---
  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    inactivityTimeoutRef.current = setTimeout(() => {
      console.log("Inactivity detected. Logging out...");
      logout(); // Pass true to redirect and show alert
    }, INACTIVITY_TIMEOUT);
  };

  const handleUserActivity = () => {
    if (isAuthenticated) {
      // Only reset if logged in
      resetInactivityTimer();
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      resetInactivityTimer(); // Start timer when authenticated
     
      window.addEventListener("mousemove", handleUserActivity);
      window.addEventListener("keydown", handleUserActivity);
      window.addEventListener("scroll", handleUserActivity);
      window.addEventListener("click", handleUserActivity);
    } else {
    
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
    }

    return () => {
      // Cleanup on component unmount
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
    };
  }, [isAuthenticated, navigate , location.pathname]);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const url = args[0];
      const options = args[1] || {};

      if (
        url.includes("/api/auth/admin/login") ||
        url.includes("/api/refresh-token") ||
        url.startsWith("/uploads")
      ) {
        return originalFetch(...args);
      }

      let currentToken = localStorage.getItem("token");
      if (!currentToken) {
        return Promise.reject(new Error("No token available. Please log in."));
      }

      const decodedToken = decodeJwt(currentToken);
      if (decodedToken && decodedToken.exp) {
        const currentTime = Date.now() / 1000; // in seconds
        const expiryTime = decodedToken.exp; // in seconds

        if (expiryTime - currentTime < REFRESH_TOLERANCE) {
          console.log("Token expiring soon or expired. Attempting refresh...");
          const refreshed = await refreshToken(); 
          if (!refreshed) {
            return Promise.reject(new Error("Token refresh failed."));
          }
          resetInactivityTimer();
          // currentToken = localStorage.getItem("token"); 
        }
      }

      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${currentToken}`,
      };

      try {
        const response = await originalFetch(url, options);

        if (response.status === 401) {
          console.log("Received 401. Attempting token refresh...");
          const refreshed = await refreshToken();
          if (refreshed) {
            const retryOptions = { ...options };
            retryOptions.headers = {
              ...options.headers,
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            };
            console.log("Retrying request after refresh...");
            return originalFetch(url, retryOptions);
          } else {
            logout();
            return Promise.reject(
              new Error("Token refresh failed, logging out.")
            );
          }
        }
        return response;
      } catch (error) {
        console.error("Fetch intercepted error:", error);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isAuthenticated, API_URL]); // Depend on isAuthenticated and API_URL

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated, login, logout, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
