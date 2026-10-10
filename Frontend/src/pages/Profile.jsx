import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Field, Notice, PageHeader, ConfirmModal } from "../components/ui.jsx";

export default function Profile() {
  const { session, updateProfile, resetDemoData } = useApp();
  const isAdmin = session.role === "admin";
  const [name, setName] = useState(session.name || "");
  const [orgName, setOrgName] = useState(session.orgName || "");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const save = (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Name must have at least 2 characters.");
    setError("");
    updateProfile({ name: name.trim(), orgName: orgName.trim() });
    setMsg("Profile updated.");
  };

  return (
    <div className="page">
      <PageHeader title="Profile" sub="Your demo account details." />
      <div className="card narrow">
        <dl className="details">
          <dt>Account type</dt><dd>{isAdmin ? "Admin" : "NGO"}</dd>
          <dt>Phone</dt><dd>+91 {session.phone}</dd>
        </dl>
        <form className="form" onSubmit={save} noValidate>
          <Field label="Full name" error={error}><input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label={isAdmin ? "Organization / department" : "NGO name"}>
            <input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          </Field>
          <Notice>{msg}</Notice>
          <button className="btn" type="submit">Save profile</button>
        </form>
        <p className="demo-note"><b>Demo account.</b> Details are saved only in this browser. No password is stored.</p>
      </div>

      {isAdmin && (
        <div className="card narrow">
          <h3>Demo data</h3>
          <p className="muted">Restore the original sample incidents, cities and NGOs. This removes everything you added.</p>
          <button className="btn danger" onClick={() => setConfirmReset(true)}>Reset demo data</button>
        </div>
      )}
      {confirmReset && (
        <ConfirmModal
          title="Reset demo data?"
          text="All incidents, cities, NGOs and applications you added or changed will be replaced by the original samples."
          confirmLabel="Reset"
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => { resetDemoData(); setConfirmReset(false); setMsg("Demo data reset."); }}
        />
      )}
    </div>
  );
}
