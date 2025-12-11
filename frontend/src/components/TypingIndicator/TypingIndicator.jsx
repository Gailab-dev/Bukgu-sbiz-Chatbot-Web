import React from "react";
import styles from "./TypingIndicator.module.css";

export default function TypingIndicator() {
  return (
    <div className={styles.botMsgBox}>
      <div className={styles.botProfile}></div>
      <div className={styles.typingBubble}>
        <div className={styles.typingDots}>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
      </div>
    </div>
  );
}