import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import { RELIEF_NEEDS } from "../../data.js";
import { fmtDate, isOpen } from "../../utils.js";
import { Badge, EmptyState, Field, Notice, PageHeader } from "../../components/ui.jsx";

export default function NgoSummary() {
  const { incidents, ngos, plan, setPlan, clearPlan, myApplications, opportunities } = useApp();
  const navigate = useNavigate();

  const incident = incidents.find((i) => i.id === plan.incidentId);
  const ngo = ngos.find((n) => n.id === plan.ngoId);
  const incidentOptions = incidents.filter((i) => isOpen(i) || i.id === plan.incidentId);
  const ngoOptions = ngos.filter((n) => n.active || n.id === plan.ngoId);
  const nothingChosen = !incident && !ngo;
  const ready = Boolean(incident && ngo && plan.support.length > 0);

  const toggleSupport = (s) =>
    setPlan({ support: plan.support.includes(s) ? plan.support.filter((x) => x !== s) : [...plan.support, s], confirmed: false });

  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/ngo"));

  return (
    <div className="page">
      <PageHeader title="Your Plan Summary" sub="Choose an incident, an NGO and the kind of support. Then review and confirm your plan." />

      <div className="summary-grid">
        <section className="card">
          <h3>Build your plan</h3>
          <div className="form">
            <Field label="Incident">
              <select value={plan.incidentId ?? ""} onChange={(e) => setPlan({ incidentId: e.target.value ? Number(e.target.value) : null, confirmed: false })}>
                <option value="">Choose an incident</option>
                {incidentOptions.map((i) => <option key={i.id} value={i.id}>{i.title} ({i.city})</option>)}
              </select>
            </Field>
            <Field label="NGO">
              <select value={plan.ngoId ?? ""} onChange={(e) => setPlan({ ngoId: e.target.value ? Number(e.target.value) : null, confirmed: false })}>
                <option value="">Choose an NGO</option>
                {ngoOptions.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </Field>
            <fieldset className="field">
              <legend>Type of assistance</legend>
              <div className="checks">
                {RELIEF_NEEDS.map((s) => (
                  <label key={s} className={plan.support.includes(s) ? "check on" : "check"}>
                    <input type="checkbox" checked={plan.support.includes(s)} onChange={() => toggleSupport(s)} /> {s}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Note (optional)">
              <textarea rows="3" value={plan.note} onChange={(e) => setPlan({ note: e.target.value, confirmed: false })} placeholder="Describe the support you can provide" />
            </Field>
          </div>
        </section>

        <section className="card">
          <h3>Final summary</h3>
          {nothingChosen ? (
            <EmptyState title="Nothing selected yet" text="Pick an incident and an NGO on the left, or browse them first.">
              <Link className="btn small" to="/ngo/incidents">Browse incidents</Link>
              <Link className="btn ghost small" to="/ngo/directory">Browse NGOs</Link>
            </EmptyState>
          ) : (
            <dl className="details">
              <dt>Incident</dt>
              <dd>{incident ? <>{incident.title} <Badge kind={incident.status}>{incident.status}</Badge></> : <span className="muted">Not chosen</span>}</dd>
              <dt>Location</dt><dd>{incident ? incident.city : <span className="muted">-</span>}</dd>
              <dt>Priority</dt><dd>{incident ? <Badge kind={incident.severity}>{incident.severity}</Badge> : <span className="muted">-</span>}</dd>
              <dt>Reported</dt><dd>{incident ? fmtDate(incident.reportedAt) : <span className="muted">-</span>}</dd>
              <dt>Relief needed</dt><dd>{incident ? (incident.needs.join(", ") || "None listed") : <span className="muted">-</span>}</dd>
              <dt>NGO</dt><dd>{ngo ? ngo.name : <span className="muted">Not chosen</span>}</dd>
              <dt>Proposed support</dt><dd>{plan.support.length ? plan.support.join(", ") : <span className="muted">None selected</span>}</dd>
              <dt>Volunteers</dt>
              <dd>
                {myApplications.length === 0
                  ? "No volunteer applications from you yet."
                  : myApplications.map((a) => opportunities.find((o) => o.id === a.oppId)?.title || "Removed opportunity").join(", ")}
              </dd>
              {plan.note && (<><dt>Note</dt><dd>{plan.note}</dd></>)}
            </dl>
          )}

          {!nothingChosen && !ready && !plan.confirmed && (
            <p className="muted">To confirm, choose an incident, an NGO and at least one type of assistance.</p>
          )}

          {plan.confirmed && (
            <Notice>
              Plan confirmed (demo). This only records your selected plan in this browser. No donation, booking or relief operation has taken place.
            </Notice>
          )}

          <div className="card-actions">
            <button className="btn ghost small" onClick={goBack}>Back</button>
            {plan.confirmed ? (
              <>
                <button className="btn ghost small" onClick={() => setPlan({ confirmed: false })}>Edit plan</button>
                <button className="btn ghost small" onClick={clearPlan}>Clear plan</button>
              </>
            ) : (
              <button className="btn small" disabled={!ready} onClick={() => setPlan({ confirmed: true })}>Confirm plan</button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
