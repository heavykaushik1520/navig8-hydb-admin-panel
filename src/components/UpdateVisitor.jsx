import React, { useState, useEffect } from "react";
import { useParams, useNavigate  } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL || "https://artiststation.co.in/navig8-hydb-api";

function UpdateVisitor() {
  const { id } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    visitorProfile: "",
    visitorProfileOther: "",
    companyName: "",
    contactPerson: "",
    designation: "",
    mobileNumber: "",
    address: "",
    email: "",
    website: "",
    personalInsta: "",
    firmInsta: "",
    personalLinkedin: "",
    firmLinkedin: "",
    projectTypes: [],
    projectLocation: "",
    expectedStartDate: "",
    projectSize: "",
    projects2026: [""],
    structuralSpectrum: [],
    prestigePanache: [],
    innovationSphere: [],
    preferredSuppliers: "",
    challenges: "",
    vision: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch existing visitor data
  useEffect(() => {
    const fetchVisitorData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          logout();
          return;
        }

        const res = await fetch(`${API_URL}/api/form/visitors/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) logout();
          throw new Error("Failed to fetch visitor data");
        }

        const data = await res.json();
        const visitorData = data.data;

        // Populate form data, parsing JSON strings back into arrays
        setFormData({
          ...visitorData,
          projectTypes: JSON.parse(visitorData.projectTypes || "[]"),
          structuralSpectrum: JSON.parse(
            visitorData.structuralSpectrum || "[]"
          ),
          prestigePanache: JSON.parse(visitorData.prestigePanache || "[]"),
          innovationSphere: JSON.parse(visitorData.innovationSphere || "[]"),
          projects2026: JSON.parse(visitorData.projects2026 || "[]"),
          // Format date for input field
          expectedStartDate: visitorData.expectedStartDate
            ? new Date(visitorData.expectedStartDate)
                .toISOString()
                .split("T")[0]
            : "",
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Could not load visitor data.");
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorData();
  }, [id, logout]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleCheckboxChange = (e, fieldName) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const currentValues = prev[fieldName] || [];
      if (checked) {
        return {
          ...prev,
          [fieldName]: [...currentValues, value],
        };
      } else {
        return {
          ...prev,
          [fieldName]: currentValues.filter((item) => item !== value),
        };
      }
    });
  };

  const handleProjectsChange = (index, value) => {
    const newProjects = [...formData.projects2026];
    newProjects[index] = value;
    setFormData({ ...formData, projects2026: newProjects });
  };

  const addProjectField = () => {
    setFormData({ ...formData, projects2026: [...formData.projects2026, ""] });
  };

  const removeProjectField = (index) => {
    const newProjects = formData.projects2026.filter((_, i) => i !== index);
    setFormData({ ...formData, projects2026: newProjects });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    for (const key in formData) {
      if (Array.isArray(formData[key])) {
        data.append(key, JSON.stringify(formData[key]));
      } else if (formData[key]) {
        data.append(key, formData[key]);
      }
    }
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/form/visitors/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) {
        if (res.status === 401) {
          logout();
          return;
        }
        throw new Error("Failed to update visitor");
      }

      alert("Visitor updated successfully!");
      // Optionally, redirect or clear form
      navigate("/visitors");
    } catch (err) {
      console.error("Update failed:", err);
      setError("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4 text-center">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4 text-center">
        <h2 className="text-danger">{error}</h2>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="col-10 mx-auto">
        <h2 className="text-center text-uppercase fw-bold mb-4 heading">
          Update Visitor Details
        </h2>
        <form onSubmit={handleSubmit} className="row g-3">
          {/* All form fields from original component */}
          <div className="col-md-6">
            <label className="form-label fw-bold label-text">
              Visitor Profile :
            </label>
            <select
              className="form-select "
              name="visitorProfile"
              value={formData.visitorProfile}
              onChange={handleChange}
            >
              <option value="">Select...</option>
              <option>Principal Architects</option>
              <option>Principal Interior Designers</option>
              <option>Government Officials</option>
              <option>International Buyers</option>
              <option>Other</option>
            </select>
          </div>

          {formData.visitorProfile === "Other" && (
            <div className="col-md-6">
              <label className="form-label fw-bold">Other... :</label>
              <input
                type="text"
                className="form-control"
                name="visitorProfileOther"
                value={formData.visitorProfileOther}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="col-md-6">
            <label className="form-label fw-bold">
              Upload Visitor's Picture :
            </label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <h4 className="fw-bold heading">COMPANY DETAILS</h4>

          <div className="col-md-6">
            <label className="form-label fw-bold">Company Name :</label>
            <input
              type="text"
              className="form-control"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Company Name"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">
              Contact Person<span className="text-danger">*</span> :
            </label>
            <input
              type="text"
              className="form-control"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Contact Person"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">
              Designation<span className="text-danger">*</span> :
            </label>
            <input
              type="text"
              className="form-control"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Designation"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">
              Mobile Number<span className="text-danger">*</span> :
            </label>
            <input
              type="text"
              className="form-control"
              name="mobileNumber"
              maxLength={10}
              pattern="[0-9]{10}"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Mobile Number"
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-bold">Address :</label>
            <textarea
              className="form-control"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">
              Email<span className="text-danger">*</span> :
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">Website :</label>
            <input
              type="text"
              className="form-control"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="Copy Paste Link Here"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">Personal Instagram :</label>
            <input
              type="text"
              className="form-control"
              name="personalInsta"
              value={formData.personalInsta}
              onChange={handleChange}
              placeholder="Copy Paste Link Here"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">Company Instagram :</label>
            <input
              type="text"
              className="form-control"
              name="firmInsta"
              value={formData.firmInsta}
              onChange={handleChange}
              placeholder="Copy Paste Link Here"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">Personal LinkedIn :</label>
            <input
              type="text"
              className="form-control"
              name="personalLinkedin"
              value={formData.personalLinkedin}
              onChange={handleChange}
              placeholder="Copy Paste Link Here"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">Company LinkedIn :</label>
            <input
              type="text"
              className="form-control"
              name="firmLinkedin"
              value={formData.firmLinkedin}
              onChange={handleChange}
              placeholder="Copy Paste Link Here"
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-bold">
              Types of Projects You Work On :
            </label>
            <div className="d-flex flex-wrap gap-3">
              {[
                "Commercial ",
                "Hospitality",
                "Industrial",
                "Institutional",
                "Residential",
                "Experiential Spaces",
              ].map((type) => (
                <div key={type} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={type}
                    id={`project-type-${type}`}
                    name="projectTypes"
                    checked={formData.projectTypes.includes(type)}
                    onChange={(e) => handleCheckboxChange(e, "projectTypes")}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`project-type-${type}`}
                  >
                    {type}
                  </label>
                </div>
              ))}
              <div className="form-check">
                <label
                  className="form-check-label fw-bold"
                  htmlFor="project-type-other"
                >
                  Other...
                </label>
                <input
                  type="text"
                  className="form-control d-inline w-auto"
                  value={
                    formData.projectTypes.find(
                      (t) =>
                        ![
                          "Commercial ",
                          "Hospitality",
                          "Industrial",
                          "Institutional",
                          "Residential",
                          "Experiential Spaces",
                        ].includes(t)
                    ) || ""
                  }
                  onChange={(e) => {
                    const predefined = [
                      "Commercial ",
                      "Hospitality",
                      "Industrial",
                      "Institutional",
                      "Residential",
                      "Experiential Spaces",
                    ];
                    const updatedOthers = formData.projectTypes.filter((t) =>
                      predefined.includes(t)
                    );
                    if (e.target.value) {
                      updatedOthers.push(e.target.value);
                    }
                    setFormData({ ...formData, projectTypes: updatedOthers });
                  }}
                  placeholder="Specify"
                />
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">Project Location :</label>
            <input
              type="text"
              className="form-control"
              name="projectLocation"
              value={formData.projectLocation}
              onChange={handleChange}
              placeholder="Project Location"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">Expected Start Date :</label>
            <input
              type="date"
              className="form-control"
              name="expectedStartDate"
              value={formData.expectedStartDate}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">Project Size :</label>
            <input
              type="text"
              className="form-control"
              name="projectSize"
              value={formData.projectSize}
              onChange={handleChange}
              placeholder="Project Size"
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-bold">Projects 2026 :</label>
            {formData.projects2026.map((project, index) => (
              <div key={index} className="d-flex mb-2">
                <input
                  type="text"
                  className="form-control me-2"
                  value={project}
                  onChange={(e) => handleProjectsChange(index, e.target.value)}
                  placeholder="Projects 2026"
                />
                {index === formData.projects2026.length - 1 && (
                  <button
                    type="button"
                    className="btn btn-success mx-1"
                    onClick={addProjectField}
                  >
                    +
                  </button>
                )}
                {formData.projects2026.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger mx-1"
                    onClick={() => removeProjectField(index)}
                  >
                    -
                  </button>
                )}
              </div>
            ))}
          </div>

          <h4 className="fw-bold heading">
            PRODUCT CATEGORIES OF INTEREST
          </h4>
          <div className="col-12 ms-3">
            <label className="form-label fw-bold">
              The Structural Spectrum :
            </label>
            <div className="row">
              {[
                "Cement",
                "Ready Mix Concrete",
                "Bricks and Blocks",
                "Structural Steel",
                "TMT Bars",
                "Roofing Solutions",
                "Waterproofing Chemicals and Adhesives",
                "Paints and Coatings",
                "Elevator",
                "Facade",
                "Formwork",
                "PEB Structure",
                "Glass Facade",
                "Plumbing and Pipes",
              ].map((spectrum) => (
                <div
                  key={spectrum}
                  className="col-md-4 col-sm-6 form-check mb-2"
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={spectrum}
                    id={`spectrum-${spectrum.replace(/\s/g, "-")}`}
                    name="structuralSpectrum"
                    checked={formData.structuralSpectrum.includes(spectrum)}
                    onChange={(e) =>
                      handleCheckboxChange(e, "structuralSpectrum")
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`spectrum-${spectrum.replace(/\s/g, "-")}`}
                  >
                    {spectrum}
                  </label>
                </div>
              ))}
              <div className="col-md-4 col-sm-6 d-flex align-items-center mb-2">
                <label
                  className="form-check-label fw-bold me-2"
                  htmlFor="spectrum-other"
                >
                  Other...
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={
                    formData.structuralSpectrum.find(
                      (s) =>
                        ![
                          "Cement",
                          "Ready Mix Concrete",
                          "Bricks and Blocks",
                          "Structural Steel",
                          "TMT Bars",
                          "Roofing Solutions",
                          "Waterproofing Chemicals and Adhesives",
                          "Paints and Coatings",
                          "Elevator",
                          "Facade",
                          "Formwork",
                          "PEB Structure",
                          "Glass Facade",
                          "Plumbing and Pipes",
                        ].includes(s)
                    ) || ""
                  }
                  onChange={(e) => {
                    const predefined = [
                      "Cement",
                      "Ready Mix Concrete",
                      "Bricks and Blocks",
                      "Structural Steel",
                      "TMT Bars",
                      "Roofing Solutions",
                      "Waterproofing Chemicals and Adhesives",
                      "Paints and Coatings",
                      "Elevator",
                      "Facade",
                      "Formwork",
                      "PEB Structure",
                      "Glass Facade",
                      "Plumbing and Pipes",
                    ];
                    const updatedOthers = formData.structuralSpectrum.filter(
                      (s) => predefined.includes(s)
                    );
                    if (e.target.value) {
                      updatedOthers.push(e.target.value);
                    }
                    setFormData({
                      ...formData,
                      structuralSpectrum: updatedOthers,
                    });
                  }}
                  placeholder="Specify"
                />
              </div>
            </div>
          </div>

          <div className="col-12 ms-3">
            <label className="form-label fw-bold">Prestige & Panache :</label>
            <div className="row">
              {[
                "Marble",
                "Tiles",
                "Quartz",
                "Terrazzo",
                "Wooden Flooring",
                "Laminate",
                "Rugs and Carpet",
                "Artefacts",
                "Sculptures",
                "Decorative Cladding",
                "Stone Cladding",
                "Fencing",
                "Garden and Outdoor Furniture",
                "Kitchen Appliances",
                "Luxury Furniture",
                "Wooden Furniture",
                "Luxury Lighting",
                "Mattress",
                "Office Furniture",
                "Swimming Pools",
                "Switches and Sockets",
                "Wallpaper",
                "Wooden Doors",
                "UPVC Doors and Windows",
                "Aluminum Doors and Windows",
                "Curtain Wall Systems",
                "ACP Panels",
                "Shading and Louvers",
                "Railing and Balustrade",
                "False Ceiling",
                "Modular Kitchen and Wardrobe",
                "Hardware and Fittings",
                "Wellness",
                "Lighting",
                "Drones",
                "Pergolas and Gazebos",
              ].map((item) => (
                <div key={item} className="col-md-4 col-sm-6 form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={item}
                    id={`prestige-${item.replace(/\s/g, "-")}`}
                    name="prestigePanache"
                    checked={formData.prestigePanache.includes(item)}
                    onChange={(e) => handleCheckboxChange(e, "prestigePanache")}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`prestige-${item.replace(/\s/g, "-")}`}
                  >
                    {item}
                  </label>
                </div>
              ))}
              <div className="col-md-4 col-sm-6 d-flex align-items-center mb-2">
                <label
                  className="form-check-label fw-bold me-2"
                  htmlFor="prestige-other"
                >
                  Other...
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={
                    formData.prestigePanache.find(
                      (s) =>
                        ![
                          "Marble",
                          "Tiles",
                          "Quartz",
                          "Terrazzo",
                          "Wooden Flooring",
                          "Laminate",
                          "Rugs and Carpet",
                          "Artefacts",
                          "Sculptures",
                          "Decorative Cladding",
                          "Stone Cladding",
                          "Fencing",
                          "Garden and Outdoor Furniture",
                          "Kitchen Appliances",
                          "Luxury Furniture",
                          "Wooden Furniture",
                          "Luxury Lighting",
                          "Mattress",
                          "Office Furniture",
                          "Swimming Pools",
                          "Switches and Sockets",
                          "Wallpaper",
                          "Wooden Doors",
                          "UPVC Doors and Windows",
                          "Aluminum Doors and Windows",
                          "Curtain Wall Systems",
                          "ACP Panels",
                          "Shading and Louvers",
                          "Railing and Balustrade",
                          "False Ceiling",
                          "Modular Kitchen and Wardrobe",
                          "Hardware and Fittings",
                          "Wellness",
                          "Lighting",
                          "Drones",
                          "Pergolas and Gazebos",
                        ].includes(s)
                    ) || ""
                  }
                  onChange={(e) => {
                    const predefined = [
                      "Marble",
                      "Tiles",
                      "Quartz",
                      "Terrazzo",
                      "Wooden Flooring",
                      "Laminate",
                      "Rugs and Carpet",
                      "Artefacts",
                      "Sculptures",
                      "Decorative Cladding",
                      "Stone Cladding",
                      "Fencing",
                      "Garden and Outdoor Furniture",
                      "Kitchen Appliances",
                      "Luxury Furniture",
                      "Wooden Furniture",
                      "Luxury Lighting",
                      "Mattress",
                      "Office Furniture",
                      "Swimming Pools",
                      "Switches and Sockets",
                      "Wallpaper",
                      "Wooden Doors",
                      "UPVC Doors and Windows",
                      "Aluminum Doors and Windows",
                      "Curtain Wall Systems",
                      "ACP Panels",
                      "Shading and Louvers",
                      "Railing and Balustrade",
                      "False Ceiling",
                      "Modular Kitchen and Wardrobe",
                      "Hardware and Fittings",
                      "Wellness",
                      "Lighting",
                      "Drones",
                      "Pergolas and Gazebos",
                    ];
                    const updatedOthers = formData.prestigePanache.filter((s) =>
                      predefined.includes(s)
                    );
                    if (e.target.value) {
                      updatedOthers.push(e.target.value);
                    }
                    setFormData({
                      ...formData,
                      prestigePanache: updatedOthers,
                    });
                  }}
                  placeholder="Specify"
                />
              </div>
            </div>
          </div>

          <div className="col-12 ms-3">
            <label className="form-label fw-bold">Innovation Sphere :</label>
            <div className="row">
              {[
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
              ].map((zone) => (
                <div key={zone} className="col-md-4 col-sm-6 form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={zone}
                    id={`zone-${zone.replace(/\s/g, "-")}`}
                    name="innovationSphere"
                    checked={formData.innovationSphere.includes(zone)}
                    onChange={(e) =>
                      handleCheckboxChange(e, "innovationSphere")
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`zone-${zone.replace(/\s/g, "-")}`}
                  >
                    {zone}
                  </label>
                </div>
              ))}
              <div className="col-md-4 col-sm-6 d-flex align-items-center mb-2">
                <label
                  className="form-check-label fw-bold me-2"
                  htmlFor="zone-other"
                >
                  Other...
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={
                    formData.innovationSphere.find(
                      (s) =>
                        ![
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
                        ].includes(s)
                    ) || ""
                  }
                  onChange={(e) => {
                    const predefined = [
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
                    const updatedOthers = formData.innovationSphere.filter(
                      (s) => predefined.includes(s)
                    );
                    if (e.target.value) {
                      updatedOthers.push(e.target.value);
                    }
                    setFormData({
                      ...formData,
                      innovationSphere: updatedOthers,
                    });
                  }}
                  placeholder="Specify"
                />
              </div>
            </div>
          </div>

          <div className="col-12 ">
            <label className="form-label fw-bold">
              Preferred Suppliers/Brands (if/any) :
            </label>
            <textarea
              className="form-control"
              name="preferredSuppliers"
              value={formData.preferredSuppliers}
              onChange={handleChange}
              placeholder="Preferred Suppliers/Brands"
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-bold">
              Specific Challenges or Needs in Your Projects :
            </label>
            <textarea
              className="form-control"
              name="challenges"
              value={formData.challenges}
              onChange={handleChange}
              placeholder="Specific Challenges or Needs in Your Projects"
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-bold">
              A Vision Towards Industry :
            </label>
            <textarea
              className="form-control"
              name="vision"
              value={formData.vision}
              onChange={handleChange}
              placeholder="A Vision Towards Industry"
            />
          </div>

          <div className="col-12 text-center">
            <button
              type="submit"
              className="btn btn-primary px-4 py-2"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateVisitor;
