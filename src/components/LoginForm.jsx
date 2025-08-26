import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext"; // Import useAuth

function LoginForm() {
  const [form, setForm] = useState({ admin_email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth(); // Get login function and isAuthenticated from context

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/visitors");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Login successful");
        login(data.token); // Use the login function from context
        navigate("/visitors");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again.");
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    // Use Bootstrap container for centering and padding
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      {/* Bootstrap card for a nice login form container */}
      <div
        className="card p-4 shadow-lg"
        style={{ maxWidth: "400px", width: "100%", backgroundColor: "#d6eaf8" }}
      >
        <h2 className="card-title text-center mb-4">LOGIN</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            {" "}
            {/* Margin bottom for spacing */}
            <input
              className="form-control" // Bootstrap form control
              type="email"
              placeholder="Email"
              value={form.admin_email}
              onChange={(e) =>
                setForm({ ...form, admin_email: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-3 position-relative">
            {" "}
            {/* Add position-relative for absolute positioning of eye icon */}
            <input
              className="form-control" // Bootstrap form control
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <span
              className="position-absolute end-0 top-50 translate-middle-y pe-3" // Absolute positioning for icon
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }} // Add inline style for cursor
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="btn w-100 mt-3"
            style={{
              backgroundColor: "#2fb5e4",
              borderColor: "#2fb5e4",
              color: "white",
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
