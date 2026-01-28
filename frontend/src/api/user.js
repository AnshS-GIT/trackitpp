import api from "./axios";

export const fetchUsers = async () => {
  const res = await api.get("/users");
  return res.data.data;
};
