import React from 'react'
import logo from "../assets/logo/logo3.png";


function Navbar() {
  return (
    <>
    <nav>
        <div className="container py-4">
      <img
        src={logo}
        alt="Logo"
        className="img-fluid mb-3 rounded top-logo"
        // style={{ width: "100%", objectFit: "cover" }}
      />
      </div>
    </nav>
      
    </>
  )
}

export default Navbar
