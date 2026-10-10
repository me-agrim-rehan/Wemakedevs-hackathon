import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import NgoDashboard from "./pages/ngo/NgoDashboard.jsx";
import ActiveIncidents from "./pages/ngo/ActiveIncidents.jsx";
import NgoDirectory from "./pages/ngo/NgoDirectory.jsx";
import Volunteer from "./pages/ngo/Volunteer.jsx";
import NgoSummary from "./pages/ngo/NgoSummary.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ManageIncidents from "./pages/admin/ManageIncidents.jsx";
import IncidentEditor from "./pages/admin/IncidentEditor.jsx";
import NgoManagement from "./pages/admin/NgoManagement.jsx";
import CitiesManagement from "./pages/admin/CitiesManagement.jsx";
import AdminSummary from "./pages/admin/AdminSummary.jsx";

// Only lets the matching role in. Wrong role -> sent to their own dashboard. Not logged in -> login page.
function RequireRole({ role, children }) {
  const { session } = useApp();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== role) return <Navigate to={`/${session.role}`} replace />;
  return children;
}

function HomeRedirect() {
  const { session } = useApp();
  return <Navigate to={session ? `/${session.role}` : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/ngo" element={<RequireRole role="ngo"><DashboardLayout role="ngo" /></RequireRole>}>
            <Route index element={<NgoDashboard />} />
            <Route path="incidents" element={<ActiveIncidents />} />
            <Route path="directory" element={<NgoDirectory />} />
            <Route path="volunteer" element={<Volunteer />} />
            <Route path="summary" element={<NgoSummary />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/ngo" replace />} />
          </Route>

          <Route path="/admin" element={<RequireRole role="admin"><DashboardLayout role="admin" /></RequireRole>}>
            <Route index element={<AdminDashboard />} />
            <Route path="incidents" element={<ManageIncidents />} />
            <Route path="incidents/:id/edit" element={<IncidentEditor />} />
            <Route path="add-incident" element={<IncidentEditor />} />
            <Route path="ngos" element={<NgoManagement />} />
            <Route path="cities" element={<CitiesManagement />} />
            <Route path="summary" element={<AdminSummary />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
