/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";


function InnovationSphere() {
  const { logout } = useAuth();

  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [selectedOption, setSelectedOption] = useState("HVAC");
  const [errorMessage, setErrorMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const innovationSphereOptions = [
    "HVAC",
    "Electrical’s Wires",
    "Smart Automation",
    "Solar Energy",
    "Fire and Safety",
    "Water Treatment",
    "Landscape",
    "Acostic Solutions",
    "Insulation",
    "Rain Water Harvesting",
    "Waste Management",
    "3 D Print",
    "Construction",
  ];

  const fetchVisitorsByInnovationSphere = async (page, limit, option) => {
    try {
      setLoading(true); // start loading
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/form/filter-by-innovation-sphere?option=${encodeURIComponent(
          option
        )}&page=${page}&limit=${limit}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("Visitors API Response:", data);

      // ✅ Corrected to use data.data instead of data.visitors
      if (data.success && data.data?.length > 0) {
        setVisitors(data.data);

        setPagination({
          totalItems: data.totalItems,
          totalPages: data.totalPages,
          currentPage: data.currentPage,
          itemsPerPage: data.perPage,
        });

        setErrorMessage("");
      } else {
        setVisitors([]);
        setPagination({
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: 10,
        });
        setErrorMessage("No visitors found for this category.");
      }
    } catch (err) {
      console.error("Error fetching visitors:", err);
      setErrorMessage("Something went wrong while fetching visitors.");
      setVisitors([]);
    } finally {
      setLoading(false); // ✅ stop loading here
    }
  };

  useEffect(() => {
    fetchVisitorsByInnovationSphere(1, 10, selectedOption);
  }, [selectedOption]);

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchVisitorsByInnovationSphere(
      page,
      pagination.itemsPerPage,
      selectedOption
    );
  };

  return (
    <div className="container-fluid mt-4">
      <h1 className="mb-4 text-center fw-bold text-uppercase heading">Innovation Sphere</h1>

      <form className="d-flex flex-wrap justify-content-center gap-3 mb-3 search-bar">
        <Link
          to="/visitors"
          className="btn glow-btn fw-bold text-uppercase"
        >
          Home
        </Link>
        <Link
          to="/structural-spectrum"
          className="btn glow-btn fw-bold text-uppercase"
        >
          Structural Spectrum
        </Link>

        <Link
          to="/prestige-and-panache"
          className="btn glow-btn fw-bold text-uppercase"
        >
          Prestige & Panache
        </Link>

        
      </form>

      <div className="row">
        {/* LEFT SIDE FILTERS */}
        <div
          className="col-md-3 sticky-sidebar"
          
        >
          <h5 className="fw-bold mb-3">SELECT OPTION</h5>
          <div className="list-group">
            {innovationSphereOptions.map((opt, idx) => (
              <div key={idx} className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  name="prestigeOption"
                  id={`opt-${idx}`}
                  checked={selectedOption === opt}
                  onChange={() => setSelectedOption(opt)}
                />
                <label className="form-check-label" htmlFor={`opt-${idx}`}>
                  {opt}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE TABLE */}
        <div className="col-md-9">
          {/* Pagination Controls */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <button
                className="btn btn-sm btn-outline-primary me-2"
                disabled={pagination?.currentPage === 1}
                onClick={() =>
                  fetchVisitorsByInnovationSphere(
                    pagination.currentPage - 1,
                    pagination.itemsPerPage,
                    selectedOption
                  )
                }
              >
                Prev
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                disabled={pagination?.currentPage === pagination?.totalPages}
                onClick={() =>
                  fetchVisitorsByInnovationSphere(
                    pagination.currentPage + 1,
                    pagination.itemsPerPage,
                    selectedOption
                  )
                }
              >
                Next
              </button>
            </div>
          </div>

          {/* Pagination Numbers */}
          <nav aria-label="Page navigation">
            <ul className="pagination">
              <li
                className={`page-item ${
                  pagination.currentPage === 1 ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Previous
                </button>
              </li>

              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <li
                  key={i + 1}
                  className={`page-item ${
                    pagination.currentPage === i + 1 ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}

              <li
                className={`page-item ${
                  pagination.currentPage === pagination.totalPages
                    ? "disabled"
                    : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>

          {/* Data Table */}
          <div className="table-responsive mt-3">
            {loading ? (
              <div className="text-center p-3">Loading...</div>
            ) : (
              <table className="table table-striped table-bordered table-hover">
                <thead>
                  <tr>
                    <th className="thead-bg">Visitor Profile</th>
                    <th className="thead-bg">Company Name</th>
                    <th className="thead-bg">Contact Person</th>
                    <th className="thead-bg">Designation</th>
                    <th className="thead-bg">Mobile Number</th>
                    <th className="thead-bg">Email</th>
                    <th className="thead-bg">Innovation Sphere</th>
                    <th className="thead-bg">Project Location</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.length > 0 ? (
                    visitors.map((v) => (
                      <tr key={v.id}>
                        <td>{v.visitorProfile || "-"}</td>
                        <td>{v.companyName || "-"}</td>
                        <td>{v.contactPerson || "-"}</td>
                        <td>{v.designation || "-"}</td>
                        <td>{v.mobileNumber || "-"}</td>
                        <td>{v.email || "-"}</td>
                        <td>
                          {(() => {
                            try {
                              const parsed = JSON.parse(v.greenZone);
                              return Array.isArray(parsed)
                                ? parsed.join(", ")
                                : parsed;
                            } catch {
                              return v.greenZone || "-";
                            }
                          })()}
                        </td>
                        <td>{v.projectLocation || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No visitors found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InnovationSphere;
