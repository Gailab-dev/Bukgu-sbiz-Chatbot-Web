import { useState, useEffect } from "react";
import axios from "axios";
import { sendMessage, callService } from "../api/chatApi";
import ChatHeader from "../components/ChatHeader/ChatHeader";
import ChatMessageList from "../components/ChatMessageList/ChatMessageList";
import QuickMenu from "../components/QuickMenu/QuickMenu";
import ChatInput from "../components/ChatInput/ChatInput";

export default function ChatPage() {
  /* -----------------------------------------------------
  1. 상태(State) 정의
  ----------------------------------------------------- */
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "안녕하세요 고객님.\n북구청 소상공인 지원 챗봇입니다.\n궁금한 내용을 직접 입력하시거나\n아래 버튼에서 선택해 주세요.",
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
    },
  ]);
  const [username, setUsername] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [remainingPrograms, setRemainingPrograms] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("광주");

  const categories = ["금융", "내수", "경영", "전체"];

  // 현재 시간 가져오기 (HH:MM 형식, 24시간)
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  /* -----------------------------------------------------
  2. 로그인 여부 세션 확인 (최초 1회)
  ----------------------------------------------------- */
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/auth/session", { withCredentials: true })
      .then((res) => {
        if (res.data.loggedIn) setUsername(res.data.username);
        else setUsername(null);
      })
      .catch(() => setUsername(null));
  }, []);

  /* -----------------------------------------------------
  3. 로그인 버튼 클릭 시 동작
  ----------------------------------------------------- */
  const handleLoginButton = () => {
    if (!username) {
      window.open("http://localhost:8080", "_blank");
      window.close();
    } else {
      alert("이미 로그인되어 있습니다.");
    }
  };

  /* -----------------------------------------------------
  4. 텍스트 입력(CUI) 후 전송 버튼 클릭 시 동작
  ----------------------------------------------------- */
  const handleSend = async (e) => {
    setIsMenuOpen(false);
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: input, time: getCurrentTime() }]);

    try {
      const res = await sendMessage(input);

      setMessages((prev) => [
        ...prev,
        { from: "bot", text: res.message || JSON.stringify(res), time: getCurrentTime() },
      ]);
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "죄송합니다. 서버와의 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.", time: getCurrentTime() },
      ]);
    }

    setInput("");
  };

  /* -----------------------------------------------------
  5. GUI 버튼 클릭 시 동작
  ----------------------------------------------------- */
  const handleClick = async (type, e) => {
    if (e) e.preventDefault();

    const labelMap = {
      program: "소상공인 지원사업",
      guide: "플랫폼 기능 안내",
      faq: "자주 묻는 질문",
    };

    setMessages((prev) => [
      ...prev,
      { from: "user", text: labelMap[type] || `[${type}] 선택` },
    ]);

    if (type === "program") {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "지원사업 중 원하시는 것을 선택해주세요:",
          subButtons: [
            "지원사업 추천",
            "북구청 지원사업",
            "광주광역시 지원사업",
            "일반 지원사업",
          ],
        },
      ]);
      return;
    }

    if (type === "guide") {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "플랫폼의 어떤 기능에 대해 알고 싶으신가요?",
          subButtons: [
            "회원가입 및 로그인",
            "마이페이지 기능",
            "사업 검색 및 신청",
          ],
        },
        {
          from: "bot",
          text: "그 외 다른 기능이 궁금하다면 저에게 물어보세요!",
        },
      ]);
      return;
    }

    const res = await callService(type);
    setMessages((prev) => [
      ...prev,
      { from: "bot", text: res.message || JSON.stringify(res) },
    ]);
  };

  /* -----------------------------------------------------
  6. "소상공인 지원사업" 하위 버튼 클릭 시 동작
  ----------------------------------------------------- */
  const handleSubButton = async (label) => {
    setMessages((prev) => [...prev, { from: "user", text: `${label}` }]);

    /* 6-1. 지원사업 추천 */
    if (label === "지원사업 추천") {
      try {
        const res = await axios.post(
          "http://localhost:8080/api/chatbot/recommend-programs",
          {},
          { withCredentials: true }
        );

        if (!res.data.loggedIn) {
          setMessages((prev) => [
            ...prev,
            { from: "bot", text: res.data.message },
          ]);
          return;
        }

        const programs = res?.data?.data?.program_list ?? [];

        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "회원님께 추천드리는 지원사업입니다:",
            subButtons: programs.map((p) => ({
              title: p.title,
              link: p.link,
            })),
          },
          {
            from: "bot",
            text: "궁금하신 사업을 선택하시면, 상세 안내 도와드리겠습니다. 그 외 다른 사업이 궁금하시다면, 홈페이지를 참고해주세요.",
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "추천 정보를 불러오지 못했습니다." },
        ]);
      }
    }

    /* 6-2. 광주광역시 지원사업 */
    if (label === "광주광역시 지원사업") {
      setShowCategorySelect(true);
      setSelectedCategories([]);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "원하시는 지원사업 분야를 선택해주세요. (복수 선택 가능):",
          categoryButtons: categories,
        },
      ]);
      setSelectedRegion("광주");
      return;
    }

    /* 6-3. 일반 지원사업 */
    if (label === "일반 지원사업") {
      setShowCategorySelect(true);
      setSelectedCategories([]);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "전국 단위 지원사업 중 원하시는 분야를 선택해주세요. (복수 선택 가능):",
          categoryButtons: categories,
        },
      ]);
      setSelectedRegion("전국");
      return;
    }

    /* 6-4. 더보기 */
    if (label === "더보기") {
      handleMoreClick();
      return;
    }

    /* 6-5. 처음으로 */
    if (label === "처음으로") {
      handleRestartClick();
      return;
    }
  };

  /* -----------------------------------------------------
  7. 카테고리 선택 및 제출
  ----------------------------------------------------- */
  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleCategorySubmit = async () => {
    if (selectedCategories.length < 1) {
      alert("최소 1개 이상 선택해주세요!");
      return;
    }

    setMessages((prev) => [
      ...prev,
      { from: "user", text: `선택 완료 (${selectedCategories.join(", ")})` },
      {
        from: "bot",
        text: `선택하신 분야: ${selectedCategories.join(", ")}\n관련 지원사업을 불러오는 중입니다...`,
      },
    ]);

    setShowCategorySelect(false);

    try {
      const res = await axios.post(
        "http://localhost:8080/api/chatbot/program-info",
        {
          region: selectedRegion,
          n_k: 9,
          category: selectedCategories,
        },
        { withCredentials: true }
      );

      const programs = res?.data?.program_list ?? [];
      console.log("📦 수신된 프로그램 개수:", programs.length, programs);

      if (programs.length <= 3) {
        if (programs.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              from: "bot",
              text: "현재 선택하신 분야에 해당하는 지원사업이 없습니다.",
            },
            {
              from: "bot",
              text: "다른 분야를 선택하시거나 처음으로 돌아가주세요.",
              subButtons: ["처음으로"],
            },
          ]);
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "관심 분야에 맞는 지원사업 목록입니다:",
            subButtons: programs.map((p) => ({
              title: p.title,
              link: p.link,
            })),
          },
          {
            from: "bot",
            text: "좀 더 자세한 소상공인 지원사업 정보를 알고싶다면, 다음 사이트를 참고해주세요.",
            subButtons: [
              {
                title: "북구청 소상공인 지원웹",
                link: "https://bigdata.sbiz.or.kr",
              },
              {
                title: "소상공인24",
                link: "https://www.sbiz24.kr/",
              },
            ],
          },
          {
            from: "bot",
            text: "처음으로 돌아가시겠어요?",
            subButtons: ["처음으로"],
          },
        ]);
        return;
      }

      const firstThree = programs.slice(0, 3);
      const remaining = programs.slice(3);
      setRemainingPrograms(remaining);

      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "관심 분야에 맞는 지원사업 목록입니다:",
          subButtons: firstThree.map((p) => ({
            title: p.title,
            link: p.link,
          })),
        },
        {
          from: "bot",
          text: "궁금하신 사업을 선택하시면, 상세 안내 도와드리겠습니다.",
          subButtons: ["더보기", "처음으로"],
        },
      ]);
    } catch (err) {
      console.error("❌ 지원사업 API 호출 오류:", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "지원사업 정보를 불러오지 못했습니다." },
      ]);
    }
  };

  /* -----------------------------------------------------
  8. 더보기 / 처음으로 핸들러
  ----------------------------------------------------- */
  const handleMoreClick = () => {
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text: "추가로 추천드리는 지원사업입니다:",
        subButtons: remainingPrograms.map((p) => ({
          title: p.title,
          link: p.link,
        })),
      },
      {
        from: "bot",
        text: "좀 더 자세한 소상공인 지원사업 정보를 알고싶다면, 다음 사이트를 참고해주세요.",
        subButtons: [
          {
            title: "북구청 소상공인 지원웹",
            link: "https://bigdata.sbiz.or.kr",
          },
          {
            title: "소상공인24",
            link: "https://www.sbiz24.kr/",
          },
        ],
      },
      {
        from: "bot",
        text: "처음으로 돌아가시겠어요?",
        subButtons: ["처음으로"],
      },
    ]);
  };

  const handleRestartClick = () => {
    setIsMenuOpen(true);
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text: "안녕하세요 고객님.\n북구청 소상공인 지원 챗봇입니다.\n궁금한 내용을 직접 입력하시거나\n아래 버튼에서 선택해 주세요.",
      },
    ]);
  };

  return (
    <div style={styles.window}>
      <ChatHeader username={username} onLoginClick={handleLoginButton} />

      <ChatMessageList
        messages={messages}
        onSubButtonClick={handleSubButton}
        toggleCategory={toggleCategory}
        selectedCategories={selectedCategories}
        showCategorySelect={showCategorySelect}
        onCategorySubmit={handleCategorySubmit}
        isMenuOpen={isMenuOpen}
      />

      <QuickMenu
        isOpen={isMenuOpen}
        onToggle={() => setIsMenuOpen(!isMenuOpen)}
        onMenuClick={(type, e) => {
          handleClick(type, e);
          setIsMenuOpen(false);
        }}
      />

      <ChatInput
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onSend={handleSend}
      />
    </div>
  );
}

const styles = {
  window: {
    width: "420px",
    height: "700px",
    border: "1px solid #E5E5EC",
    margin: "40px auto",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
};