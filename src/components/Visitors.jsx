/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { FaEdit } from "react-icons/fa";

function Visitors() {
  const { logout } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [eventDay, setEventDay] = useState("Day1");

  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate(); // Initialize useNavigate

  const handleEditClick = (id) => {
    navigate(`/edit-visitor/${id}`);
  };

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/form/search?name=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          logout();
          return;
        }

        if (res.status === 404) {
          setVisitors([]);
          setPagination({
            totalItems: 0,
            totalPages: 0,
            currentPage: 1,
            itemsPerPage: 0,
          });
          return;
        }

        throw new Error("Failed to fetch search results");
      }

      const data = await res.json();
      setVisitors(data || []);
      setPagination({
        totalItems: data.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: data.length,
      });
    } catch (err) {
      console.error("Error fetching search results:", err);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitorsByEventDay = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/form/filter-by-eventday?eventDay=${eventDay}&page=${page}&limit=${limit}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          logout();
        }
        throw new Error("Failed to fetch visitors");
      }

      const result = await res.json();

      setVisitors(result.data || []);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Error fetching visitors by eventDay:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitorsByEventDay(1, 10);
  }, [eventDay]);

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchVisitorsByEventDay(page, pagination.itemsPerPage);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === "") {
      fetchVisitorsByEventDay(1, pagination.itemsPerPage);
    } else {
      fetchSearchResults();
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-3 text-center fw-bold heading">
        NAVIG8 VISION DIRECTORY
      </h1>

      <form className="d-flex flex-wrap justify-content-center gap-3 mb-3 search-bar">
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

        <Link
          to="/innovation-sphere"
          className="btn glow-btn fw-bold text-uppercase"
        >
          Innovation Sphere
        </Link>
      </form>

      <form
        className="d-flex justify-content-center mb-3 search-bar"
        onSubmit={handleSearchSubmit}
      >
        <input
          type="text"
          className="form-control w-50 me-2"
          placeholder="Search by Contact Person..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn glow-btn fw-bold" type="submit">
          Search
        </button>
      </form>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <select
          className="form-select w-auto"
          value={eventDay}
          onChange={(e) => setEventDay(e.target.value)}
        >
          <option value="Day1">Day 1</option>
          <option value="Day2">Day 2</option>
        </select>

        <div>
          <button
            className="btn btn-sm btn-outline-primary me-2"
            disabled={pagination?.currentPage === 1}
            onClick={() =>
              fetchVisitorsByEventDay(
                pagination.currentPage - 1,
                pagination.itemsPerPage
              )
            }
          >
            Prev
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={pagination?.currentPage === pagination?.totalPages}
            onClick={() =>
              fetchVisitorsByEventDay(
                pagination.currentPage + 1,
                pagination.itemsPerPage
              )
            }
          >
            Next
          </button>
        </div>
      </div>

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
              pagination.currentPage === pagination.totalPages ? "disabled" : ""
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

      <div className="table-responsive mt-3">
        {loading ? (
          <div className="text-center p-3 ">Loading...</div>
        ) : (
          <table className="table table-striped table-bordered table-hover">
            <thead className=" thead-bg">
              <tr>
                <th className="thead-bg">Action</th> {/* New Action column */}
                <th className="thead-bg">Image</th>
                <th className="w-200 thead-bg">Visitor Profile</th>
                <th className="w-200 thead-bg">Visitor Profile Other</th>
                <th className="w-200 thead-bg">Company Name</th>
                <th className="w-200 thead-bg">Contact Person</th>
                <th className="w-200 thead-bg">Designation</th>
                <th className="thead-bg">Mobile Number</th>
                <th className="w-350 thead-bg">Address</th>
                <th className="thead-bg">Email</th>
                <th className="w-200 thead-bg">Website</th>
                <th className="w-350 thead-bg">Personal Insta</th>
                <th className="w-350 thead-bg">Company Insta</th>
                <th className="w-350 thead-bg">Personal Linkedin</th>
                <th className="w-350 thead-bg">Company Linkedin</th>
                <th className="w-350 thead-bg">Project Types</th>
                <th className="w-200 thead-bg">Project Location</th>
                <th className="thead-bg">Expected Start Date</th>
                <th className="w-200 thead-bg">Project Size</th>
                <th className="w-350 thead-bg">Projects 2026</th>
                <th className="w-350 thead-bg">Structural Spectrum</th>
                <th className="w-350 thead-bg">Prestige Panache</th>
                <th className="w-350 thead-bg">Innovation Sphere</th>
                <th className="w-350 thead-bg">Preferred Suppliers</th>
                <th className="w-350 thead-bg">Challenges</th>
                <th className="w-350 thead-bg">Vision</th>
              </tr>
            </thead>
            <tbody>
              {visitors.length > 0 ? (
                visitors.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleEditClick(v.id)}
                      >
                        <FaEdit />
                      </button>
                    </td>
                    <td>
                      {v.image ? (
                        <img
                          src={v.image}
                          alt="visitor"
                          width="60"
                          height="60"
                          className="rounded "
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>{v.visitorProfile}</td>
                    <td>{v.visitorProfileOther || "-"}</td>
                    <td>{v.companyName}</td>
                    <td>{v.contactPerson}</td>
                    <td>{v.designation}</td>
                    <td>{v.mobileNumber}</td>
                    <td>{v.address || "-"}</td>
                    <td>{v.email}</td>
                    <td>{v.website}</td>
                    <td>{v.personalInsta}</td>
                    <td>{v.firmInsta}</td>
                    <td>{v.personalLinkedin}</td>
                    <td>{v.firmLinkedin}</td>
                    <td>
                      {Array.isArray(JSON.parse(v.projectTypes))
                        ? JSON.parse(v.projectTypes).join(", ")
                        : v.projectTypes}
                    </td>

                    <td>{v.projectLocation}</td>
                    <td>
                      {new Date(v.expectedStartDate).toLocaleDateString()}
                    </td>
                    <td>{v.projectSize}</td>
                    <td>
                      {Array.isArray(JSON.parse(v.projects2026))
                        ? JSON.parse(v.projects2026).join(", ")
                        : v.projects2026}
                    </td>
                    <td>
                      {Array.isArray(JSON.parse(v.structuralSpectrum))
                        ? JSON.parse(v.structuralSpectrum).join(", ")
                        : v.structuralSpectrum}
                    </td>
                    <td>
                      {Array.isArray(JSON.parse(v.prestigePanache))
                        ? JSON.parse(v.prestigePanache).join(", ")
                        : v.prestigePanache}
                    </td>
                    <td>
                      {Array.isArray(JSON.parse(v.greenZone))
                        ? JSON.parse(v.greenZone).join(", ")
                        : v.greenZone}
                    </td>
                    <td>{v.preferredSuppliers}</td>
                    <td>{v.challenges}</td>
                    <td>{v.vision}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="25" className="text-center">
                    No visitors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Visitors;
