import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Phone, Mail } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { SERVICE_CATEGORIES } from "../../data.js";
import { initials } from "../../utils.js";
import { Badge, EmptyState, Modal, PageHeader } from "../../components/ui.jsx";
import NgoMap from "../../components/NgoMap.jsx";

export default function NgoDirectory() {
  const { ngos, plan, setPlan } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [service, setService] = useState("All");
  const [location, setLocation] = useState("All");
  const [sort, setSort] = useState("name");
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null); // { ngo, mode: "details" | "contact" }

  const visible = ngos.filter((n) => n.active); // deactivated NGOs are hidden from NGO users
  const locations = [...new Set(visible.flatMap((n) => n.cities))].sort();
  const list = visible
    .filter((n) => n.name.toLowerCase().includes(q.toLowerCase()))
    .filter((n) => service === "All" || n.focus === service || n.services.includes(service))
    .filter((n) => location === "All" || n.cities.includes(location))
    .sort((a, b) => (sort === "rating" ? (b.rating ?? -1) - (a.rating ?? -1) : a.name.localeCompare(b.name)));

  const requestSupport = (ngo) => {
    setPlan({ ngoId: ngo.id, confirmed: false });
    navigate("/ngo/summary");
  };

  const selected = list.find((n) => n.id === selectedId);

  return (
    <div className="page">
      <PageHeader title="NGO Directory" sub="NGOs working in flood relief and rehabilitation. Ratings and verification shown here are demo values." />
      <div className="filters">
        <input type="search" placeholder="Search by NGO name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search NGOs" />
        <select value={service} onChange={(e) => setService(e.target.value)} aria-label="Filter by service">
          <option value="All">All services</option>{SERVICE_CATEGORIES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Filter by location">
          <option value="All">All locations</option>{locations.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort NGOs">
          <option value="name">Sort: Name</option><option value="rating">Sort: Rating</option>
        </select>
      </div>

      <div className="dir-grid">
        <div className="dir-list">
          {list.length === 0 && <EmptyState title="No NGOs found" text="Try clearing the search or filters." />}
          {list.map((n) => (
            <article key={n.id} className={n.id === selectedId ? "card ngo-card selected" : "card ngo-card"}>
              <div className="avatar-lg">{initials(n.name)}</div>
              <div className="grow">
                <div className="row-between">
                  <h3>{n.name}</h3>
                  <Badge kind={n.verification.startsWith("Verified") ? "verified" : "unverified"}>{n.verification}</Badge>
                </div>
                <div className="chips-row">{n.services.map((s) => <span className="chip-soft" key={s}>{s}</span>)}</div>
                <p className="meta"><MapPin size={14} /> {n.cities.join(", ") || "Cities not listed"}</p>
                <p className="meta"><Star size={14} /> {n.rating != null ? `${n.rating} (demo rating)` : "Not rated yet"}</p>
                <div className="card-actions">
                  <button className="btn ghost small" onClick={() => { setSelectedId(n.id); setModal({ ngo: n, mode: "details" }); }}>Details</button>
                  <button className="btn ghost small" onClick={() => setModal({ ngo: n, mode: "contact" })}>Contact NGO</button>
                  <button className="btn small" onClick={() => requestSupport(n)}>Request support</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="card map-card">
          <h3>Where our NGOs work</h3>
          <NgoMap ngos={list} selectedId={selectedId} onSelect={setSelectedId} />
          <p className="muted small-text">Positions are approximate city locations (demo). Use the + and − buttons to zoom and drag to move.</p>
          {selected && <p className="map-selected"><b>{selected.name}</b><br />{selected.cities.join(", ")}</p>}
        </aside>
      </div>

      {modal && (
        <Modal
          title={modal.mode === "contact" ? `Contact ${modal.ngo.name}` : modal.ngo.name}
          onClose={() => setModal(null)}
          footer={modal.mode === "details" && <button className="btn small" onClick={() => requestSupport(modal.ngo)}>Request support</button>}
        >
          {modal.mode === "details" && (
            <dl className="details">
              <dt>Focus area</dt><dd>{modal.ngo.focus}</dd>
              <dt>Services</dt><dd>{modal.ngo.services.join(", ") || "Not listed"}</dd>
              <dt>Cities served</dt><dd>{modal.ngo.cities.join(", ") || "Not listed"}</dd>
              <dt>Verification</dt><dd>{modal.ngo.verification}</dd>
              <dt>Rating</dt><dd>{modal.ngo.rating != null ? `${modal.ngo.rating} (demo value)` : "Not rated yet"}</dd>
            </dl>
          )}
          <dl className="details">
            <dt><Phone size={14} /> Phone</dt><dd>{modal.ngo.phone ? <a href={`tel:${modal.ngo.phone.replace(/\s/g, "")}`}>{modal.ngo.phone}</a> : "Not provided"}</dd>
            <dt><Mail size={14} /> Email</dt><dd>{modal.ngo.email ? <a href={`mailto:${modal.ngo.email}`}>{modal.ngo.email}</a> : "Not provided"}</dd>
          </dl>
          {modal.ngo.demo && <p className="muted">Demo record. The contact details are placeholders.</p>}
        </Modal>
      )}
    </div>
  );
}
