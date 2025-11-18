import React from "react";

export default function TypingIndicator() {
  return (
    <div style={styles.botMsgBox}>
      <div style={styles.botProfile}>🤖</div>
      <div style={styles.typingBubble}>
        <div style={styles.typingDots}>
          <span style={styles.dot}></span>
          <span style={styles.dot}></span>
          <span style={styles.dot}></span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  botMsgBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  },
  botProfile: {
    fontSize: "22px",
    lineHeight: "30px",
  },
  typingBubble: {
    backgroundColor: "#fff",
    padding: "10px 15px",
    borderRadius: "15px",
    border: "1px solid #ddd",
  },
  typingDots: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#90A4AE",
    animation: "typing 1.4s infinite",
  },
};