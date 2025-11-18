import React from "react";
import Business from "../../assets/Business.svg";
import Platform from "../../assets/Platform.svg";
import Question from "../../assets/Question.svg";
import styles from './QuickMenu.module.css';

export default function QuickMenu({ isOpen, onToggle, onMenuClick }) {
  return (
    <div className={`${styles.buttonBox} ${isOpen ? styles.open : styles.closed}`}>
      {/* 상단 토글 핸들 */}
      <div
        onClick={onToggle}
        className={styles.toggleHandle}
      ></div>

      {/* 버튼 리스트 */}
      <div className={`${styles.buttonList} ${isOpen ? styles.open : styles.closed}`}>
        <button
          type="button"
          onClick={(e) => onMenuClick("program", e)}
          className={styles.menuBtn}
        >
          <img src={Business} alt="지원사업" className={styles.menuIcon} />
          소상공인 지원사업
        </button>
        <button
          type="button"
          onClick={(e) => onMenuClick("guide", e)}
          className={styles.menuBtn}
        >
          <img src={Platform} alt="플랫폼" className={styles.menuIcon} />
          플랫폼 기능 안내
        </button>
        <button
          type="button"
          onClick={(e) => onMenuClick("faq", e)}
          className={styles.menuBtn}
        >
          <img src={Question} alt="FAQ" className={styles.menuIcon} />
          자주 묻는 질문
        </button>
      </div>
    </div>
  );
}