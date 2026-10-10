import { useState } from "react";
import { Pencil, Trash2, ShieldCheck, Power } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { SERVICE_CATEGORIES } from "../../data.js";
import { EMAIL_RE, splitList } from "../../utils.js";
import { Badge, ConfirmModal, EmptyState, Field, Modal, Notice, PageHeader } from "../../components/ui.jsx";

function NgoForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState({
    name: initial?.name ?? "",
    focus: initial?.focus ?? "Health",
    services: initial?.services ?? [],
    cities: (initial?.cities ?? []).join(", "),
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggle = (s) => setF({ ...f, services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s] });

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.name.trim()) errs.name = "Enter the NGO name.";
    if (f.email && !EMAIL_RE.test(f.email)) errs.email = "Enter a valid email or leave it empty.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({
      name: f.name.trim(), focus: f.focus,
      services: f.services.length ? f.services : [f.focus],
      cities: splitList(f.cities), phone: f.phone.trim(), email: f.email.trim(),
    });
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field label="NGO name" error={errors.name}><input value={f.name} onChange={set("name")} /></Field>
      <Field label="Main focus area">
        <select value={f.focus} onChange={set("focus")}>{SERVICE_CATEGORIES.map((s) => <option key={s}>{s}</option>)}</select>
      </Field>
      <fieldset className="field">
        <legend>Services provided</legend>
        <div className="checks">
          {SERVICE_CATEGORIES.map((s) => (
            <label key={s} className={f.services.includes(s) ? "check on" : "check"}>
              <input type="checkbox" checked={f.services.includes(s)} onChange={() => toggle(s)} /> {s}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Cities served" hint="Separate with commas. The first city decides the map position if it exists in Cities Management.">
        <input value={f.cities} onChange={set("cities")} placeholder="Delhi, Patna" />
      </Field>
      <div className="two">
        <Field label="Phone"><input value={f.phone} onChange={set("phone")} /></Field>
        <Field label="Email" error={errors.email}><input value={f.email} onChange={set("email")} /></Field>
      </div>
      <div className="modal-foot">
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn">Save NGO</button>
      </div>
    </form>
  );
}

export default function NgoManagement() {
  const { ngos, addNgo, updateNgo, deleteNgo, coordsFor } = useApp();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | ngo
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState("");

  const list = ngos.filter((n) => n.name.toLowerCase().includes(q.toLowerCase()));

  const save = (data) => {
    const coords = coordsFor(data.cities[0]);
    if (editing === "new") {
      addNgo({ ...data, ...coords, verification: "Unverified", active: true, rating: null });
      setNotice(`"${data.name}" added. It is unverified until you verify it.`);
    } else {
      updateNgo(editing.id, { ...data, ...(coords.lat != null ? coords : {}) });
      setNotice(`"${data.name}" updated.`);
    }
    setEditing(null);
  };

  const toggleVerify = (n) => {
    const verified = n.verification.startsWith("Verified");
    updateNgo(n.id, { verification: verified ? "Unverified" : "Verified (demo)" });
    setNotice(`${n.name} is now ${verified ? "unverified" : "marked verified (demo)"}.`);
  };

  return (
    <div className="page">
      <PageHeader title="NGO Management" sub="Add, edit, verify, deactivate or remove NGO records. Verification here is a demo flag, not a real check."
        action={<button className="btn small" onClick={() => setEditing("new")}>Add NGO</button>} />
      <Notice>{notice}</Notice>
      <div className="filters">
        <input type="search" placeholder="Search by NGO name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search NGOs" />
      </div>

      {list.length === 0 ? (
        <EmptyState title="No NGOs found" text="Add an NGO or change the search." />
      ) : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>NGO</th><th>Focus</th><th>Cities</th><th>Verification</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map((n) => (
                <tr key={n.id}>
                  <td><b>{n.name}</b>{n.demo && <> <Badge kind="sample">Sample</Badge></>}<br /><small className="muted">{n.phone || "No phone"}</small></td>
                  <td>{n.focus}</td>
                  <td>{n.cities.join(", ") || "-"}</td>
                  <td><Badge kind={n.verification.startsWith("Verified") ? "verified" : "unverified"}>{n.verification}</Badge></td>
                  <td><Badge kind={n.active ? "running" : "resolved"}>{n.active ? "Active" : "Deactivated"}</Badge></td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" title="Edit" aria-label="Edit NGO" onClick={() => setEditing(n)}><Pencil size={17} /></button>
                      <button className="icon-btn" title="Verify or unverify (demo)" aria-label="Toggle verification" onClick={() => toggleVerify(n)}><ShieldCheck size={17} /></button>
                      <button className="icon-btn" title={n.active ? "Deactivate" : "Activate"} aria-label={n.active ? "Deactivate NGO" : "Activate NGO"}
                        onClick={() => { updateNgo(n.id, { active: !n.active }); setNotice(`${n.name} ${n.active ? "deactivated" : "activated"}.`); }}><Power size={17} /></button>
                      <button className="icon-btn danger-text" title="Remove" aria-label="Remove NGO" onClick={() => setDeleting(n)}><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Add NGO" : `Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <NgoForm initial={editing === "new" ? null : editing} onSave={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      {deleting && (
        <ConfirmModal title="Remove NGO?" text={`"${deleting.name}" will be removed from the directory. This cannot be undone.`} confirmLabel="Remove"
          onCancel={() => setDeleting(null)}
          onConfirm={() => { deleteNgo(deleting.id); setNotice(`"${deleting.name}" removed.`); setDeleting(null); }} />
      )}
    </div>
  );
}
