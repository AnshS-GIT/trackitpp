import api from "./axios";

export const getMyContributionStats = async () => {
  const res = await api.get("/contributions/stats/me");
  return res.data.data;
};
