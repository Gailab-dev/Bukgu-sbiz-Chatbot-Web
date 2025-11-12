import React, { useState } from "react";
import { login } from "../api/authApi";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await login(loginId, password);

    if (res.success) {
      alert("로그인 성공!");
      navigate("/main"); // 로그인 성공 시 메인 이동
    } else {
      setMessage(res.message);
    }
  };

  // 로그인 없이 챗봇 열기
  const openChatbot = () => {
    window.open(
      "/chat",
      "chatbotWindow",
      "width=500,height=700,scrollbars=no,resizable=no"
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>로그인</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="아이디"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.loginButton}>
          로그인
        </button>
      </form>

      {message && <p style={styles.error}>{message}</p>}

      <button onClick={openChatbot} style={styles.chatbotButton}>
        💬 챗봇 열기
      </button>
    </div>
  );
}

const styles = {
  container: {
    width: "400px",
    margin: "100px auto",
    textAlign: "center",
    border: "1px solid #ccc",
    borderRadius: "12px",
    padding: "40px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  title: { marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "16px",
  },
  loginButton: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  chatbotButton: {
    marginTop: "30px",
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  error: { color: "red", marginTop: "10px" },
};