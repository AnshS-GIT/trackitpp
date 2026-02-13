import api from "./axios";

export const getMyInvitations = async () => {
  const res = await api.get("/invitations/me");
  return res.data;
};

export const acceptInvitation = async (id) => {
  const res = await api.post(`/invitations/${id}/accept`);
  return res.data;
};

export const declineInvitation = async (id) => {
  const res = await api.post(`/invitations/${id}/decline`);
  return res.data;
};
