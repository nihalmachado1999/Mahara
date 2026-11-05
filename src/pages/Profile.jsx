import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M9 7V4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V7M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        navigate("/login");
        return;
      }

      if (!isMounted) return;
      setUser(currentUser);

      const { data, error: fetchError } = await supabase
        .from("saved_itineraries")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setTrips(data || []);
      }
      setLoading(false);
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  function handleViewTrip(trip) {
    navigate("/plan", { state: { loadedItinerary: trip.itinerary } });
  }

  async function handleConfirmDelete(id) {
    setDeletingId(id);
    const { error: deleteError } = await supabase
      .from("saved_itineraries")
      .delete()
      .eq("id", id);
    setDeletingId(null);
    setConfirmingDeleteId(null);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }

  const displayName = user?.user_metadata?.full_name || user?.email;

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh", background: "#FAF6EF" }}>
        <p className="font-body" style={{ color: "#4A4038" }}>Loading your profile…</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#FAF6EF", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&family=DM+Sans:wght@300;400;500&family=Space+Grotesk:wght@500;600&display=swap');
        .font-heading { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
        .font-label { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="font-label mb-2" style={{ fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9B1B30" }}>
          Your Account
        </div>
        <div className="flex items-start justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="font-heading font-extrabold text-3xl mb-1" style={{ color: "#1A1410" }}>
              Welcome back{displayName ? `, ${displayName}` : ""}
            </h1>
            <p className="font-body" style={{ color: "#4A4038", fontSize: "0.9rem" }}>
              {user?.email}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="font-label px-4 py-2 rounded-lg border"
            style={{ borderColor: "#1A1410", color: "#1A1410", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            Log Out
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-[8px]" style={{ background: "#F4DCDF", color: "#6E1322" }}>
            <span className="font-body" style={{ fontSize: "0.85rem" }}>{error}</span>
          </div>
        )}

        <div className="font-label mb-4" style={{ fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#B8924A" }}>
          Your Saved Trips
        </div>

        {trips.length === 0 ? (
          <div
            className="p-8 rounded-[8px] border text-center"
            style={{ borderColor: "rgba(26,20,16,0.1)", background: "#ffffffaa" }}
          >
            <h3 className="font-heading font-bold text-lg mb-2" style={{ color: "#1A1410" }}>
              No saved trips yet
            </h3>
            <p className="font-body mb-4" style={{ color: "#4A4038", fontSize: "0.88rem" }}>
              Build an itinerary and save it to see it here.
            </p>
            <button
              type="button"
              onClick={() => navigate("/plan")}
              className="font-label px-5 py-2.5 rounded-full"
              style={{ background: "#9B1B30", color: "#FAF6EF", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Plan a Trip
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => {
              const itinerary = trip.itinerary || {};
              const dayCount = Array.isArray(itinerary.days) ? itinerary.days.length : 0;
              return (
                <div
                  key={trip.id}
                  className="p-5 rounded-[8px] border flex items-start justify-between gap-4 flex-wrap"
                  style={{ borderColor: "rgba(26,20,16,0.1)", background: "#ffffffaa" }}
                >
                  <div style={{ minWidth: "200px", flex: 1 }}>
                    <h3 className="font-heading font-bold text-base mb-1" style={{ color: "#1A1410" }}>
                      {itinerary.destination || "Bahrain"} — {dayCount} {dayCount === 1 ? "day" : "days"}
                    </h3>
                    {itinerary.summary && (
                      <p className="font-body mb-1" style={{ color: "#4A4038", fontSize: "0.85rem" }}>
                        {itinerary.summary}
                      </p>
                    )}
                    <p className="font-label" style={{ color: "rgba(26,20,16,0.4)", fontSize: "0.68rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      Saved {formatDate(trip.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleViewTrip(trip)}
                      className="font-label"
                      style={{ color: "#9B1B30", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
                    >
                      View
                    </button>

                    {confirmingDeleteId === trip.id ? (
                      <div className="flex items-center gap-2">
                        <span className="font-body" style={{ fontSize: "0.78rem", color: "#4A4038" }}>Delete?</span>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(trip.id)}
                          disabled={deletingId === trip.id}
                          className="font-label"
                          style={{ color: "#9B1B30", fontSize: "0.72rem", fontWeight: 600 }}
                        >
                          {deletingId === trip.id ? "..." : "Yes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(null)}
                          className="font-label"
                          style={{ color: "#4A4038", fontSize: "0.72rem" }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(trip.id)}
                        aria-label="Delete trip"
                        style={{ color: "rgba(26,20,16,0.4)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#9B1B30")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(26,20,16,0.4)")}
                      >
                        <IconTrash />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}