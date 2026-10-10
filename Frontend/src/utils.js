import { OPEN_STATUSES } from "./data.js";

export const PHONE_RE = /^[6-9]\d{9}$/; // 10-digit Indian mobile number
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isOpen = (incident) => OPEN_STATUSES.includes(incident.status);

// Next free ID = highest existing ID + 1 (so IDs stay 1..N for a fresh list)
export const nextId = (list) => list.reduce((max, x) => Math.max(max, Number(x.id) || 0), 0) + 1;

export function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "Date unknown";
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ISO string -> value for <input type="datetime-local">
export function toLocalInput(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export const splitList = (text) => String(text || "").split(",").map((x) => x.trim()).filter(Boolean);

export const initials = (name) =>
  String(name || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

export const countBy = (list, keyFn) =>
  list.reduce((acc, item) => {
    const k = keyFn(item);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
