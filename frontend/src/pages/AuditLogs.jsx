import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { fetchAuditLogs } from "../api/auditLogs";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [entityFilter, setEntityFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await fetchAuditLogs();
        setLogs(data);
      } catch {
        setError("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (entityFilter !== "ALL" && log.entityType !== entityFilter) return false;
    if (actionFilter !== "ALL" && log.action !== actionFilter) return false;
    return true;
  });

  return (
    <AdminLayout>
      <h1>Audit Logs</h1>

      {/* Filters */}
      <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
        >
          <option value="ALL">All Entities</option>
          <option value="ISSUE">ISSUE</option>
          <option value="USER">USER</option>
        </select>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="ALL">All Actions</option>
          <option value="ISSUE_CREATED">ISSUE_CREATED</option>
          <option value="ISSUE_ASSIGNED">ISSUE_ASSIGNED</option>
          <option value="ISSUE_STATUS_UPDATED">ISSUE_STATUS_UPDATED</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && filteredLogs.length === 0 && (
        <p>No audit logs found for selected filters.</p>
      )}

      {!loading && !error && filteredLogs.length > 0 && (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Action</th>
              <th>Entity</th>
              <th>Performed By</th>
              <th>Old Value</th>
              <th>New Value</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log._id}>
                <td>{log.action}</td>
                <td>{log.entityType}</td>
                <td>{log.performedBy?.name || "-"}</td>
                <td>
                  <pre style={{ maxWidth: "200px", overflow: "auto" }}>
                    {JSON.stringify(log.oldValue, null, 2)}
                  </pre>
                </td>
                <td>
                  <pre style={{ maxWidth: "200px", overflow: "auto" }}>
                    {JSON.stringify(log.newValue, null, 2)}
                  </pre>
                </td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
