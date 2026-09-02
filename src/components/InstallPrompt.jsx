import { useState, useEffect } from "react";

/* ---------------------------------------------------------------
   Install banner — handles the real platform split:
   - Android/Chrome/Edge: captures the native beforeinstallprompt
     event and shows a working "Install" button.
   - iOS Safari: beforeinstallprompt doesn't exist at all — no
     button can trigger install. Shows manual instructions instead.
   - Already installed (running standalone): shows nothing.
   - Dismissed: stays hidden for 7 days (localStorage), not gone
     forever — reasonable middle ground for a repeat visitor.
------------------------------------------------------------------ */

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState(null); // "android" | "ios"

  useEffect(() => {
    if (isStandalone()) return;

    const dismissedUntil = localStorage.getItem("mahara-install-dismissed-until");
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;

    if (isIOS()) {
      setPlatform("ios");
      setVisible(true);
      return;
    }

    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform("android");
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  }

  function handleDismiss() {
    const sevenDays = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("mahara-install-dismissed-until", String(sevenDays));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        left: "1rem",
        right: "1rem",
        maxWidth: "420px",
        margin: "0 auto",
        zIndex: 90,
        background: "#1A1410",
        borderRadius: "8px",
        padding: "1rem 1.1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.9rem",
        boxShadow: "0 12px 32px rgba(0,0,0,.35)",
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#FAF6EF", marginBottom: "0.2rem" }}>
          Install Mahara
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "rgba(250,246,239,.65)", lineHeight: 1.4 }}>
          {platform === "ios"
            ? "Tap the Share icon, then \"Add to Home Screen.\""
            : "Add it to your home screen for quick access, even offline."}
        </p>
      </div>
      {platform === "android" && (
        <button
          type="button"
          onClick={handleInstallClick}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#FAF6EF",
            background: "#9B1B30",
            padding: "0.6rem 1rem",
            borderRadius: "100px",
            whiteSpace: "nowrap",
            border: "none",
          }}
        >
          Install
        </button>
      )}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{ background: "none", border: "none", color: "rgba(250,246,239,.4)", fontSize: "1.1rem", lineHeight: 1, padding: "0.2rem" }}
      >
        ×
      </button>
    </div>
  );
}
