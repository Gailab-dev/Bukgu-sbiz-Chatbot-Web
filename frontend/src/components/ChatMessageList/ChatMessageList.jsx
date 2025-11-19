import { useEffect, useRef } from "react";
import Message from "../Message/Message";
import styles from "./ChatMessageList.module.css";

export default function ChatMessageList({
  messages,
  onSubButtonClick,
  toggleCategory,
  selectedCategories,
  showCategorySelect,
  onCategorySubmit,
  isMenuOpen,
}) {
  const chatBoxRef = useRef(null);

  // 자동 스크롤
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    // 대화창
    <div
      ref={chatBoxRef}
      id="chatBox"
      className={styles.chatBox}
      style={{
        paddingBottom: isMenuOpen ? "170px" : "50px",
      }}
    >
      {/* 대화 내용 */}
      {messages.map((msg, idx) => {
        // 이전 메시지가 봇 메시지인지 확인
        const prevMsg = idx > 0 ? messages[idx - 1] : null;
        const showAvatar = msg.from === "bot" && (!prevMsg || prevMsg.from !== "bot");

        return (
          <Message
            key={idx}
            message={msg}
            showAvatar={showAvatar}
            onSubButtonClick={onSubButtonClick}
            toggleCategory={toggleCategory}
            selectedCategories={selectedCategories}
            showCategorySelect={showCategorySelect}
            onCategorySubmit={onCategorySubmit}
          />
        );
      })}
    </div>
  );
}
