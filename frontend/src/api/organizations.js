import api from "./axios";

export const getMyOrganizations = async () => {
    const res = await api.get("/users/me/organizations");
    return res.data;
};

export const createOrganization = async (name, visibility = "PUBLIC") => {
  const res = await api.post("/organizations", { name, visibility });
  return res.data;
};

export const generateInviteCode = async (orgId) => {
  const res = await api.post(`/organizations/${orgId}/invite-code`);
  return res.data;
};

export const joinOrganization = async (code) => {
  const res = await api.post("/organizations/join", { code });
  return res.data;
};
