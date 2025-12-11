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
  }, [messages, isMenuOpen]);

  // 날짜 포맷팅 함수 (오늘, 어제, 날짜)
  const formatDate = (dateString) => {
    const msgDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 날짜만 비교 (시간 제거)
    const isSameDay = (d1, d2) => {
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    };

    if (isSameDay(msgDate, today)) return "오늘";

    // YY.MM.DD
    return `${msgDate.getFullYear()}. ${msgDate.getMonth() + 1}. ${msgDate.getDate()}.`;
  };

  // 날짜 구분선이 필요한지 확인
  const shouldShowDateSeparator = (currentMsg, prevMsg) => {
    if (!prevMsg) return true; 

    const currentDate = new Date(currentMsg.timestamp || new Date());
    const prevDate = new Date(prevMsg.timestamp || new Date());

    // 날짜가 다르면 구분선 표시
    return (
      currentDate.getFullYear() !== prevDate.getFullYear() ||
      currentDate.getMonth() !== prevDate.getMonth() ||
      currentDate.getDate() !== prevDate.getDate()
    );
  };

  return (
    // 대화창
    <div
      ref={chatBoxRef}
      id="chatBox"
      className={styles.chatBox}
      style={{
        paddingBottom: isMenuOpen ? "80px" : "30px",
      }}
    >
      {/* 대화 내용 */}
      {messages.map((msg, idx) => {
        // 이전 메시지가 봇 메시지인지 확인
        const prevMsg = idx > 0 ? messages[idx - 1] : null;
        const showAvatar = msg.from === "bot" && (!prevMsg || prevMsg.from !== "bot");
        const showDate = shouldShowDateSeparator(msg, prevMsg);

        return (
          <div key={idx}>
            {/* 날짜 구분선 */}
            {showDate && (
              <div className={styles.dateSeparator}>
                {formatDate(msg.timestamp || new Date())}
              </div>
            )}

            {/* 메시지 */}
            <Message
              message={msg}
              showAvatar={showAvatar}
              onSubButtonClick={onSubButtonClick}
              toggleCategory={toggleCategory}
              selectedCategories={selectedCategories}
              showCategorySelect={showCategorySelect}
              onCategorySubmit={onCategorySubmit}
            />
          </div>
        );
      })}
    </div>
  );
}
