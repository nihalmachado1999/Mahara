import { useState, useRef, useCallback, useEffect } from "react";
import { pearlingPathStops } from "../data/pearlingStops";

/* ---------------------------------------------------------------
   Fixes applied vs. the original vanilla AudioGuideEngine:

   1. unlockAudioContext() now fires on startTour() — the "Start Tour"
      button press IS the user gesture. Previously it only ran inside
      playManual(), so an auto-triggered first stop could silently
      produce no sound on iOS Safari.

   2. Real cleanup: clearWatch() runs both on endTour() and on
      component unmount (via useEffect cleanup). The original never
      stopped the GPS watch at all — it would keep polling location
      in the background indefinitely.

   3. triggerNarration (now folded into speak()) always calls
      speechSynthesis.cancel() first, same as playManual did. The
      original only did this on the manual path, so two proximity
      triggers in quick succession could queue and talk over each other.

   4. Only one stop triggers per position update (the loop breaks after
      the first match), rather than potentially firing multiple stops
      off a single GPS reading.

   5. NEW, caught during React conversion, not in the original list:
      played-stop tracking uses a ref, not state, for the internal
      proximity check. watchPosition's callback is registered once —
      if it read `playedStops` state directly, it would close over
      whatever that state was at registration time and never see
      updates, causing the same stop to replay forever. The ref is
      always current; a parallel state array exists only to trigger
      re-renders for the UI (checkmarks in the fallback list).
------------------------------------------------------------------ */

function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function useAudioGuide() {
  const [isActive, setIsActive] = useState(false);
  const [playedStopIds, setPlayedStopIds] = useState([]);
  const [currentStopId, setCurrentStopId] = useState(null);
  // idle | searching | tracking | weak-signal | unavailable
  const [gpsStatus, setGpsStatus] = useState("idle");

  const playedStopsRef = useRef(new Set());
  const watchIdRef = useRef(null);
  const unlockedRef = useRef(false);

  const unlockAudioContext = useCallback(() => {
    if (unlockedRef.current) return;
    const silent = new SpeechSynthesisUtterance("");
    silent.volume = 0;
    window.speechSynthesis.speak(silent);
    unlockedRef.current = true;
  }, []);

  const speak = useCallback((stop) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(stop.script);
    utterance.rate = 0.85;
    utterance.onstart = () => setCurrentStopId(stop.id);
    utterance.onend = () => setCurrentStopId(null);
    window.speechSynthesis.speak(utterance);

    playedStopsRef.current.add(stop.id);
    setPlayedStopIds(Array.from(playedStopsRef.current));
  }, []);

  const playManual = useCallback(
    (stopId) => {
      const stop = pearlingPathStops.find((s) => s.id === stopId);
      if (!stop) return;
      unlockAudioContext();
      speak(stop);
    },
    [unlockAudioContext, speak],
  );

  const processProximity = useCallback(
    (position) => {
      if (position.coords.accuracy > 50) {
        setGpsStatus("weak-signal");
        return;
      }
      setGpsStatus("tracking");

      for (const stop of pearlingPathStops) {
        if (playedStopsRef.current.has(stop.id)) continue;
        const dist = calculateHaversine(
          position.coords.latitude,
          position.coords.longitude,
          stop.lat,
          stop.lng,
        );
        if (dist <= stop.radius) {
          speak(stop);
          break; // one stop per position update, don't stack triggers
        }
      }
    },
    [speak],
  );

  const startTour = useCallback(() => {
    unlockAudioContext(); // fixed: real user gesture, unlock happens here
    setIsActive(true);
    setGpsStatus("searching");

    if (!("geolocation" in navigator)) {
      setGpsStatus("unavailable");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      processProximity,
      (err) => {
        console.warn("Geolocation error:", err);
        setGpsStatus("unavailable");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    );
  }, [unlockAudioContext, processProximity]);

  const endTour = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsActive(false);
    setGpsStatus("idle");
  }, []);

  // Cleanup on unmount too, not just on explicit endTour() — otherwise
  // navigating away from this page mid-tour leaves GPS polling forever.
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return {
    isActive,
    playedStopIds,
    currentStopId,
    gpsStatus,
    startTour,
    endTour,
    playManual,
  };
}
