import { useEffect } from "react";

/* ---------------------------------------------------------------
   Custom cursor — ported from index.html's vanilla JS, unchanged
   in behavior. Lives once in App.jsx (like Nav), not per-page —
   the cursor should persist as you navigate, not reset each route.

   Automatically does nothing on touch devices (same hover:hover
   and pointer:fine check as the original — this isn't optional,
   it's why the CSS also hides it under that same media query).
------------------------------------------------------------------ */
export default function CustomCursor() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const curDot = document.getElementById("cur-dot");
    const curRing = document.getElementById("cur-ring");
    if (!curDot || !curRing) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let raf;

    function handleMove(e) {
      mx = e.clientX;
      my = e.clientY;
      curDot.style.left = mx + "px";
      curDot.style.top = my + "px";
    }
    document.addEventListener("mousemove", handleMove);

    function ringLoop() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      curRing.style.left = rx + "px";
      curRing.style.top = ry + "px";
      raf = requestAnimationFrame(ringLoop);
    }
    ringLoop();

    // Re-scans on every mount, so it picks up whatever page is
    // currently rendered. Elements matching this selector added
    // after mount (e.g. inside a modal) won't get cursor-expand
    // behavior automatically — acceptable tradeoff, matches what
    // the original vanilla version did too (one-time querySelectorAll).
    const hoverTargets = document.querySelectorAll(
      "a, button, .dest-card, .story-card, .event-card, .filter",
    );
    function expand() { curDot.classList.add("expand"); curRing.classList.add("expand"); }
    function contract() { curDot.classList.remove("expand"); curRing.classList.remove("expand"); }
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", expand);
      el.addEventListener("mouseleave", contract);
    });

    return () => {
      document.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(raf);
      hoverTargets.forEach((el) => {
        el.removeEventListener("mouseenter", expand);
        el.removeEventListener("mouseleave", contract);
      });
    };
  }, []);

  return (
    <>
      <div id="cur-dot"></div>
      <div id="cur-ring"></div>
    </>
  );
}
