import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { fetchIssues } from "../api/issues";
import { updateIssueStatus } from "../api/issues";

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const data = await fetchIssues();
        setIssues(data);
      } catch {
        setError("Failed to load issues");
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, []);

  return (
    <AdminLayout>
      <h1>Issues</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created By</th>
              <th>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue._id}>
                <td>{issue.title}</td>
                <td>
                  <select
                    value={issue.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;

                      try {
                        await updateIssueStatus(issue._id, newStatus);

                        setIssues((prev) =>
                          prev.map((i) =>
                            i._id === issue._id
                              ? { ...i, status: newStatus }
                              : i
                          )
                        );
                      } catch {
                        alert("Status update failed");
                      }
                    }}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </td>
                <td>{issue.priority}</td>
                <td>{issue.createdBy?.name}</td>
                <td>{issue.assignedTo?.name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
