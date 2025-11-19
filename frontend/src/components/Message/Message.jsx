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
            <div className={styles.subButtonBox}>
              {subButtons.map((btn, idx) => (
                <button
                  key={idx}
                  type="button" // ✅ form submit 방지
                  onClick={(e) => {
                    e.preventDefault(); // ✅ 기본 동작 방지
                    if (btn.onClick) {
                      btn.onClick(); // ✅ handleFeatureClick 실행
                    } else if (typeof btn === "string") {
                      onSubButtonClick(btn);
                    } else if (btn.link) {
                      window.open(btn.link, "_blank"); // ✅ 외부 링크만 새 창으로
                    }
                  }}
                  className={styles.subButton}
                >
                  {typeof btn === "string" ? btn : btn.title}
                </button>
              ))}
            </div>
          )}

          {/* 카테고리 선택창 (광주광역시 지원사업 / 일반 지원사업) */}
          {categoryButtons && showCategorySelect && (
            <div className={styles.categoryBox}>
              {categoryButtons.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleCategory(cat)}
                  className={styles.categoryBtn}
                  style={{
                    backgroundColor: selectedCategories.includes(cat)
                      ? "#4160B6"
                      : "#fff",
                    color: selectedCategories.includes(cat) ? "#fff" : "#333333",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 선택 완료 버튼 */}
        {categoryButtons && showCategorySelect && (
          <button
            onClick={onCategorySubmit}
            className={styles.submitBtn}
            style={{
              opacity: selectedCategories.length >= 1 ? 1 : 0.5,
              cursor:
                selectedCategories.length >= 1 ? "pointer" : "not-allowed",
            }}
            disabled={selectedCategories.length < 1}
          >
          선택 완료
          </button>
        )}
        {time && <div className={styles.time}>{time}</div>}
      </div>
    </div>
  );
}

