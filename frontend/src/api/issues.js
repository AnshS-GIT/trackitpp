import api from "./axios";

export const fetchIssues = async () => {
  const res = await api.get("/issues");
  return res.data.data;
};
