import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import { fmtDate, isOpen } from "../../utils.js";
import { Badge, PageHeader, StatCard, EmptyState } from "../../components/ui.jsx";

export default function AdminDashboard() {
  const { incidents, ngos, session } = useApp();
  const open = incidents.filter(isOpen);
  const resolved = incidents.filter((i) => i.status === "Resolved");
  const affectedCities = new Set(open.map((i) => i.city)).size;
  const recent = [...incidents].sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt)).slice(0, 5);

  return (
    <div className="page">
      <PageHeader
        title={`Welcome, ${(session.name || "admin").split(" ")[0]}`}
        sub="Overview of incidents and NGOs. Entries marked Sample are demo data."
        action={<Link className="btn small" to="/admin/add-incident">Add incident</Link>}
      />
      <div className="stats five">
        <StatCard label="Total incidents" value={incidents.length} />
        <StatCard label="Ongoing / Running" value={open.length} />
        <StatCard label="Resolved" value={resolved.length} />
        <StatCard label="Affected cities" value={affectedCities} hint="With open incidents" />
        <StatCard label="Registered NGOs" value={ngos.length} hint={`${ngos.filter((n) => n.active).length} active`} />
      </div>

      <section>
        <div className="row-between"><h2>Recent incidents</h2><Link className="link" to="/admin/incidents">Manage all</Link></div>
        {recent.length === 0 ? (
          <EmptyState title="No incidents yet" text="Add the first incident to get started.">
            <Link className="btn small" to="/admin/add-incident">Add incident</Link>
          </EmptyState>
        ) : (
          <div className="card table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Title</th><th>City</th><th>Severity</th><th>Reported</th><th>Status</th></tr></thead>
              <tbody>
                {recent.map((i) => (
                  <tr key={i.id}>
                    <td>#{i.id}</td><td>{i.title}</td><td>{i.city}</td>
                    <td><Badge kind={i.severity}>{i.severity}</Badge></td>
                    <td>{fmtDate(i.reportedAt)}</td>
                    <td><Badge kind={i.status}>{i.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
