import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    
    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100 text-center">
      <h1 className="display-1 fw-bold text-danger">404</h1>
      <h2 className="mb-3">Page Not Found</h2>
      <p className="lead">The page you are looking for does not exist.</p>
      <Link to="/visitors" className="btn btn-primary mt-3">Go to Homepage</Link>
    </div>
  );
}

export default NotFound;
