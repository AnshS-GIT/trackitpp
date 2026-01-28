import { Link } from "react-router-dom";

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          background: "#1f2937",
          color: "#fff",
          padding: "20px",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>TrackIT++</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link to="/" style={{ color: "#fff" }}>Dashboard</Link>
          <Link to="/issues" style={{ color: "#fff" }}>Issues</Link>
          <Link to="/audit-logs" style={{ color: "#fff" }}>Audit Logs</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "20px" }}>
        {children}
      </main>
    </div>
  );
}
