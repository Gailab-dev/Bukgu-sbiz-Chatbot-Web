import axios from "axios";

// ✅ .env에서 자동으로 환경에 맞는 URL 불러오기
const baseURL = `${import.meta.env.VITE_SBIZ_URL}/api`;

const api = axios.create({
  baseURL,
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