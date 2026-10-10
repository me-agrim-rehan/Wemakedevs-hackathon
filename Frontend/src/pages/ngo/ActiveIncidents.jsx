import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import { SEVERITIES } from "../../data.js";
import { isOpen } from "../../utils.js";
import { EmptyState, Modal, PageHeader } from "../../components/ui.jsx";
import { IncidentCard, IncidentDetails } from "../../components/incident.jsx";

export default function ActiveIncidents() {
  const { incidents, session, plan, setPlan } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("All");
  const [severity, setSeverity] = useState("All");
  const [viewing, setViewing] = useState(null);

  const active = incidents.filter(isOpen); // Ongoing + Running only
  const cityOptions = [...new Set(active.map((i) => i.city))].sort();
  const list = active
    .filter((i) => (city === "All" || i.city === city) && (severity === "All" || i.severity === severity))
    .filter((i) => `${i.title} ${i.description} ${i.city}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));

  const offerSupport = (incident) => {
    setPlan({ incidentId: incident.id, ngoId: session.ngoId ?? plan.ngoId, support: [], confirmed: false });
    navigate("/ngo/summary");
  };

  return (
    <div className="page">
      <PageHeader title="Active Incidents" sub="Incidents that are Ongoing or Running. Resolved incidents are not listed." />
      <div className="filters">
        <input type="search" placeholder="Search incidents or cities" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search incidents" />
        <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="Filter by city">
          <option>All</option>{cityOptions.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} aria-label="Filter by severity">
          <option>All</option>{SEVERITIES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No incidents match" text="Try a different search or filter." />
      ) : (
        <div className="grid-cards">
          {list.map((i) => <IncidentCard key={i.id} incident={i} onView={setViewing} onSupport={offerSupport} />)}
        </div>
      )}

      {viewing && (
        <Modal title={viewing.title} onClose={() => setViewing(null)}
          footer={<button className="btn small" onClick={() => offerSupport(viewing)}>Offer support</button>}>
          <IncidentDetails incident={viewing} />
        </Modal>
      )}
    </div>
  );
}
