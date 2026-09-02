export default function Stories() {
  return (
    <div className="min-h-full w-full flex items-center justify-center" style={{ background: "#FAF6EF", minHeight: "60vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@400&display=swap');
      `}</style>
      <div className="text-center px-6">
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#B8924A",
            marginBottom: "0.75rem",
          }}
        >
          Coming Soon
        </div>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2.5rem",
            color: "#1A1410",
            marginBottom: "0.75rem",
          }}
        >
          Stories & Guides
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(26,20,16,0.6)", fontSize: "0.95rem" }}>
          Real stories from Bahrain, written for travelers — landing here soon.
        </p>
      </div>
    </div>
  );
}
