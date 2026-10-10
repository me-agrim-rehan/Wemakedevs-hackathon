import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import { RELIEF_NEEDS, SEVERITIES } from "../../data.js";
import { countBy, isOpen } from "../../utils.js";
import { EmptyState, PageHeader, StatCard } from "../../components/ui.jsx";

function Bars({ rows, max }) {
  return (
    <div className="bars">
      {rows.map(([label, value]) => (
        <div className="bar-row" key={label}>
          <span>{label}</span>
          <div className="bar"><div style={{ width: `${max ? (value / max) * 100 : 0}%` }} /></div>
          <b>{value}</b>
        </div>
      ))}
    </div>
  );
}

export default function AdminSummary() {
  const { incidents, ngos, applications, plan } = useApp();
  const open = incidents.filter(isOpen);
  const resolved = incidents.filter((i) => i.status === "Resolved");
  const byCity = Object.entries(countBy(incidents, (i) => i.city)).sort((a, b) => b[1] - a[1]);
  const bySeverity = SEVERITIES.map((s) => [s, incidents.filter((i) => i.severity === s).length]);
  const needs = RELIEF_NEEDS.map((n) => [n, open.filter((i) => i.needs.includes(n)).length]);
  const active = ngos.filter((n) => n.active);
  const verified = ngos.filter((n) => n.verification.startsWith("Verified"));

  if (incidents.length === 0 && ngos.length === 0) {
    return (
      <div className="page">
        <PageHeader title="Reports / Summary" />
        <EmptyState title="Nothing to report yet" text="Add incidents and NGOs to see summaries.">
          <Link className="btn small" to="/admin/add-incident">Add incident</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="Reports / Summary" sub="Management overview based on the data saved in this browser." />
      <div className="stats five">
        <StatCard label="Total incidents" value={incidents.length} />
        <StatCard label="Ongoing / Running" value={open.length} />
        <StatCard label="Resolved" value={resolved.length} />
        <StatCard label="Registered NGOs" value={ngos.length} hint={`${active.length} active`} />
        <StatCard label="Verified NGOs (demo)" value={verified.length} />
      </div>

      <div className="two-col">
        <section className="card">
          <h3>Ongoing vs resolved</h3>
          <Bars rows={[["Ongoing / Running", open.length], ["Resolved", resolved.length]]} max={Math.max(incidents.length, 1)} />
        </section>
        <section className="card">
          <h3>Incidents by severity</h3>
          <Bars rows={bySeverity} max={Math.max(incidents.length, 1)} />
        </section>
        <section className="card">
          <h3>Incidents by city</h3>
          {byCity.length === 0 ? <p className="muted">No incidents yet.</p> : <Bars rows={byCity} max={byCity[0][1]} />}
        </section>
        <section className="card">
          <h3>Relief needed (open incidents)</h3>
          <Bars rows={needs} max={Math.max(...needs.map((n) => n[1]), 1)} />
        </section>
      </div>

      <section className="card">
        <h3>Activity in this demo</h3>
        <dl className="details">
          <dt>Volunteer applications</dt><dd>{applications.length}</dd>
          <dt>NGO support plan</dt><dd>{plan.confirmed ? "1 plan confirmed (demo)" : "No plan confirmed"}</dd>
        </dl>
      </section>
    </div>
  );
}
