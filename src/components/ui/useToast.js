import { useCallback, useRef, useState } from "react";

/* State for <Toast>. Lives in its own file so Toast.jsx exports only a
   component (keeps React fast refresh working).

     const { toast, showToast, dismissToast } = useToast();
     showToast({ message, tone, action: { label, onClick }, link: { label, to } });

   tone: "neutral" | "success" | "error". Errors stay until dismissed. */

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
