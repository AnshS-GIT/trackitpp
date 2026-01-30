import { jwtDecode } from "jwt-decode";

export const getToken = () => localStorage.getItem("token");

export const isAuthenticated = () => !!getToken();

export const getUser = () => {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
