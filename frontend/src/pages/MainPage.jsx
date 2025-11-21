import React, { useEffect, useState } from "react";
import { checkSession, logout } from "../api/authApi";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 페이지 진입 시 세션 확인
  useEffect(() => {
    (async () => {
      try {
        const res = await checkSession();
        if (res.loggedIn) {
          setUsername(res.username);
        } else {
          alert("로그인이 필요합니다.");
          navigate("/");
        }
      } catch (err) {
        console.error("세션 확인 실패:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  // 로그아웃 기능
  const handleLogout = async () => {
    await logout();
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  // 챗봇 새 창 열기 (로그인 세션 유지)
  const openChatbotWindow = () => {
    window.open(
      "/chat",
      "chatbotWindow",
      "width=450,height=700,scrollbars=no,resizable=no"
    );
  };

  if (loading) return <p style={styles.loading}>로딩 중...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.welcome}>안녕하세요, {username}님 👋</h2>
      <p style={styles.text}>현재 로그인 세션이 유지되고 있습니다.</p>

      <div style={styles.buttonGroup}>
        <button onClick={openChatbotWindow} style={styles.chatButton}>
          💬 챗봇 열기
        </button>
        <button onClick={handleLogout} style={styles.logoutButton}>
          로그아웃
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "400px",
    margin: "150px auto",
    textAlign: "center",
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "30px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
  },
  welcome: {
    marginBottom: "10px",
    color: "#333",
  },
  text: {
    marginBottom: "20px",
    color: "#666",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
  },
  chatButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  logoutButton: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
    marginTop: "200px",
    color: "#666",
  },
};
