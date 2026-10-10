import { useState } from "react";
import { MapPin, Clock, Users } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { RELIEF_NEEDS, SEVERITIES, STATUSES } from "../data.js";
import { fmtDate, toLocalInput } from "../utils.js";
import { Badge, Field } from "./ui.jsx";

function IncidentImage({ src }) {
  if (!src) return null;
  return <img className="incident-img" src={src} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />;
}

export function IncidentCard({ incident, onView, onSupport }) {
  return (
    <article className="card incident-card">
      <IncidentImage src={incident.image} />
      <div className="row-between">
        <h3>{incident.title}</h3>
        {incident.demo && <Badge kind="sample">Sample</Badge>}
      </div>
      <p className="meta"><MapPin size={14} /> {incident.city} <span className="dot" /> <Clock size={14} /> {fmtDate(incident.reportedAt)}</p>
      <p className="clamp">{incident.description || "No description provided."}</p>
      <div className="chips-row">
        <Badge kind={incident.severity}>{incident.severity}</Badge>
        <Badge kind={incident.status}>{incident.status}</Badge>
      </div>
      <div className="chips-row">
        {incident.needs.length === 0 && <small className="muted">No relief needs listed</small>}
        {incident.needs.map((n) => <span className="chip-soft" key={n}>{n}</span>)}
      </div>
      <div className="card-actions">
        <button className="btn ghost small" onClick={() => onView(incident)}>View details</button>
        {onSupport && <button className="btn small" onClick={() => onSupport(incident)}>Offer support</button>}
      </div>
    </article>
  );
}

export function IncidentDetails({ incident }) {
  return (
    <div className="details">
      <IncidentImage src={incident.image} />
      <p>{incident.description || "No description provided."}</p>
      <dl>
        <dt>Incident ID</dt><dd>#{incident.id}</dd>
        <dt>City</dt><dd>{incident.city}</dd>
        <dt>Severity</dt><dd><Badge kind={incident.severity}>{incident.severity}</Badge></dd>
        <dt>Status</dt><dd><Badge kind={incident.status}>{incident.status}</Badge></dd>
        <dt>Reported</dt><dd>{fmtDate(incident.reportedAt)}</dd>
        <dt>People affected</dt><dd>{incident.peopleAffected === "" || incident.peopleAffected == null ? "Not known" : <><Users size={14} /> {incident.peopleAffected}</>}</dd>
        <dt>Relief needs</dt><dd>{incident.needs.length ? incident.needs.join(", ") : "None listed"}</dd>
      </dl>
      {incident.demo && <p className="muted">This is a sample incident for testing, not a verified report.</p>}
    </div>
  );
}

const MAX_IMAGE_BYTES = 250 * 1024; // keeps localStorage small

export function IncidentForm({ initial, onSubmit, submitLabel = "Submit Incident" }) {
  const { cities } = useApp();
  const [f, setF] = useState(() => ({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    city: initial?.city ?? "",
    severity: initial?.severity ?? "Medium",
    status: initial?.status ?? "Ongoing",
    reportedAt: toLocalInput(initial?.reportedAt ?? new Date().toISOString()),
    peopleAffected: initial?.peopleAffected ?? "",
    needs: initial?.needs ?? [],
    image: initial?.image ?? "",
  }));
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggleNeed = (n) => setF({ ...f, needs: f.needs.includes(n) ? f.needs.filter((x) => x !== n) : [...f.needs, n] });

  const cityNames = cities.map((c) => c.name);
  if (f.city && !cityNames.includes(f.city)) cityNames.push(f.city);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErrors({ ...errors, image: "Please choose an image file." });
    if (file.size > MAX_IMAGE_BYTES) return setErrors({ ...errors, image: "Image is larger than 250 KB. Use a smaller image or paste an image link." });
    const reader = new FileReader();
    reader.onload = () => {
      setF((prev) => ({ ...prev, image: String(reader.result) }));
      setErrors((prev) => ({ ...prev, image: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.title.trim()) errs.title = "Enter an incident title.";
    if (!f.description.trim()) errs.description = "Describe the situation.";
    if (!f.city) errs.city = "Choose the affected city.";
    if (!f.reportedAt || isNaN(new Date(f.reportedAt))) errs.reportedAt = "Enter a valid date and time.";
    if (f.peopleAffected !== "" && !/^\d+$/.test(String(f.peopleAffected))) errs.peopleAffected = "Use whole numbers only.";
    if (f.needs.length === 0) errs.needs = "Select at least one relief requirement.";
    if (f.image && !/^(https?:\/\/|data:image\/)/i.test(f.image)) errs.image = "Use a link starting with http:// or https://, or upload an image.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({
      ...f,
      title: f.title.trim(),
      description: f.description.trim(),
      reportedAt: new Date(f.reportedAt).toISOString(),
      peopleAffected: f.peopleAffected === "" ? "" : Number(f.peopleAffected),
    });
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field label="Incident title" error={errors.title}>
        <input value={f.title} onChange={set("title")} placeholder="e.g. Flooding in Sonipat" />
      </Field>
      <Field label="Description" error={errors.description}>
        <textarea rows="4" value={f.description} onChange={set("description")} placeholder="Describe the situation, damage and number of people affected" />
      </Field>
      <div className="two">
        <Field label="Affected city" error={errors.city}>
          <select value={f.city} onChange={set("city")}>
            <option value="">Choose city</option>
            {cityNames.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Reported date and time" error={errors.reportedAt}>
          <input type="datetime-local" value={f.reportedAt} onChange={set("reportedAt")} />
        </Field>
      </div>
      <div className="two">
        <Field label="Severity">
          <select value={f.severity} onChange={set("severity")}>{SEVERITIES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Status">
          <select value={f.status} onChange={set("status")}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
      </div>
      <Field label="People affected (optional)" error={errors.peopleAffected}>
        <input inputMode="numeric" value={f.peopleAffected} onChange={set("peopleAffected")} placeholder="If known" />
      </Field>
      <fieldset className="field">
        <legend>Relief requirements</legend>
        <div className="checks">
          {RELIEF_NEEDS.map((n) => (
            <label key={n} className={f.needs.includes(n) ? "check on" : "check"}>
              <input type="checkbox" checked={f.needs.includes(n)} onChange={() => toggleNeed(n)} /> {n}
            </label>
          ))}
        </div>
        {errors.needs && <em className="err">{errors.needs}</em>}
      </fieldset>
      <Field label="Image link (optional)" error={errors.image} hint="Paste a link, or upload a small image below (max 250 KB).">
        <input value={f.image.startsWith("data:") ? "(uploaded image)" : f.image} disabled={f.image.startsWith("data:")} onChange={set("image")} placeholder="https://..." />
      </Field>
      <div className="row-gap">
        <input type="file" accept="image/*" onChange={onFile} aria-label="Upload an image" />
        {f.image && <button type="button" className="btn ghost small" onClick={() => setF({ ...f, image: "" })}>Remove image</button>}
      </div>
      <IncidentImage src={f.image} />
      <button className="btn" type="submit">{submitLabel}</button>
    </form>
  );
}
