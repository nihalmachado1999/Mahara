import { useEffect } from "react";

/* ---------------------------------------------------------------
   Per-page scroll effects — reveal-on-scroll, magnetic buttons,
   count-up numbers. Ported from index.html's vanilla JS.

   Unlike the cursor, these DO need to be per-page: they target
   .reveal / .magnetic / [data-count] elements that only exist
   while that specific page is mounted. Call this once per page
   component:

     useScrollEffects();

   Call it AFTER your page's JSX is written, not before — it scans
   the DOM on mount, so elements need to already be there.
------------------------------------------------------------------ */
export function useScrollEffects(deps = []) {
  useEffect(() => {
    // Reveal on scroll
    const revealEls = document.querySelectorAll(".reveal");
    const revealIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("revealed");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    revealEls.forEach((el) => revealIo.observe(el));

    // Magnetic buttons
    const magneticEls = document.querySelectorAll(".magnetic");
    function magneticMove(e) {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.3;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      el.style.transform = `translate(${x}px, ${y}px)`;
    }
    function magneticLeave(e) {
      e.currentTarget.style.transform = "";
    }
    magneticEls.forEach((el) => {
      el.addEventListener("mousemove", magneticMove);
      el.addEventListener("mouseleave", magneticLeave);
    });

    // Count-up numbers
    const countEls = document.querySelectorAll("[data-count]");
    const countIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || "";
          const duration = 1400;
          const start = performance.now();
          function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = Math.round(target * eased);
            el.textContent = val.toLocaleString() + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          countIo.unobserve(el);
        });
      },
      { threshold: 0.4 },
    );
    countEls.forEach((el) => countIo.observe(el));

    return () => {
      revealIo.disconnect();
      countIo.disconnect();
      magneticEls.forEach((el) => {
        el.removeEventListener("mousemove", magneticMove);
        el.removeEventListener("mouseleave", magneticLeave);
      });
    };
  }, deps);
}
