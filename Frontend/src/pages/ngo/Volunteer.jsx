import { useState } from "react";
import { MapPin, Clock, Users } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { fmtDate } from "../../utils.js";
import { Badge, EmptyState, Field, Modal, Notice, PageHeader } from "../../components/ui.jsx";

export default function Volunteer() {
  const { opportunities, ngos, session, myApplications, applyToOpportunity, withdrawApplication } = useApp();
  const [applying, setApplying] = useState(null);
  const [name, setName] = useState(session.name || "");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const appFor = (oppId) => myApplications.find((a) => a.oppId === oppId);
  const ngoName = (id) => ngos.find((n) => n.id === id)?.name || "NGO";

  const open = (opp) => {
    setApplying(opp);
    setNote("");
    setError("");
  };

  const submit = (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Enter your name.");
    applyToOpportunity(applying.id, name.trim(), note.trim());
    setNotice(`Application submitted for "${applying.title}". Status: Submitted (demo). No NGO has been notified in this demo.`);
    setApplying(null);
  };

  return (
    <div className="page">
      <PageHeader title="Volunteer" sub="Find volunteer opportunities offered by NGOs. We only ask for your name and an optional note." />
      <Notice>{notice}</Notice>

      <div className="grid-cards">
        {opportunities.length === 0 && <EmptyState title="No opportunities yet" text="Volunteer opportunities will appear here." />}
        {opportunities.map((o) => {
          const app = appFor(o.id);
          return (
            <article className="card" key={o.id}>
              <div className="row-between"><h3>{o.title}</h3><Badge kind="sample">Sample</Badge></div>
              <p className="muted">{ngoName(o.ngoId)}</p>
              <p className="meta"><MapPin size={14} /> {o.city}</p>
              <p className="meta"><Clock size={14} /> {o.schedule}</p>
              <p className="meta"><Users size={14} /> {o.needed ? `${o.needed} volunteers needed` : "Number not specified"}</p>
              <p><b>Support type:</b> {o.support}</p>
              <div className="chips-row">{o.skills.map((s) => <span className="chip-soft" key={s}>{s}</span>)}</div>
              <div className="card-actions">
                {app ? (
                  <>
                    <Badge kind="verified">Status: {app.status}</Badge>
                    <button className="btn ghost small" onClick={() => withdrawApplication(o.id)}>Withdraw</button>
                  </>
                ) : (
                  <button className="btn small" onClick={() => open(o)}>Apply / Join</button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <section>
        <h2>My applications</h2>
        {myApplications.length === 0 ? (
          <EmptyState title="No applications yet" text="Apply to an opportunity above and it will show up here." />
        ) : (
          <div className="card list">
            {myApplications.map((a) => {
              const opp = opportunities.find((o) => o.id === a.oppId);
              return (
                <div className="list-row" key={a.id}>
                  <div className="grow"><b>{opp ? opp.title : "Opportunity removed"}</b><small className="muted">Applied {fmtDate(a.date)}</small></div>
                  <Badge kind="verified">{a.status}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {applying && (
        <Modal title={`Apply: ${applying.title}`} onClose={() => setApplying(null)}>
          <form className="form" onSubmit={submit} noValidate>
            <Field label="Your name" error={error}><input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Note for the NGO (optional)"><textarea rows="3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Skills or availability" /></Field>
            <button className="btn" type="submit">Submit application</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
