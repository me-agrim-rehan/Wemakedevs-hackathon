import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { Badge, ConfirmModal, EmptyState, Field, Modal, Notice, PageHeader } from "../../components/ui.jsx";

function CityForm({ initial, cities, onSave, onCancel }) {
  const [f, setF] = useState({
    name: initial?.name ?? "", state: initial?.state ?? "",
    lat: Number.isFinite(initial?.lat) ? String(initial.lat) : "",
    lng: Number.isFinite(initial?.lng) ? String(initial.lng) : "",
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    const name = f.name.trim();
    if (!name) errs.name = "Enter the city name.";
    else if (cities.some((c) => c.id !== initial?.id && c.name.toLowerCase() === name.toLowerCase())) errs.name = "This city already exists.";
    const lat = f.lat === "" ? null : Number(f.lat);
    const lng = f.lng === "" ? null : Number(f.lng);
    if (lat !== null && !(lat >= -90 && lat <= 90)) errs.lat = "Latitude must be between -90 and 90.";
    if (lng !== null && !(lng >= -180 && lng <= 180)) errs.lng = "Longitude must be between -180 and 180.";
    if ((lat === null) !== (lng === null)) errs.lat = errs.lat || "Enter both latitude and longitude, or leave both empty.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ name, state: f.state.trim(), lat, lng });
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field label="City name" error={errors.name}><input value={f.name} onChange={set("name")} /></Field>
      <Field label="State (optional)"><input value={f.state} onChange={set("state")} /></Field>
      <div className="two">
        <Field label="Latitude (optional)" error={errors.lat}><input inputMode="decimal" value={f.lat} onChange={set("lat")} placeholder="28.6139" /></Field>
        <Field label="Longitude (optional)" error={errors.lng}><input inputMode="decimal" value={f.lng} onChange={set("lng")} placeholder="77.2090" /></Field>
      </div>
      <div className="modal-foot">
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn">Save city</button>
      </div>
    </form>
  );
}

export default function CitiesManagement() {
  const { cities, incidents, addCity, updateCity, deleteCity } = useApp();
  const [editing, setEditing] = useState(null); // null | "new" | city
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const countFor = (name) => incidents.filter((i) => i.city === name).length;

  const save = (data) => {
    if (editing === "new") { addCity(data); setNotice(`${data.name} added.`); }
    else { updateCity(editing.id, data); setNotice(`${data.name} updated.`); }
    setEditing(null);
  };

  const askDelete = (c) => {
    const n = countFor(c.name);
    if (n > 0) {
      setNotice("");
      setError(`${c.name} has ${n} incident(s). Edit or delete those incidents before removing the city.`);
      return;
    }
    setError("");
    setDeleting(c);
  };

  return (
    <div className="page">
      <PageHeader title="Cities Management" sub="Cities used in incident forms and on the map. The starting list is sample data."
        action={<button className="btn small" onClick={() => setEditing("new")}>Add city</button>} />
      <Notice>{notice}</Notice>
      <Notice kind="error">{error}</Notice>

      {cities.length === 0 ? (
        <EmptyState title="No cities yet" text="Add a city so it can be chosen when reporting incidents." />
      ) : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>City</th><th>State</th><th>Map position</th><th>Incidents</th><th>Actions</th></tr></thead>
            <tbody>
              {cities.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.name}</b></td>
                  <td>{c.state || "-"}</td>
                  <td>{Number.isFinite(c.lat) && Number.isFinite(c.lng) ? `${c.lat}, ${c.lng}` : <Badge kind="unverified">Not set</Badge>}</td>
                  <td>{countFor(c.name)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" title="Edit" aria-label="Edit city" onClick={() => { setError(""); setEditing(c); }}><Pencil size={17} /></button>
                      <button className="icon-btn danger-text" title="Remove" aria-label="Remove city" onClick={() => askDelete(c)}><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Add city" : `Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <CityForm initial={editing === "new" ? null : editing} cities={cities} onSave={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      {deleting && (
        <ConfirmModal title="Remove city?" text={`${deleting.name} will be removed from the city list.`} confirmLabel="Remove"
          onCancel={() => setDeleting(null)}
          onConfirm={() => { deleteCity(deleting.id); setNotice(`${deleting.name} removed.`); setDeleting(null); }} />
      )}
    </div>
  );
}
