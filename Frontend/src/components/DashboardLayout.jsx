import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, AlertTriangle, HeartHandshake, Users, ClipboardCheck, User, LogOut, Menu,
  FilePlus2, Landmark, BarChart3, Building2, Heart,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";

const NGO_LINKS = [
  { to: "/ngo", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/ngo/incidents", label: "Active Incidents", icon: AlertTriangle },
  { to: "/ngo/directory", label: "NGO Directory", icon: HeartHandshake },
  { to: "/ngo/volunteer", label: "Volunteer", icon: Users },
  { to: "/ngo/summary", label: "Summary", icon: ClipboardCheck },
  { to: "/ngo/profile", label: "Profile", icon: User },
];

const ADMIN_LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/incidents", label: "Manage Incidents", icon: AlertTriangle },
  { to: "/admin/add-incident", label: "Add Incident", icon: FilePlus2 },
  { to: "/admin/ngos", label: "NGO Management", icon: HeartHandshake },
  { to: "/admin/cities", label: "Cities Management", icon: Building2 },
  { to: "/admin/summary", label: "Reports / Summary", icon: BarChart3 },
  { to: "/admin/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({ role }) {
  const { logout } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const links = role === "admin" ? ADMIN_LINKS : NGO_LINKS;

  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="shell">
      <header className="mobile-bar">
        <button className="icon-btn" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={22} /></button>
        <span className="logo"><Heart size={20} fill="#1f4d36" stroke="#1f4d36" /> HelpAsOne</span>
      </header>

      <aside className={open ? "sidebar open" : "sidebar"} aria-label="Main navigation">
        <div className="logo"><Heart size={24} fill="#1f4d36" stroke="#1f4d36" /> HelpAsOne</div>
        <p className="role-tag">{role === "admin" ? "Admin account" : "NGO account"}</p>
        <nav>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <button className="nav-item" onClick={handleLogout}><LogOut size={18} /> Logout</button>
        </nav>
        <p className="side-foot"><Landmark size={14} /> Demo version</p>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <main className="main">
        <div className="demo-bar">Demo mode: sample data, saved only in this browser. Login is not real authentication.</div>
        <Outlet />
      </main>
    </div>
  );
}
