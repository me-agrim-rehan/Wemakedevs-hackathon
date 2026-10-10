import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import { isOpen } from "../../utils.js";
import { Badge, EmptyState, Notice, PageHeader } from "../../components/ui.jsx";
import { IncidentForm } from "../../components/incident.jsx";

// One page for both "Add Incident" (/admin/add-incident) and "Edit" (/admin/incidents/:id/edit)
export default function IncidentEditor() {
  const { id } = useParams();
  const editing = id !== undefined;
  const { incidents, addIncident, updateIncident } = useApp();
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(0);
  const [success, setSuccess] = useState("");

  const existing = editing ? incidents.find((i) => i.id === Number(id)) : null;
  const openIncidents = incidents.filter(isOpen).sort((a, b) => a.id - b.id);

  if (editing && !existing) {
    return (
      <div className="page">
        <PageHeader title="Edit incident" />
        <EmptyState title="Incident not found" text="It may have been deleted.">
          <Link className="btn small" to="/admin/incidents">Back to Manage Incidents</Link>
        </EmptyState>
      </div>
    );
  }

  const handleSubmit = (values) => {
    if (editing) {
      updateIncident(existing.id, values);
      navigate("/admin/incidents");
    } else {
      const created = addIncident(values);
      setSuccess(`Incident #${created.id} "${created.title}" was added.`);
      setFormKey((k) => k + 1); // clears the form
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title={editing ? `Edit incident #${existing.id}` : "Add Incident"}
        sub={editing ? "Change the details and save." : "Report a flood incident. Ongoing and Running incidents appear on the NGO dashboard."}
      />
      <Notice>{success}</Notice>
      {success && <p><Link className="link" to="/admin/incidents">View in Manage Incidents</Link></p>}

      <div className="two-col">
        <section className="card">
          <h3>Incident details</h3>
          <IncidentForm key={`${id ?? "new"}-${formKey}`} initial={existing} onSubmit={handleSubmit} submitLabel={editing ? "Save changes" : "Submit Incident"} />
        </section>
        <section className="card">
          <h3>Ongoing incidents</h3>
          {openIncidents.length === 0 && <p className="muted">No ongoing incidents.</p>}
          {openIncidents.map((i) => (
            <div className="list-row" key={i.id}>
              <span className="num">{i.id}</span>
              <div className="grow"><b>{i.title}</b><small className="muted">{i.city}</small></div>
              <Badge kind={i.status}>{i.status}</Badge>
            </div>
          ))}
          <p className="note">Incidents are saved in this browser only (demo storage).</p>
        </section>
      </div>
    </div>
  );
}
