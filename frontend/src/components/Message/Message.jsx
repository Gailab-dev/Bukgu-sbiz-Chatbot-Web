import botIcon from "../../assets/bot.svg";
import TypingIndicator from "../TypingIndicator/TypingIndicator";
import styles from './Message.module.css';

export default function Message({
  message,
  showAvatar = true,
  onSubButtonClick,
  toggleCategory,
  selectedCategories,
  showCategorySelect,
  onCategorySubmit,
}) {
  const { from, text, time, subButtons, categoryButtons, isTyping } = message;
  const isUser = from === "user";

  // 타이핑 애니메이션을 표시하는 경우
  if (isTyping) {
    return <TypingIndicator />;
  }

  // "처음으로", "더보기" 버튼과 일반 버튼 분리
  const specialButtons = ["처음으로", "더보기"];
  const normalButtons = subButtons?.filter(btn => {
    const btnText = typeof btn === "string" ? btn : btn.title;
    return !specialButtons.includes(btnText);
  });
  const actionButtons = subButtons?.filter(btn => {
    const btnText = typeof btn === "string" ? btn : btn.title;
    return specialButtons.includes(btnText);
  });

  // 사용자 메시지 렌더링
  if (isUser) {
    return (
      <div className={`${styles.msg} ${styles.user}`}>
        <div className="content">
          <div className={styles.bubble}>
            {text && <div className={styles.text}>{text}</div>}
          </div>
          {time && <div className={styles.time}>{time}</div>}
        </div>
      </div>
    );
  }

  // 봇 메시지 렌더링
  return (
    <div className={`${styles.msg} ${styles.bot}`}>
      <div className={styles.botSection}>
        {/* 아이콘과 이름을 가로로 배치 (첫 메시지일 때만) */}
        {showAvatar && (
          <div className={styles.botHeader}>
            <img className={styles.avatar} src={botIcon} alt="소상공인 지원 챗봇" />
            <span className={styles.botName}>소상공인 지원 챗봇</span>
          </div>
        )}

        {/* bubble들은 아이콘 아래에 배치 */}
        <div className={styles.botContent}>
          {/* text가 있거나, normalButtons가 있거나, categoryButtons가 있을 때만 bubble 렌더링 */}
          {(text || (normalButtons && normalButtons.length > 0) || (categoryButtons && showCategorySelect)) && (
            <div className={styles.bubble}>
              {text && <div className={styles.text}>{text}</div>}

              {/* 일반 하위 버튼 (지원사업 추천 등) */}
              {normalButtons && normalButtons.length > 0 && (
                <div className={styles.subButtonBox}>
                  {normalButtons.map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (btn.onClick) {
                          btn.onClick();
                        } else if (typeof btn === "string") {
                          onSubButtonClick(btn);
                        } else if (btn.link) {
                          window.open(btn.link, "_blank");
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
          )}

          {/* 처음으로, 더보기 버튼 (bubble 밖에서 독립적으로 렌더링) */}
          {actionButtons && actionButtons.length > 0 && (
            <div className={styles.actionButtonBox}>
              {actionButtons.map((btn, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (btn.onClick) {
                      btn.onClick();
                    } else if (typeof btn === "string") {
                      onSubButtonClick(btn);
                    } else if (btn.link) {
                      window.open(btn.link, "_blank");
                    }
                  }}
                  className={styles.actionButton}
                >
                  {typeof btn === "string" ? btn : btn.title}
                </button>
              ))}
            </div>
          )}

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
    </div>
  );
}
