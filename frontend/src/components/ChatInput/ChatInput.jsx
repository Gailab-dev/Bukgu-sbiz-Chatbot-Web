import { useState } from "react";
import sendIcon from "../../assets/send.svg";
import styles from "../ChatInput/ChatInput.module.css";

export default function ChatInput({ value, onChange, onSend }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSend) {
            onSend(e);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.inputbar}>
            <input className={styles.inputbar_field}
            placeholder="메시지를 입력하세요"
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyPress}
            />
            <img
                className={styles.inputbar_icon}
                src={sendIcon}
                alt="전송아이콘"
                onClick={handleSubmit}
            />
        </form>

    );
}
