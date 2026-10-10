import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { seedCities, seedIncidents, seedNgos, seedOpportunities, emptyPlan, SEVERITIES, STATUSES } from "../data.js";
import { nextId, splitList } from "../utils.js";

// DEMO STORAGE: everything is kept in this browser's localStorage.
// It is NOT secure and NOT shared between users. Passwords are never stored.
const PREFIX = "helpasone.v1.";
const AppContext = createContext(null);

function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        const sameKind = Array.isArray(initial) ? Array.isArray(parsed) : parsed === null || typeof parsed === "object";
        if (sameKind) return parsed;
      }
    } catch {
      /* broken or blocked storage: fall back to sample data */
    }
    return initial;
  });
  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage full or blocked: the app still works for this visit */
    }
  }, [key, value]);
  return [value, setValue];
}

const objects = (list) => list.filter((x) => x && typeof x === "object");

const normIncident = (i) => ({
  ...i,
  id: Number(i.id),
  title: String(i.title || "Untitled incident"),
  description: String(i.description || ""),
  city: String(i.city || "Unknown"),
  severity: SEVERITIES.includes(i.severity) ? i.severity : "Low",
  status: STATUSES.includes(i.status) ? i.status : "Ongoing",
  needs: Array.isArray(i.needs) ? i.needs : [],
  image: i.image || "",
});

const normNgo = (n) => ({
  ...n,
  name: String(n.name || "Unnamed NGO"),
  services: Array.isArray(n.services) ? n.services : [],
  cities: Array.isArray(n.cities) ? n.cities : [],
  active: n.active !== false,
  verification: n.verification || "Unverified",
  rating: typeof n.rating === "number" ? n.rating : null,
  lat: Number.isFinite(n.lat) ? n.lat : null,
  lng: Number.isFinite(n.lng) ? n.lng : null,
});

export function AppProvider({ children }) {
  const [session, setSession] = useStored("session", null);
  const [users, setUsers] = useStored("users", []); // profiles only, never passwords
  const [rawIncidents, setIncidents] = useStored("incidents", seedIncidents);
  const [rawCities, setCities] = useStored("cities", seedCities);
  const [rawNgos, setNgos] = useStored("ngos", seedNgos);
  const [rawOpps] = useStored("opportunities", seedOpportunities);
  const [applications, setApplications] = useStored("applications", []);
  const [rawPlan, setRawPlan] = useStored("plan", emptyPlan);

  const incidents = useMemo(() => objects(rawIncidents).map(normIncident), [rawIncidents]);
  const cities = useMemo(() => objects(rawCities), [rawCities]);
  const ngos = useMemo(() => objects(rawNgos).map(normNgo), [rawNgos]);
  const opportunities = useMemo(() => objects(rawOpps), [rawOpps]);
  const plan = { ...emptyPlan, ...(rawPlan || {}) };

  const coordsFor = (cityName) => {
    const c = cities.find((x) => x.name.toLowerCase() === String(cityName || "").toLowerCase());
    return c && Number.isFinite(c.lat) && Number.isFinite(c.lng) ? { lat: c.lat, lng: c.lng } : { lat: null, lng: null };
  };

  /* ---------- demo authentication ---------- */
  const login = ({ role, name, phone }) => {
    const profile = users.find((u) => u.phone === phone && u.role === role);
    setSession(profile ? { ...profile, name: name || profile.name } : { role, name, phone, orgName: "", ngoId: null });
  };

  const register = (data) => {
    if (users.some((u) => u.phone === data.phone && u.role === data.role)) {
      return { ok: false, error: "This phone number is already registered for this role. Please log in instead." };
    }
    let ngoId = null;
    if (data.role === "ngo") {
      ngoId = nextId(ngos);
      setNgos((prev) => [
        ...objects(prev),
        {
          id: ngoId, name: data.orgName, focus: data.focus, services: [data.focus], cities: splitList(data.cities),
          phone: `+91 ${data.phone}`, email: data.email || "", verification: "Unverified", active: true, rating: null,
          ...coordsFor(splitList(data.cities)[0]), demo: false,
        },
      ]);
    }
    const profile = { role: data.role, name: data.name, phone: data.phone, orgName: data.orgName || "", ngoId };
    setUsers((prev) => [...objects(prev), profile]);
    setSession(profile);
    return { ok: true };
  };

  const logout = () => setSession(null);

  const updateProfile = (patch) => {
    if (!session) return;
    setUsers((prev) => objects(prev).map((u) => (u.phone === session.phone && u.role === session.role ? { ...u, ...patch } : u)));
    setSession((s) => ({ ...s, ...patch }));
    if (session.role === "ngo" && session.ngoId && patch.orgName) {
      setNgos((prev) => objects(prev).map((n) => (n.id === session.ngoId ? { ...n, name: patch.orgName } : n)));
    }
  };

  /* ---------- incidents ---------- */
  const addIncident = (data) => {
    const incident = { ...data, id: nextId(incidents), demo: false };
    setIncidents((prev) => [...objects(prev), incident]);
    return incident;
  };
  const updateIncident = (id, patch) => setIncidents((prev) => objects(prev).map((i) => (Number(i.id) === id ? { ...i, ...patch } : i)));
  const deleteIncident = (id) => {
    setIncidents((prev) => objects(prev).filter((i) => Number(i.id) !== id));
    if (plan.incidentId === id) setRawPlan({ ...plan, incidentId: null, confirmed: false });
  };

  /* ---------- cities ---------- */
  const addCity = (data) => setCities((prev) => [...objects(prev), { ...data, id: nextId(cities) }]);
  const updateCity = (id, patch) => {
    const old = cities.find((c) => c.id === id);
    setCities((prev) => objects(prev).map((c) => (c.id === id ? { ...c, ...patch } : c)));
    if (old && patch.name && patch.name !== old.name) {
      // keep everything that refers to the city name consistent
      setIncidents((prev) => objects(prev).map((i) => (i.city === old.name ? { ...i, city: patch.name } : i)));
      setNgos((prev) => objects(prev).map((n) => ({ ...n, cities: (n.cities || []).map((c) => (c === old.name ? patch.name : c)) })));
    }
  };
  const deleteCity = (id) => setCities((prev) => objects(prev).filter((c) => c.id !== id));

  /* ---------- NGOs ---------- */
  const addNgo = (data) => setNgos((prev) => [...objects(prev), { ...data, id: nextId(ngos), demo: false }]);
  const updateNgo = (id, patch) => setNgos((prev) => objects(prev).map((n) => (n.id === id ? { ...n, ...patch } : n)));
  const deleteNgo = (id) => {
    setNgos((prev) => objects(prev).filter((n) => n.id !== id));
    if (plan.ngoId === id) setRawPlan({ ...plan, ngoId: null, confirmed: false });
  };

  /* ---------- volunteers ---------- */
  const by = session ? session.phone : "";
  const myApplications = applications.filter((a) => a && a.by === by);
  const applyToOpportunity = (oppId, applicant, note) =>
    setApplications((prev) => [...objects(prev), { id: nextId(objects(prev)), oppId, by, applicant, note, status: "Submitted", date: new Date().toISOString() }]);
  const withdrawApplication = (oppId) => setApplications((prev) => objects(prev).filter((a) => !(a.oppId === oppId && a.by === by)));

  /* ---------- NGO support plan ---------- */
  const setPlan = (patch) => setRawPlan({ ...plan, ...patch });
  const clearPlan = () => setRawPlan(emptyPlan);

  const resetDemoData = () => {
    setIncidents(seedIncidents);
    setCities(seedCities);
    setNgos(seedNgos);
    setApplications([]);
    setRawPlan(emptyPlan);
  };

  const value = {
    session, login, register, logout, updateProfile,
    incidents, addIncident, updateIncident, deleteIncident,
    cities, addCity, updateCity, deleteCity, coordsFor,
    ngos, addNgo, updateNgo, deleteNgo,
    opportunities, applications, myApplications, applyToOpportunity, withdrawApplication,
    plan, setPlan, clearPlan, resetDemoData,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
