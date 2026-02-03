import api from "./axios";

export const fetchIssues = async () => {
  const activeOrgId = localStorage.getItem("activeOrgId");
  if (!activeOrgId) return [];
  const res = await api.get("/issues", {
    headers: { "X-Organization-Id": activeOrgId },
  });
  return res.data.data;
};

export const updateIssueStatus = async (issueId, status) => {
  const res = await api.patch(`/issues/${issueId}/status`, { status });
  return res.data.data;
};

export const assignIssue = async (issueId, assigneeId) => {
  const res = await api.patch(`/issues/${issueId}/assign`, {
    assigneeId,
  });
  return res.data.data;
};

export const requestAssignment = async (issueId) => {
  const res = await api.post(`/issues/${issueId}/request-assignment`);
  return res.data;
};
