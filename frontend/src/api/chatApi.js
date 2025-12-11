import axios from "axios";

const BASE_URL = "/api/chat";

// ??CUI 입력
export async function sendMessage(text) {
  const res = await axios.post(`${BASE_URL}/message`, { text });
  return res.data;
}

// ??GUI 버튼 클릭
export async function callService(type, payload = {}) {
  const res = await axios.post(`${BASE_URL}/service`, { type, payload });
  return res.data;
}
