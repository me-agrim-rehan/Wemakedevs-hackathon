import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Eye, CheckCircle2 } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { STATUSES } from "../../data.js";
import { fmtDate } from "../../utils.js";
import { Badge, ConfirmModal, EmptyState, Modal, Notice, PageHeader } from "../../components/ui.jsx";
import { IncidentDetails } from "../../components/incident.jsx";

export default function ManageIncidents() {
  const { incidents, updateIncident, deleteIncident } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState("");

  const list = incidents
    .filter((i) => status === "All" || i.status === status)
    .filter((i) => `${i.title} ${i.city}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.id - b.id);

  return (
    <div className="page">
      <PageHeader title="Manage Incidents" sub="View, edit, update status, resolve or delete incidents."
        action={<Link className="btn small" to="/admin/add-incident">Add incident</Link>} />
      <Notice>{notice}</Notice>
      <div className="filters">
        <input type="search" placeholder="Search title or city" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search incidents" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option>All</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No incidents found" text="Change the filters or add a new incident.">
          <Link className="btn small" to="/admin/add-incident">Add incident</Link>
        </EmptyState>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Title</th><th>City</th><th>Severity</th><th>Reported</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map((i) => (
                <tr key={i.id}>
                  <td>#{i.id}</td>
                  <td>{i.title} {i.demo && <Badge kind="sample">Sample</Badge>}</td>
                  <td>{i.city}</td>
                  <td><Badge kind={i.severity}>{i.severity}</Badge></td>
                  <td>{fmtDate(i.reportedAt)}</td>
                  <td>
                    <select className="inline-select" value={i.status} aria-label={`Status of incident ${i.id}`}
                      onChange={(e) => { updateIncident(i.id, { status: e.target.value }); setNotice(`Incident #${i.id} is now ${e.target.value}.`); }}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" title="View details" aria-label="View details" onClick={() => setViewing(i)}><Eye size={17} /></button>
                      <Link className="icon-btn" title="Edit" aria-label="Edit incident" to={`/admin/incidents/${i.id}/edit`}><Pencil size={17} /></Link>
                      <button className="icon-btn" title="Mark resolved" aria-label="Mark resolved" disabled={i.status === "Resolved"}
                        onClick={() => { updateIncident(i.id, { status: "Resolved" }); setNotice(`Incident #${i.id} marked resolved.`); }}><CheckCircle2 size={17} /></button>
                      <button className="icon-btn danger-text" title="Delete" aria-label="Delete incident" onClick={() => setDeleting(i)}><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && <Modal title={`#${viewing.id} ${viewing.title}`} onClose={() => setViewing(null)}><IncidentDetails incident={viewing} /></Modal>}
      {deleting && (
        <ConfirmModal
          title="Delete incident?"
          text={`"${deleting.title}" (#${deleting.id}) will be removed. This cannot be undone.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => { deleteIncident(deleting.id); setNotice(`Incident #${deleting.id} deleted.`); setDeleting(null); }}
        />
      )}
    </div>
  );
}
