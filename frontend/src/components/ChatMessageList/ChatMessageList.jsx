import { useEffect, useRef } from "react";
import Message from "../Message/Message";

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
      style={{
        ...styles.chatBox,
        paddingBottom: isMenuOpen ? "170px" : "50px",
        transition: "padding-bottom 0.3s ease",
      }}
    >
      {/* 대화 내용 */}
      {messages.map((msg, idx) => (
        <Message
          key={idx}
          message={msg}
          onSubButtonClick={onSubButtonClick}
          toggleCategory={toggleCategory}
          selectedCategories={selectedCategories}
          showCategorySelect={showCategorySelect}
          onCategorySubmit={onCategorySubmit}
        />
      ))}
    </div>
  );
}

const styles = {
  chatBox: {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    transition: "padding-bottom 0.3s ease",
  },
};