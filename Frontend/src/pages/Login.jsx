import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Heart, Phone, Building2, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { SERVICE_CATEGORIES } from "../data.js";
import { EMAIL_RE, PHONE_RE } from "../utils.js";
import { Field, PasswordInput } from "../components/ui.jsx";

const HELPLINES = [
  { name: "National Emergency", number: "112" },
  { name: "Disaster Management (NDMA)", number: "1078" },
];

const blank = { name: "", phone: "", password: "", orgName: "", focus: "Health", cities: "", email: "" };

export default function Login() {
  const { session, login, register } = useApp();
  const [role, setRole] = useState("ngo"); // "ngo" | "admin"
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [f, setF] = useState(blank);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  if (session) return <Navigate to={`/${session.role}`} replace />;

  const choose = (r, m) => {
    setRole(r);
    setMode(m);
    setErrors({});
    setFormError("");
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const validate = () => {
    const errs = {};
    if (f.name.trim().length < 2) errs.name = "Enter your full name.";
    if (!f.phone) errs.phone = "Enter your phone number.";
    else if (!PHONE_RE.test(f.phone)) errs.phone = "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.";
    if (f.password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (mode === "register") {
      if (!f.orgName.trim()) errs.orgName = role === "ngo" ? "Enter your NGO name." : "Enter your organization or department.";
      if (f.email && !EMAIL_RE.test(f.email)) errs.email = "Enter a valid email address or leave it empty.";
    }
    return errs;
  };

  const submit = (e) => {
    e.preventDefault();
    setFormError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (mode === "login") {
      login({ role, name: f.name.trim(), phone: f.phone });
    } else {
      const result = register({ role, name: f.name.trim(), phone: f.phone, orgName: f.orgName.trim(), focus: f.focus, cities: f.cities, email: f.email.trim() });
      if (!result.ok) setFormError(result.error);
    }
  };

  const roleLabel = role === "ngo" ? "NGO Account" : "Admin Account";

  return (
    <div className="login-page">
      <section className="login-left">
        <div className="logo big"><Heart size={34} fill="#1f4d36" stroke="#1f4d36" /> HelpAsOne</div>
        <h1>When floods destroy homes, we rebuild hope.</h1>
        <p className="lead">A coordination platform where NGOs and administrators track flood incidents and organise relief.</p>

        <div className="hero-banner">
          <span>Flood relief starts with accurate information.</span>
        </div>

        <div className="helplines">
          <b><Phone size={14} /> Need urgent help? Call now</b>
          <div>
            {HELPLINES.map((h) => (
              <a key={h.number} href={`tel:${h.number}`} className="helpline">
                <strong>{h.number}</strong>
                <small>{h.name}</small>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="login-right">
        <form className="login-card" onSubmit={submit} noValidate>
          <div className="role-groups">
            {[
              { id: "ngo", title: "NGO Account", icon: Building2 },
              { id: "admin", title: "Admin Account", icon: ShieldCheck },
            ].map(({ id, title, icon: Icon }) => (
              <div key={id} className={role === id ? "role-group selected" : "role-group"}>
                <div className="role-title"><Icon size={16} /> {title}</div>
                <div className="role-btns">
                  <button type="button" className={role === id && mode === "login" ? "seg on" : "seg"} onClick={() => choose(id, "login")}>
                    {id === "ngo" ? "NGO Login" : "Admin Login"}
                  </button>
                  <button type="button" className={role === id && mode === "register" ? "seg on" : "seg"} onClick={() => choose(id, "register")}>
                    {id === "ngo" ? "NGO Register" : "Admin Register"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h2>{roleLabel} · {mode === "login" ? "Login" : "Register"}</h2>
          <p className="muted">
            {mode === "login" ? `Log in to open the ${role === "ngo" ? "NGO" : "Admin"} dashboard.` : `Create a ${role === "ngo" ? "NGO" : "Admin"} account.`}
          </p>

          <Field label="Full name" error={errors.name}>
            <input value={f.name} onChange={set("name")} placeholder="Enter your full name" autoComplete="name" />
          </Field>
          <Field label="Phone number" error={errors.phone}>
            <input
              value={f.phone}
              inputMode="numeric"
              autoComplete="tel"
              placeholder="10-digit mobile number"
              onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <PasswordInput value={f.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </Field>

          {mode === "register" && (
            <>
              <Field label={role === "ngo" ? "NGO name" : "Organization / department"} error={errors.orgName}>
                <input value={f.orgName} onChange={set("orgName")} placeholder={role === "ngo" ? "Name of your organization" : "e.g. District Disaster Management Office"} />
              </Field>
              {role === "ngo" && (
                <>
                  <div className="two">
                    <Field label="Main focus area">
                      <select value={f.focus} onChange={set("focus")}>{SERVICE_CATEGORIES.map((s) => <option key={s}>{s}</option>)}</select>
                    </Field>
                    <Field label="Cities served (optional)" hint="Separate with commas">
                      <input value={f.cities} onChange={set("cities")} placeholder="Delhi, Patna" />
                    </Field>
                  </div>
                  <Field label="Contact email (optional)" error={errors.email}>
                    <input type="email" value={f.email} onChange={set("email")} placeholder="contact@yourngo.org" />
                  </Field>
                </>
              )}
            </>
          )}

          {formError && <p className="err block">{formError}</p>}
          <button className="btn" type="submit">{mode === "login" ? "Login" : "Create account"}</button>

          <p className="demo-note">
            <b>Demo authentication.</b> Your password is not checked or saved, and no identity is verified. Real login needs a secure backend.
          </p>
          <p className="muted center">
            {mode === "login" ? "New here? " : "Already registered? "}
            <button type="button" className="link" onClick={() => choose(role, mode === "login" ? "register" : "login")}>
              {mode === "login" ? `Register as ${role === "ngo" ? "NGO" : "Admin"}` : "Go to login"}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}
