import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import { isOpen } from "../../utils.js";
import { Badge, EmptyState, Modal, StatCard } from "../../components/ui.jsx";
import { IncidentCard, IncidentDetails } from "../../components/incident.jsx";

export default function NgoDashboard() {
  const { session, incidents, ngos, setPlan, plan } = useApp();
  const navigate = useNavigate();
  const [viewing, setViewing] = useState(null);

  // IMPORTANT: only Ongoing and Running incidents appear here. Resolved ones are left out.
  const active = incidents.filter(isOpen).sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
  const ongoingCount = incidents.filter((i) => i.status === "Ongoing").length;
  const cityCount = new Set(active.map((i) => i.city)).size;
  const working = ngos.filter((n) => n.active);

  const offerSupport = (incident) => {
    setPlan({ incidentId: incident.id, ngoId: session.ngoId ?? plan.ngoId, support: [], confirmed: false });
    navigate("/ngo/summary");
  };

  return (
    <div className="page">
      <div className="banner">
        <h1>Welcome, {(session.name || "friend").split(" ")[0]}</h1>
        <p>{session.orgName ? `${session.orgName} · ` : ""}Here are the flood incidents that need relief support. Incident data is sample data for testing.</p>
      </div>

      <div className="stats">
        <StatCard label="Active incidents" value={active.length} hint="Ongoing + Running" />
        <StatCard label="Ongoing incidents" value={ongoingCount} hint="Status: Ongoing" />
        <StatCard label="Affected cities" value={cityCount} hint="With active incidents" />
        <StatCard label="NGOs working on relief" value={working.length} hint="Active NGOs (demo)" />
      </div>

      <section>
        <div className="row-between"><h2>Active Incidents</h2><Link className="link" to="/ngo/incidents">View all</Link></div>
        {active.length === 0 ? (
          <EmptyState title="No active incidents" text="There are no Ongoing or Running incidents right now.">
            <Link className="btn small" to="/ngo/directory">Browse NGOs</Link>
          </EmptyState>
        ) : (
          <div className="grid-cards">
            {active.slice(0, 6).map((i) => <IncidentCard key={i.id} incident={i} onView={setViewing} onSupport={offerSupport} />)}
          </div>
        )}
      </section>

      <section>
        <div className="row-between"><h2>NGOs working on flood relief</h2><Link className="link" to="/ngo/directory">Open directory</Link></div>
        {working.length === 0 ? (
          <EmptyState title="No active NGOs" text="No NGO records are active at the moment." />
        ) : (
          <div className="card list">
            {working.slice(0, 5).map((n) => (
              <div className="list-row" key={n.id}>
                <div className="grow"><b>{n.name}</b><small className="muted">{n.focus} · {n.cities.join(", ") || "Cities not listed"}</small></div>
                <Badge kind={n.verification.startsWith("Verified") ? "verified" : "unverified"}>{n.verification}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      {viewing && (
        <Modal title={viewing.title} onClose={() => setViewing(null)}
          footer={<button className="btn small" onClick={() => { offerSupport(viewing); }}>Offer support</button>}>
          <IncidentDetails incident={viewing} />
        </Modal>
      )}
    </div>
  );
}
