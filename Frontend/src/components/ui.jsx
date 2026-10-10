import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";

export const Badge = ({ kind = "", children }) => (
  <span className={`badge ${String(kind).toLowerCase().replace(/[^a-z]/g, "")}`}>{children}</span>
);

export const StatCard = ({ label, value, hint }) => (
  <div className="stat">
    <span className="stat-label">{label}</span>
    <strong>{value}</strong>
    {hint && <small>{hint}</small>}
  </div>
);

export const PageHeader = ({ title, sub, action }) => (
  <div className="page-head">
    <div>
      <h1>{title}</h1>
      {sub && <p className="muted">{sub}</p>}
    </div>
    {action}
  </div>
);

export const EmptyState = ({ title, text, children }) => (
  <div className="empty">
    <h3>{title}</h3>
    {text && <p className="muted">{text}</p>}
    {children && <div className="empty-actions">{children}</div>}
  </div>
);

export const Notice = ({ kind = "success", children }) =>
  children ? <div className={`notice ${kind}`} role="status">{children}</div> : null;

export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="row-between">
          <h3>{title}</h3>
          <button className="icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export const ConfirmModal = ({ title, text, confirmLabel = "Delete", onConfirm, onCancel }) => (
  <Modal
    title={title}
    onClose={onCancel}
    footer={
      <>
        <button className="btn ghost" onClick={onCancel}>Cancel</button>
        <button className="btn danger" onClick={onConfirm}>{confirmLabel}</button>
      </>
    }
  >
    <p>{text}</p>
  </Modal>
);

export const Field = ({ label, error, hint, children }) => (
  <label className="field">
    <span>{label}</span>
    {children}
    {hint && !error && <small className="muted">{hint}</small>}
    {error && <em className="err">{error}</em>}
  </label>
);

export function PasswordInput({ value, onChange, placeholder = "Enter your password", autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw">
      <input type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} />
      <button type="button" className="icon-btn" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
