// ---------- Constants used across the app ----------
export const RELIEF_NEEDS = ["Food", "Clean water", "Shelter", "Medical", "Rescue", "Clothing"];
export const SEVERITIES = ["Low", "Medium", "High", "Critical"];
export const STATUSES = ["Ongoing", "Running", "Resolved"];
export const OPEN_STATUSES = ["Ongoing", "Running"]; // shown on the NGO dashboard
export const SERVICE_CATEGORIES = ["Health", "Food", "Shelter", "Rescue", "Education", "Rehabilitation"];

// ---------- SAMPLE / DEMO DATA ----------
// Everything below is made-up test data. Replace it with real data when you have a backend.

// City coordinates are approximate city centres, used only for the map.
export const seedCities = [
  { id: 1, name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.209 },
  { id: 2, name: "Sonipat", state: "Haryana", lat: 28.9288, lng: 77.0913 },
  { id: 3, name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391 },
  { id: 4, name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
  { id: 5, name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { id: 6, name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { id: 7, name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
  { id: 8, name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
];

export const seedIncidents = [
  { id: 1, title: "Delhi waterlogging", description: "Severe waterlogging in low-lying areas.", city: "Delhi", severity: "High", status: "Running", reportedAt: "2026-10-07T09:30:00.000Z", peopleAffected: 1200, needs: ["Clean water", "Medical"], image: "", demo: true },
  { id: 2, title: "Sonipat villages submerged", description: "Several villages are cut off and need rescue support.", city: "Sonipat", severity: "Critical", status: "Running", reportedAt: "2026-10-07T07:10:00.000Z", peopleAffected: 800, needs: ["Rescue", "Food", "Shelter"], image: "", demo: true },
  { id: 3, title: "Patna flooding", description: "Multiple villages affected along the river.", city: "Patna", severity: "Medium", status: "Ongoing", reportedAt: "2026-10-06T16:00:00.000Z", peopleAffected: 2500, needs: ["Food", "Shelter"], image: "", demo: true },
  { id: 4, title: "Dehradun road blockage", description: "Roads blocked by debris, relief supplies required.", city: "Dehradun", severity: "Medium", status: "Ongoing", reportedAt: "2026-10-06T11:45:00.000Z", peopleAffected: 400, needs: ["Food", "Clothing"], image: "", demo: true },
  { id: 5, title: "Lucknow drainage overflow", description: "Water has receded and relief camps are closed.", city: "Lucknow", severity: "Low", status: "Resolved", reportedAt: "2026-10-01T08:00:00.000Z", peopleAffected: 300, needs: ["Clean water"], image: "", demo: true },
];

// lat/lng are approximate city positions (demo), not the real addresses of any organisation.
export const seedNgos = [
  { id: 1, name: "Care4People Foundation", focus: "Health", services: ["Health", "Food"], cities: ["Delhi", "Noida", "Patna"], phone: "+91 90000 00001", email: "contact@care4people.example.org", verification: "Verified (demo)", active: true, rating: 4.8, lat: 28.6139, lng: 77.209, demo: true },
  { id: 2, name: "Bharat Seva NGO", focus: "Food", services: ["Food", "Shelter"], cities: ["Patna", "Kolkata"], phone: "+91 90000 00002", email: "contact@bharatseva.example.org", verification: "Verified (demo)", active: true, rating: 4.6, lat: 25.5941, lng: 85.1376, demo: true },
  { id: 3, name: "Green Earth Foundation", focus: "Rehabilitation", services: ["Rehabilitation", "Shelter"], cities: ["Dehradun"], phone: "+91 90000 00003", email: "contact@greenearth.example.org", verification: "Verified (demo)", active: true, rating: 4.5, lat: 30.3165, lng: 78.0322, demo: true },
  { id: 4, name: "Rural Health Initiative", focus: "Health", services: ["Health", "Education"], cities: ["Lucknow", "Varanasi"], phone: "+91 90000 00004", email: "contact@ruralhealth.example.org", verification: "Unverified", active: true, rating: null, lat: 26.8467, lng: 80.9462, demo: true },
  { id: 5, name: "Rescue Riders Group", focus: "Rescue", services: ["Rescue"], cities: ["Sonipat", "Delhi"], phone: "+91 90000 00005", email: "contact@rescueriders.example.org", verification: "Verified (demo)", active: true, rating: 4.4, lat: 28.9288, lng: 77.0913, demo: true },
];

export const seedOpportunities = [
  { id: 1, title: "Relief kit packing", ngoId: 2, city: "Patna", skills: ["No special skill"], support: "Food", schedule: "Weekends, 9 AM – 1 PM", needed: 15 },
  { id: 2, title: "Medical camp assistant", ngoId: 1, city: "Delhi", skills: ["First aid", "Nursing"], support: "Medical", schedule: "Weekdays, 10 AM – 4 PM", needed: 6 },
  { id: 3, title: "Boat and rescue support", ngoId: 5, city: "Sonipat", skills: ["Swimming", "Rescue training"], support: "Rescue", schedule: "On call", needed: 8 },
  { id: 4, title: "Shelter and clothing drive", ngoId: 3, city: "Dehradun", skills: ["Logistics"], support: "Shelter", schedule: "Any day", needed: 10 },
];

export const emptyPlan = { incidentId: null, ngoId: null, support: [], note: "", confirmed: false };
