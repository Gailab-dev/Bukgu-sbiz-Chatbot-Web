import React from "react";
import botIcon from "../../assets/bot.svg";
import styles from './Message.module.css';

export default function Message({
  message,
  onSubButtonClick,
  toggleCategory,
  selectedCategories,
  showCategorySelect,
  onCategorySubmit,
}) {
  const { from, text, time, subButtons, categoryButtons } = message;
  const isUser = from === "user";

  return (
    <div className={`${styles.msg} ${isUser ? styles.user : styles.bot}`}>
      {!isUser && (
        <img className={styles.avatar} src={botIcon} alt="소상공인 지원 챗봇" />
      )}

      <div className="content">
        <div className={styles.bubble}>
          <div className={styles.text}>{text}</div>

          {/* 일반 하위 버튼 (지원사업 추천, 더보기 등) */}
          {subButtons && (
            <div style={inlineStyles.subButtonBox}>
              {subButtons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (typeof btn === "string") onSubButtonClick(btn);
                    else window.open(btn.link, "_blank");
                  }}
                  style={inlineStyles.subButton}
                >
                  {typeof btn === "string" ? btn : btn.title}
                </button>
              ))}
            </div>
          )}

          {/* 카테고리 선택창 (광주광역시 지원사업 / 일반 지원사업) */}
          {categoryButtons && showCategorySelect && (
            <div style={inlineStyles.categoryBox}>
              {categoryButtons.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleCategory(cat)}
                  style={{
                    ...inlineStyles.categoryBtn,
                    backgroundColor: selectedCategories.includes(cat)
                      ? "#1E88E5"
                      : "#fff",
                    color: selectedCategories.includes(cat) ? "#fff" : "#1E88E5",
                  }}
                >
                  {cat}
                </button>
              ))}

              {/* 선택 완료 버튼 */}
              <button
                onClick={onCategorySubmit}
                style={{
                  ...inlineStyles.submitBtn,
                  opacity: selectedCategories.length >= 1 ? 1 : 0.5,
                  cursor:
                    selectedCategories.length >= 1 ? "pointer" : "not-allowed",
                }}
                disabled={selectedCategories.length < 1}
              >
                선택 완료
              </button>
            </div>
          )}
        </div>
        {time && <div className={styles.time}>{time}</div>}
      </div>
    </div>
  );
}

// 인라인 스타일 (버튼들용)
const inlineStyles = {
  subButtonBox: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "10px",
  },
  subButton: {
    backgroundColor: "#f5f7fb",
    border: "1px solid #cfd8dc",
    borderRadius: "12px",
    padding: "6px 10px",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "13px",
  },
  categoryBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
    justifyContent: "center",
  },
  categoryBtn: {
    border: "1px solid #1E88E5",
    borderRadius: "20px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "13px",
    transition: "0.2s",
  },
  submitBtn: {
    marginTop: "10px",
    backgroundColor: "#1E88E5",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "8px 16px",
    fontSize: "13px",
  },
};