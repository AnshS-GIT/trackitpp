import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { fetchIssues, updateIssueStatus, assignIssue } from "../api/issues";
import { fetchUsers } from "../api/users";
import { getUser } from "../utils/auth";

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = getUser();
        setCurrentUser(user);

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

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-amber-100 text-amber-800",
      RESOLVED: "bg-green-100 text-green-800",
      CLOSED: "bg-slate-100 text-slate-800",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"
          }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      HIGH: "bg-red-100 text-red-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      LOW: "bg-green-100 text-green-800",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[priority] || "bg-gray-100 text-gray-800"
          }`}
      >
        {priority}
      </span>
    );
  };

  const isManagerOrAdmin = currentUser && ["MANAGER", "ADMIN"].includes(currentUser.role);
  // Engineers can update status but cannot CLOSE
  const canClose = isManagerOrAdmin;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Issues Management</h1>

          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm shadow-sm border"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm shadow-sm border"
            >
              <option value="ALL">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        {loading && <p className="text-gray-500">Loading issues...</p>}
        {error && <p className="text-red-600 font-medium">{error}</p>}

        {!loading && !error && filteredIssues.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No issues found matching your filters.</p>
          </div>
        )}

        {!loading && !error && filteredIssues.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign To</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredIssues.map((issue) => (
                    <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {issue.title}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(issue.status)}
                          <select
                            value={issue.status}
                            disabled={issue.status === "CLOSED"}
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
                            className="ml-2 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs py-1 disabled:opacity-50"
                          >
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Prog</option>
                            <option value="RESOLVED">Resolved</option>
                            {canClose && <option value="CLOSED">Closed</option>}
                            {!canClose && issue.status === "CLOSED" && <option value="CLOSED">Closed</option>}
                          </select>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(issue.priority)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {issue.createdBy?.name || "Unknown"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isManagerOrAdmin ? (
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
                            className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs py-1"
                          >
                            <option value="">Unassigned</option>
                            {users.map((u) => (
                              <option key={u._id} value={u._id}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-500">
                            {issue.assignedTo?.name || "Unassigned"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
