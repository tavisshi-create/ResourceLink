import { useState, useEffect } from "react";
import { fetchJson } from "../lib/api";
import "./Main.css";

const cards = [
  {
    id: "ndzz6l",
    name: "3T MRI Scanner",
    institute: "ABC Medical Research Institute",
    location: "Chennai",
    image:
      "https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=900&q=80",
    category: "Imaging",
    details: "3T MRI scanner",
    use: "Research / Clinical",
    operator: "Operator Available",
    availability: "Mon - Fri",
    time: "9:00 AM - 10:00 AM",
    minimum: "1 hour",
    maximum: "6 hours",
    price: "₹5,000 / hour",
  },
  {
    id: "pet204",
    name: "PET CT Scanner",
    institute: "Chennai Biomedical Centre",
    location: "Chennai",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80",
    category: "Diagnostics",
    details: "PET CT imaging system",
    use: "Clinical Research",
    operator: "Operator Available",
    availability: "Mon - Sat",
    time: "10:00 AM - 2:00 PM",
    minimum: "2 hours",
    maximum: "5 hours",
    price: "₹7,000 / hour",
  },
  {
    id: "mic381",
    name: "Research Microscope",
    institute: "SRM Research Laboratory",
    location: "Kattankulathur",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
    category: "Microscopy",
    details: "High-resolution microscope",
    use: "Biology Research",
    operator: "Operator Not Available",
    availability: "Mon - Fri",
    time: "9:00 AM - 5:00 PM",
    minimum: "1 hour",
    maximum: "8 hours",
    price: "₹1,500 / hour",
  },
  {
    id: "cnf492",
    name: "Confocal Microscope",
    institute: "Advanced Life Sciences Lab",
    location: "Bangalore",
    image:
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=900&q=80",
    category: "Microscopy",
    details: "Confocal imaging system",
    use: "Cell Research",
    operator: "Operator Available",
    availability: "Tue - Sat",
    time: "10:00 AM - 4:00 PM",
    minimum: "2 hours",
    maximum: "6 hours",
    price: "₹3,000 / hour",
  },
  {
    id: "sem517",
    name: "Scanning Electron Microscope",
    institute: "National Materials Lab",
    location: "Chennai",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80",
    category: "Materials",
    details: "High-magnification SEM",
    use: "Materials Research",
    operator: "Operator Available",
    availability: "Mon - Fri",
    time: "11:00 AM - 3:00 PM",
    minimum: "2 hours",
    maximum: "6 hours",
    price: "₹4,500 / hour",
  },
  {
    id: "pcr628",
    name: "Real-Time PCR System",
    institute: "Molecular Biology Centre",
    location: "Coimbatore",
    image:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=80",
    category: "Molecular",
    details: "96-well real-time PCR",
    use: "Molecular Research",
    operator: "Operator Available",
    availability: "Mon - Fri",
    time: "9:30 AM - 4:30 PM",
    minimum: "1 hour",
    maximum: "5 hours",
    price: "₹2,000 / hour",
  },
];

// Shape returned by GET /api/ResourceAllocations (camelCase, per
// ASP.NET Core's default System.Text.Json naming policy).
type ResourceAllocationDto = {
  id: string;
  name: string;
  institution?: string;
  location?: string;
  images?: string[];
  category: string;
  notes?: string;
  specs?: Record<string, string>;
  operatorRequired?: boolean;
  ratePerHour: number;
};

function Main() {
  const [items, setItems] = useState(cards);

  useEffect(() => {
    fetchJson<ResourceAllocationDto[]>('/ResourceAllocations').then((data) => {
      if (data && data.length > 0) {
        const mapped = data.map((d) => ({
          id: d.id,
          name: d.name,
          institute: d.institution || "Unknown Institute",
          location: d.location || "Unknown",
          image: d.images?.[0] || cards[0].image,
          category: d.category,
          details: d.notes || d.name,
          use: d.specs?.Use || "General",
          operator: d.operatorRequired ? "Operator Available" : "No Operator",
          availability: "Mon - Fri",
          time: "9:00 AM - 5:00 PM",
          minimum: "1 hour",
          maximum: "8 hours",
          price: `₹${d.ratePerHour} / hour`,
        }));
        setItems(mapped);
      }
    });
  }, []);

  return (
    <main className="main-page">
      <div className="page-shell">

        <nav className="breadcrumb">
          <span>Home</span>
          <span>/</span>
          <span>Resources</span>
          <span>/</span>
          <strong>Medical Equipment</strong>
        </nav>

        <header className="page-header">
          <div>
            <p className="eyebrow">RESOURCE LINK</p>

            <h1>Available Equipment</h1>

            <p className="subtitle">
              Find and book research equipment from nearby institutions.
            </p>
          </div>

          <div className="result-count">
            06 resources available
          </div>
        </header>

        <div className="toolbar">
          <div className="search-box">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search equipment..."
            />
          </div>

          <button className="filter-button">
            Filter
          </button>
        </div>

        <section className="card-grid">
          {items.map((card) => (
            <article className="card" key={card.id}>

              <div className="card-content">

                <div className="equipment-image">
                  <img
                    src={card.image}
                    alt={card.name}
                  />

                  <span className="image-category">
                    {card.category}
                  </span>

                  <span className="availability-badge">
                    AVAILABLE
                  </span>
                </div>

                <div className="title-row">

                  <div>
                    <h2 className="heading">
                      {card.name}
                    </h2>

                    <p className="resource-id">
                      ID: {card.id}
                    </p>
                  </div>

                  <button className="more-button">
                    ⋯
                  </button>

                </div>

                <div className="institution">

                  <div>
                    <strong>{card.institute}</strong>

                    <span>
                      ◉ {card.location}
                    </span>
                  </div>

                </div>

                <div className="data-crumbs">

                  <span>{card.category}</span>

                  <span>{card.use}</span>

                  <span
                    className={
                      card.operator === "Operator Available"
                        ? "operator available"
                        : "operator"
                    }
                  >
                    {card.operator}
                  </span>

                </div>

                <div className="equipment-details">

                  <p className="section-label">
                    Equipment Details
                  </p>

                  <p>
                    {card.details}
                  </p>

                </div>

                <div className="info-grid">

                  <div className="info-box">
                    <span>Availability</span>

                    <strong>
                      {card.availability}
                    </strong>

                    <small>
                      {card.time}
                    </small>
                  </div>

                  <div className="info-box">
                    <span>Rental Duration</span>

                    <strong>
                      {card.minimum} - {card.maximum}
                    </strong>

                    <small>
                      Flexible booking
                    </small>
                  </div>

                </div>

                <footer className="card-footer">

                  <div className="price-section">

                    <span>Rental Price</span>

                    <strong>
                      {card.price}
                    </strong>

                  </div>

                  <button className="book-button">
                    View & Book
                    <span>↗</span>
                  </button>

                </footer>

              </div>
            </article>
          ))}
        </section>

      </div>
    </main>
  );
}

export default Main;