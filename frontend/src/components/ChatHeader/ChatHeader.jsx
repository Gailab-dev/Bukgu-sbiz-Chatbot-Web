import styles from './ChatHeader.module.css';

export default function ChatHeader({ username, onLoginClick }) {
  return (
    <header className={styles.header}>
      <div className={styles.header_title}>소상공인 지원 챗봇</div>
      <div className={styles.header_spacer} />
      <nav className={styles.header_right}>
        {username ? (
          <span className={styles.header_nick}>{username}님</span>
        ) : (
          <button
            className={styles.header_login}
            onClick={onLoginClick}
          >
            로그인
          </button>
        )}
      </nav>
    </header>
  );
}
