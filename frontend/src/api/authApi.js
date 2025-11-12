import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/auth",
  withCredentials: true, // 세션 쿠키 유지
});

export const login = async (loginId, password) => {
  const res = await api.post("/login", { loginId, password });
  return res.data;
};

export const checkSession = async () => {
  const res = await api.get("/session");
  return res.data;
};

export const logout = async () => {
  const res = await api.post("/logout");
  return res.data;
};