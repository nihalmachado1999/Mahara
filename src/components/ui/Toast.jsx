import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ---------------------------------------------------------------
   Toast — one small status message at a time.

     const { toast, showToast, dismissToast } = useToast();
     showToast({ message, tone, action: { label, onClick }, link: { label, to } });
     <Toast toast={toast} onDismiss={dismissToast} />

   tone: "neutral" | "success" | "error"
   Errors stay until dismissed. Everything else auto-dismisses, and
   the timer pauses while the toast is hovered or focused.
------------------------------------------------------------------ */

const DEFAULT_MS = 5000;
const WITH_ACTION_MS = 8000;

export function useToast() {
  const [toast, setToast] = useState(null);
  const idRef = useRef(0);

  const showToast = useCallback((next) => {
    idRef.current += 1;
    const tone = next.tone || "neutral";
    const hasAction = Boolean(next.action || next.link);
    let duration = hasAction ? WITH_ACTION_MS : DEFAULT_MS;
    if (tone === "error") duration = null;
    if (next.duration !== undefined) duration = next.duration;
    setToast({ ...next, tone, duration, id: idRef.current });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return { toast, showToast, dismissToast };
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ToastCard({ toast, onDismiss }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (toast.duration == null || paused) return undefined;
    const timer = setTimeout(onDismiss, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, paused, onDismiss]);

  return (
    <div
      className={`ui-toast ${toast.tone === "error" ? "ui-toast--error" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape") onDismiss();
      }}
    >
      <span className="ui-toast__mark" aria-hidden="true"></span>
      <p className="ui-toast__msg">{toast.message}</p>
      {toast.action && (
        <button
          type="button"
          className="ui-toast__action"
          onClick={() => {
            toast.action.onClick();
            onDismiss();
          }}
        >
          {toast.action.label}
        </button>
      )}
      {toast.link && (
        <Link to={toast.link.to} className="ui-toast__action" onClick={onDismiss}>
          {toast.link.label}
        </Link>
      )}
      <button type="button" className="ui-toast__close" aria-label="Dismiss message" onClick={onDismiss}>
        <CloseIcon />
      </button>
    </div>
  );
}

export default function Toast({ toast, onDismiss }) {
  const isError = toast?.tone === "error";
  // Both live regions stay mounted: screen readers only announce content
  // that is added to a region which already existed.
  return (
    <div className="ui-toast-region">
      <div role="status" aria-live="polite">
        {toast && !isError && <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />}
      </div>
      <div role="alert" aria-live="assertive">
        {toast && isError && <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />}
      </div>
    </div>
  );
}
