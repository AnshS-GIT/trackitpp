import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { fetchAuditLogs } from "../api/auditLogs";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <AdminLayout>
      <h1>Audit Logs</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
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
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{log.action}</td>
                <td>{log.entityType}</td>
                <td>{log.performedBy?.name}</td>
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
