import api from "./axios";

export const fetchIssues = async (page = 1, limit = 10) => {
  const activeOrgId = localStorage.getItem("activeOrgId");
  if (!activeOrgId) return { data: [], pagination: {} };
  const res = await api.get(`/issues?page=${page}&limit=${limit}`, {
    headers: { "X-Organization-Id": activeOrgId },
  });
  return res.data; // { data, pagination }
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

export const createIssue = async (issueData) => {
  const activeOrgId = localStorage.getItem("activeOrgId");
  if (!activeOrgId) {
    throw new Error("No active organization selected");
  }
  const res = await api.post("/issues", issueData, {
    headers: { "X-Organization-Id": activeOrgId },
  });
  return res.data.data;
};
