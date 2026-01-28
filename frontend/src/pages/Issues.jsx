import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { fetchIssues, updateIssueStatus, assignIssue } from "../api/issues";
import { fetchUsers } from "../api/users";

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  useEffect(() => {
    const loadData = async () => {
      try {
        const issuesData = await fetchIssues();
        setIssues(issuesData);

        const usersData = await fetchUsers();
        setUsers(usersData.filter((u) => u.role === "ENGINEER"));
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredIssues = issues.filter((issue) => {
    if (statusFilter !== "ALL" && issue.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && issue.priority !== priorityFilter)
      return false;
    return true;
  });

  return (
    <AdminLayout>
      <h1>Issues</h1>

      {/* Filters */}
      <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="ALL">All Priority</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created By</th>
              <th>Assign To</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map((issue) => (
              <tr key={issue._id}>
                <td>{issue.title}</td>

                {/* Status */}
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

                {/* Assignment */}
                <td>
                  <select
                    value={issue.assignedTo?._id || ""}
                    onChange={async (e) => {
                      const assigneeId = e.target.value;
                      try {
                        await assignIssue(issue._id, assigneeId);
                        setIssues((prev) =>
                          prev.map((i) =>
                            i._id === issue._id
                              ? {
                                  ...i,
                                  assignedTo: users.find(
                                    (u) => u._id === assigneeId
                                  ),
                                }
                              : i
                          )
                        );
                      } catch {
                        alert("Assignment failed");
                      }
                    }}
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
