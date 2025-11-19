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
  // 사용자가 입력한 메세지
  // input(문자열) : 사용자가 입력한 메시지 내용을 저장
  // setInput()(함수) : 문자열 상태를 변경하는 함수 (React 자동 제공)
  const [input, setInput] = useState("");

  // 봇 대화창에 표시되는 전체 메시지 목록창 및 초기 상태 메세지
  // messages(배열 (객체[])) : 대화창에 표시되는 메시지 목록을 저장
  //setMessages()(함수) : 배열 상태를 변경하는 함수 (React 자동 제공)
  //각 메시지는 {from: "user" | "bot", text: "..."} 형태로 저장  
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "안녕하세요 고객님.\n북구청 소상공인 지원 챗봇입니다.\n궁금한 내용을 직접 입력하시거나\n아래 버튼에서 선택해 주세요.",
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
    },
  ]);

  // 로그인된 사용자 이름 (세션에서 가져옴)
  const [username, setUsername] = useState(null);

  // 사용자가 선택한 지원사업 카테고리(복수 선택 가능)
  //selectedCategories(배열 (string[])) : 사용자가 선택한 지원사업 분야 목록을 저장
  //setSelectedCategories()(함수) : 배열 상태를 변경하는 함수 (React 자동 제공)
  const [selectedCategories, setSelectedCategories] = useState([]);

  // 카테고리 선택창(창업/경영/금융/기타) 표시 여부
  //showCategorySelect(불리언) : 카테고리 선택창의 표시 여부를 나타냄(분야 선택 UI(창업·경영·금융·기타)를 표시할지 여부를 저장)
  //setShowCategorySelect()(함수) : 불리언 상태를 변경하는 함수 (React 자동 제공)(위 UI 표시 여부를 제어하는 setter 함수)
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  // 사용자가 이미 본 지원사업 목록 (중복 추천 방지용)
  //remainingPrograms(배열 (객체[])) : 사용자가 이미 확인한 지원사업 목록을 저장
  //setRemainingPrograms()(함수) : 배열 상태를 변경하는 함수 (React 자동 제공)
  const [remainingPrograms, setRemainingPrograms] = useState([]);

  // GUI 버튼 보이기/숨기기 상태 (하단 토글용)
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  // 선택된 지역(광주 / 전국)
  // selectedRegion(문자열) : 사용자가 선택한 지원사업 지역 정보를 저장 ("광주" 또는 "전국")
  // setSelectedRegion()(함수) : 지역 상태를 변경하는 함수 (React 자동 제공)
  //기본값으로 "광주"로 설정
  const [selectedRegion, setSelectedRegion] = useState("광주");

  // 선택된 지원사업 카테고리("금융", "내수", "경영", "전체")
  // categories(배열 (string[])) : 지원사업 카테고리 목록을 저장
  const categories = ["금융", "내수", "경영", "전체"];

  /* -----------------------------------------------------
  2. 현재 시간 가져오기 (HH:MM 형식, 24시간)
  ----------------------------------------------------- */  
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  /* -----------------------------------------------------
  3. 로그인 여부 세션 확인 (최초 1회)
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
  4. 로그인 버튼 클릭 시 동작
  ----------------------------------------------------- */
  const handleLoginButton = () => {
    if (!username) {
      // 로그인 안 된 상태 → 로그인 페이지 새 창 열고 현재 창 닫기
      window.open("http://localhost:8080", "_blank");
      window.close();
    } else {
      alert("이미 로그인되어 있습니다.");
    }
  };

  /* -----------------------------------------------------
  5. 텍스트 입력(CUI) 후 전송 버튼 클릭 시 동작
  ----------------------------------------------------- */
  const handleSend = async (e) => {
    setIsMenuOpen(false); // 대화 시작 시 메뉴 닫기
    e.preventDefault();
    if (!input.trim()) return; // 공백 방지

    const userInput = input.trim();

    // 1️⃣ 사용자 메시지 추가
    setMessages((prev) => [...prev, { from: "user", text: input, time: getCurrentTime() }]);
    setInput(""); // 입력창 초기화

    try {
      // 2️⃣ FastAPI 의도 분류 요청
      const res = await axios.post("http://localhost:8080/api/chatbot/intent-classification", {
        text: userInput,
      });

      const intent = res.data.intent;
      const confidence = res.data.confidence;

      console.log("🎯 Intent:", intent, "| Confidence:", confidence);

      // 3️⃣ confidence ≤ 0.6 → 이해 실패
      if (confidence <= 0.6) {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "질문을 잘 이해하지 못했어요.\n아래 버튼을 눌러 원하시는 내용을 찾아주시거나, 다시 질문해주세요.",
            time: getCurrentTime(),
          },
        ]);
        // ✅ 메뉴 다시 펼치기 (GUI 버튼 보이기)
        setIsMenuOpen(true);        
        return;
      }

      // 4️⃣ confidence > 0.6 → intent별 분기 처리
      switch (intent) {
        case "program_recommendation":
          await handleRecommendProgram();
          break;

        case "program_info":
          setMessages((prev) => [
            ...prev,
            {
              from: "bot",
              text: "어떤 지역의 지원사업 정보를 원하시나요?",
              subButtons: ["광주광역시 지원사업", "일반 지원사업"],
              time: getCurrentTime(),
            },
          ]);
          break;

        case "platform_guide":
          await handlePlatformGuide(userInput);
          break;

        case "faq_search":
          await handleFaqSearch(userInput);
          break;

        default:
          setMessages((prev) => [
            ...prev,
            {
              from: "bot",
              text: "죄송합니다. 이 질문에 대한 처리를 아직 지원하지 않습니다.",
              time: getCurrentTime(),
            },
          ]);
          break;
      }
    } catch (err) {
      console.error("❌ 의도 분류 API 오류:", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "서버 연결에 문제가 발생했습니다.",time: getCurrentTime(), },
      ]);
    }
  };

  /* -----------------------------------------------------
  6. GUI 버튼 클릭 시 동작
  ----------------------------------------------------- */
  const handleClick = async (type, e) => {
    if (e) e.preventDefault();

    // 버튼 라벨 매핑
    const labelMap = {
      program: "소상공인 지원사업",
      guide: "플랫폼 기능 안내",
      faq: "자주 묻는 질문",
    };

    // 사용자 메시지 추가
    setMessages((prev) => [
      ...prev,
      { from: "user", text: labelMap[type] || `[${type}] 선택`, time: getCurrentTime() },
    ]);

    // "소상공인 지원사업" 클릭 시 하위 버튼 표시
    if (type === "program") {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "지원사업 중 원하시는 것을 선택해주세요:",
          time: getCurrentTime(),
          subButtons: [
            "지원사업 추천",
            "북구청 지원사업",
            "광주광역시 지원사업",
            "일반 지원사업",
          ],
        },
      ]);
      return; // 함수의 조기 종료(밑의 네트워크 요청(FastAPI 통신)을 멈추고, UI 업데이트만 하라는 의미)
    }

    // "플랫폼 기능 안내" 클릭 시 하위 버튼 표시
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
          time: getCurrentTime(),
        },
      ]);
      return; // 함수의 조기 종료(밑의 네트워크 요청(FastAPI 통신)을 멈추고, UI 업데이트만 하라는 의미)
    }

    // "자주 묻는 질문" 클릭 시 하위 버튼 표시
    if (type === "faq") {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "자주 묻는 질문 중 어떤 것이 궁금하신가요?",
          subButtons: [
            "소상공인 지원 플랫폼이란?",
            "소상공인 지원사업이란?",
            "문의 및 상담 방법",
          ],
        },
        {
          from: "bot",
          text: "그 외 다른 기능이 궁금하다면 저에게 물어보세요!",
          time: getCurrentTime(),
        },
      ]);
      return; // 함수의 조기 종료(밑의 네트워크 요청(FastAPI 통신)을 멈추고, UI 업데이트만 하라는 의미)
    }

    // 기본 로직 (예비용, 로직이 입력되지않은 케이스를 위한 임시 로직)
    const res = await callService(type);
    setMessages((prev) => [
      ...prev,
      { from: "bot", text: res.message || JSON.stringify(res), time: getCurrentTime() },
    ]);
  };

  /* -----------------------------------------------------
  7. GUI 버튼 중 하나 클릭 라벨을 받아 분기 처리
  ----------------------------------------------------- */
  const handleSubButton = async (label) => {
    // 사용자 메시지에 사용자가 클릭한 버튼 이름 추가
    setMessages((prev) => [...prev, { from: "user", text: `${label}` }]);

    // 하위 버튼 라벨에 따른 분기 처리(기능별로 하위 함수에 위임)
    //  
    if (label === "지원사업 추천") return handleRecommendProgram();
    if (label === "북구청 지원사업") return handleBukguProgram(); // 추후 구현 예정
    if (label === "광주광역시 지원사업") return handleGwangjuProgram();
    if (label === "일반 지원사업") return handleGeneralProgram();
    if (label === "더보기") return handleMoreClick();
    if (label === "처음으로") return handleRestartClick();
    if (["회원가입 및 로그인", "마이페이지 기능", "사업 검색 및 신청"].includes(label))
      return handlePlatformGuide(label);  
    if (["소상공인 지원 플랫폼이란?", "소상공인 지원사업이란?", "문의 및 상담 방법"].includes(label))
      return handleFaqSearch(label);    
  };

  /* -----------------------------------------------------
  7-1. 지원사업 추천 하위 버튼 클릭 시 동작
  ----------------------------------------------------- */
  const handleRecommendProgram = async () => {
    try {
      // 백엔드(Spring Boot) 요청
      const res = await axios.post(
        "http://localhost:8080/api/chatbot/recommend-programs",
        {},
        { withCredentials: true }
      );

      // 🔹 로그인 안 된 경우 처리
      if (!res.data.loggedIn) {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: res.data.message || "로그인이 필요합니다.상단의 로그인 버튼을 통해 로그인이 가능합니다", time: getCurrentTime() },
        ]);
        // GUI 메뉴 다시 열기
        setIsMenuOpen(true);
        return;
      }

      // FastAPI 응답에서 program_list 추출
      const programs = res?.data?.data?.program_list ?? [];

      // 봇 메시지에 추천 사업 목록 추가(프로그램 리스트를 버튼으로 표시)
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
          text: "궁금하신 사업을 선택하시면 상세 안내 도와드리겠습니다.",
          time: getCurrentTime(),
        },
      ]);
    } catch (err) {
      // 예외 처리
      console.error("❌ 추천 API 오류:", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "추천 정보를 불러오지 못했습니다.", time: getCurrentTime() },
      ]);
    }
  };

  /* -----------------------------------------------------
  7-2. 북구청지원사업안내/광주광역시 지원사업 하위 버튼 클릭 시 동작
  ----------------------------------------------------- */
  /* -----------------------------------------------------
  7-2-1. 북구청지원사업안내 하위 버튼 클릭 시 동작
  ----------------------------------------------------- */
  const handleBukguProgram = () => {
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text: 
          `북구청에서는 소상공인을 위한 다양한 지원사업을 운영하고 있습니다:

          • 연매출 기준 북구 일반 소상공인 카드수수료 지원사업
          • 2025년 북구 소상공인 종합컨설팅 지원사업
          • 2025 북구 라이브커머스 참여 소상공인 모집
          • 온라인공고문(북소몰) 입점 소상공인 모집`,
      },
      {
        from: "bot",
        text: "자세한 내용은 아래 링크에서 확인하실 수 있습니다.",
        subButtons: [
          {
            title: "북구청 소상공인 지원사업 페이지 바로가기",
            link: "https://bukgu.go.kr/해당URL",   // 여기에 실제 URL 넣기
          },
        ],
      },
      {
        from: "bot",
        text: "다른 도움이 필요하시면 아래 메뉴를 이용해주세요.",
        time: getCurrentTime(),
      }
    ]);
    // 메뉴 다시 펼치기 (GUI 버튼 보이기)
    setIsMenuOpen(true);  
  };

  /* -----------------------------------------------------
  7-2-2. 광주광역시 지원사업 하위 버튼 클릭 시 동작
  ----------------------------------------------------- */
  const handleGwangjuProgram = () => {
    setShowCategorySelect(true);
    setSelectedCategories([]);
    setSelectedRegion("광주");
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text: "원하시는 지원사업 분야를 선택해주세요 : \n(복수 선택 가능)",
        time: getCurrentTime(),  
        categoryButtons: categories,
      },
    ]);
  };

  /* -----------------------------------------------------
  7-2-3. 광주광역시 지원사업/일반 지원사업 하위 버튼 클릭 시 동작 후 카테고리 선택 / 선택 완료 동작
  ----------------------------------------------------- */
  /* -----------------------------------------------------
  7-2-3-1. 카테고리("금융", "내수", "경영", "전체") 버튼을 클릭할 때  선택/해제 상태를 토글(전환) 하는 역할
  ----------------------------------------------------- */
  /* selectedCategories에 담아 카테고리 다중 선택 버튼"의 상태를 관리하는 함수 */
  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat) // 이미 선택 → 제거(선택 해제)
        : [...prev, cat]                // 선택 안됨 → 추가
    );
  };

  /* -----------------------------------------------------
  7-2-3-2. 카테고리 선택 후 '선택 완료' 버튼 클릭 시 동작
  ----------------------------------------------------- */
  /* 선택된 카테고리(selectedCategories)를 기준으로 FastAPI(Spring Boot → FastAPI)에서 관련 지원사업 목록을 요청하고, 결과를 챗봇 메시지 형태로 화면에 출력한다.*/
  const handleCategorySubmit = async () => {
    // ✅ 1️⃣ 최소 1개 이상 선택해야만 요청 가능
    if (selectedCategories.length < 1) {
      alert("최소 1개 이상 선택해주세요!");
      return;
    }
    // ✅ 2️⃣ 사용자의 선택 결과를 대화창에 표시
    //    - "선택 완료 (금융, 경영)" 형태로 사용자 메시지 출력
    //    - "관련 지원사업을 불러오는 중입니다..." 안내 메시지 출력
    setMessages((prev) => [
      ...prev,
      { from: "user", text: `선택 완료 (${selectedCategories.join(", ")})` },
      {
        from: "bot",
        isTyping: true, // 타이핑 애니메이션 표시
        time: getCurrentTime(),
      },
    ]);
    // ✅ 3️⃣ 선택 UI(카테고리 버튼들) 숨기기
    setShowCategorySelect(false);

    try {
      // ✅ 4️⃣ FastAPI로 지원사업 요청
      //    - 선택된 지역(selectedRegion)과 카테고리 배열(selectedCategories) 전달
      //    - 최대 9개의 데이터를 요청하도록 설정 (n_k = 9)
      const res = await axios.post(
        "http://localhost:8080/api/chatbot/program-info",
        {
          region: selectedRegion, // 선택된 지역 (광주 or 전국)
          n_k: 9, // 최대 9개까지 요청
          category: selectedCategories, // 배열(ex) ["금융", "경영"])로 전달
        },
        { withCredentials: true } // 세션 쿠키 포함 (로그인 세션 유지용)
      );
      // ✅ 5️⃣ 응답에서 프로그램 목록 추출 (없으면 빈 배열로 처리)
      const programs = res?.data?.program_list ?? [];
      // console.log("📦 수신된 프로그램 개수:", programs.length, programs);

      // case 1️⃣: 응답된 프로그램이 0~3개 이하일 때 → 바로 전체 출력 + 안내 메시지 + 처음으로 버튼 표시
      if (programs.length <= 3) {
        // 결과가 0개인 경우 (검색 결과 없음)
        if (programs.length === 0) {
          setMessages((prev) =>
            prev.filter((msg) => !msg.isTyping).concat([
              { from: "bot", text: "현재 선택하신 분야에 해당하는 지원사업이 없습니다.",time: getCurrentTime() },
              { from: "bot", text: "다른 분야를 선택하시거나 처음으로 돌아가주세요.", subButtons: ["처음으로"], time: getCurrentTime() },
            ])
          );
          return;
        }
        // 결과가 1~3개인 경우 → 모두 바로 표시
        setMessages((prev) =>
          prev.filter((msg) => !msg.isTyping).concat([
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
              subButtons: ["처음으로"],
              time: getCurrentTime(),
              
            },
          ])
        );
        return;
      }

      // case 2️⃣: 응답된 프로그램이 4~9개일 때 → 처음 3개만 표시 + "더보기" 버튼 표시 후, 나머지를 한번에 출력
      const firstThree = programs.slice(0, 3);
      const remaining = programs.slice(3);
      setRemainingPrograms(remaining);
      // 챗봇 메시지 업데이트
      setMessages((prev) =>
        prev.filter((msg) => !msg.isTyping).concat([
          {
            from: "bot",
            text: "관심 분야에 맞는 지원사업 목록입니다:",
            time: getCurrentTime(),
            subButtons: firstThree.map((p) => ({
              title: p.title,
              link: p.link,
            })),
          },
          {
            from: "bot",
            subButtons: ["더보기", "처음으로"],
          },
        ])
      );

    } catch (err) {
      // ✅ 6️⃣ FastAPI 통신 실패 시 예외 처리
      console.error("❌ 지원사업 API 호출 오류:", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "지원사업 정보를 불러오지 못했습니다.", time: getCurrentTime() },
      ]);
    }
  };

  /* -----------------------------------------------------
  7-2-3-3. 더보기 하위 버튼 클릭 시 동작
  ----------------------------------------------------- */  
  const handleMoreClick = () => {
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text: "추가로 추천드리는 지원사업입니다:",
        time: getCurrentTime(),
        subButtons: remainingPrograms.map((p) => ({
          title: p.title,
          link: p.link,
        })),
      },
      {
        from: "bot",
        text: "좀 더 자세한 소상공인 지원사업 정보를 알고싶다면, 다음 사이트를 참고해주세요.",
        time: getCurrentTime(),
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
        subButtons: ["처음으로"],
      },
    ]);
  };

  /* -----------------------------------------------------
  7-2-3-4. 처음으로 하위 버튼 클릭 시 동작
  ----------------------------------------------------- */  
  const handleRestartClick = () => {
    // 메뉴 다시 펼치기 (GUI 버튼 보이기)
    setIsMenuOpen(true);

    // 챗봇 인사 멘트 다시 출력 (이전 대화는 유지)
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text: `안녕하세요 고객님.북구청 소상공인 지원 챗봇입니다.궁금한 내용을 직접 입력하시거나아래 버튼에서 선택해 주세요.`,
        time: getCurrentTime(),
      },
    ]);
  };

  /* -----------------------------------------------------
  7-3. 일반 지원사업 하위 버튼 클릭 시 동작
  ----------------------------------------------------- */
  const handleGeneralProgram = () => {
    setShowCategorySelect(true);
    setSelectedCategories([]);
    setSelectedRegion("전국");
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text: "전국 단위 지원사업 중 원하시는 분야를 선택해주세요. (복수 선택 가능):",
        time: getCurrentTime(),
        categoryButtons: categories,
      },
    ]);
  };

  /* -----------------------------------------------------
  7-4. 플랫폼 기능 안내 하위 버튼 클릭 시 동작
  ----------------------------------------------------- */
  /* -----------------------------------------------------
  7-4-1. 플랫폼 기능 안내 하위 버튼 클릭 후 관련 질문 리스트 버튼 보여주기
  ----------------------------------------------------- */
  // ✅ 플랫폼 기능 안내 전용 핸들러
  const handlePlatformGuide = async (label) => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/chatbot/platform-guide",
        { question: label, n_k: 5 } // ✅ 최대 5개까지 요청
      );

      const guideList = res?.data?.guide_list ?? [];

      // // 🔍 디버깅 로그
      // console.log("📦 플랫폼 기능 안내 응답 데이터:", res.data);
      // console.log("📋 guide_list 내용:", guideList);
      // console.log("📊 수신된 가이드 개수:", guideList.length);

      if (guideList.length === 0) {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "해당 기능에 대한 안내 정보를 찾지 못했습니다. 다른 질문을 부탁드립니다.", time: getCurrentTime() },
        ]);
        return;
      }

      // ✅ 기능 이름만 추출
      const featureButtons = guideList.map((g) => g.feature_name);

      // ✅ "어떤 기능이 궁금한지" 안내 메시지 추가
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "다음 중 어떤 기능에 대해 알고 싶으신가요?",
          time: getCurrentTime(),
          subButtons: featureButtons.map((f) => ({
            title: f,
            onClick: () => handleFeatureClick(f, guideList, setMessages), // ✅ 전달
          })),
        },
      ]);
    } catch (err) {
      console.error("❌ 플랫폼 기능 안내 오류:", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "기능 안내 정보를 불러오지 못했습니다." },
      ]);
    }
  };

  /* -----------------------------------------------------
  7-4-2. 플랫폼 기능 안내 하위 버튼 클릭 후 관련 질문 리스트 버튼 중 하나 클릭 시 동작
  ----------------------------------------------------- */
  // ✅ 버튼 클릭 시 동작 정의
  const handleFeatureClick = (featureName, guideList, setMessages) => {
    const selectedGuide = guideList.find(
      (g) => g.feature_name === featureName
    );

    if (!selectedGuide) return;

    setMessages((prev) => [
      ...prev,
      { from: "user", text: featureName },
      {
        from: "bot",
        text: `${selectedGuide.description}`,
      },
      ...(selectedGuide.step_guide?.length
        ? [
            {
              from: "bot",
              text: "이용 방법 단계:",
              subButtons: selectedGuide.step_guide,
            },
          ]
        : []),
      {
        from: "bot",
        text: "다른 기능도 안내해드릴까요?",
      },
    ]);

    // 메뉴 다시 펼치기 (GUI 버튼 보이기)
    setIsMenuOpen(true);
  };

  /* -----------------------------------------------------
  7-5. 자주하는 질문 하위 버튼 클릭 시 동작
  ----------------------------------------------------- */
  const handleFaqSearch = async (question) => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/chatbot/faq-search",
        { question, n_k: 3 }
      );

      const faqList = res.data.faq_list || [];
      const bestQuestion = res.data.question || question;
      const bestAnswer = res.data.answer || res.data.message || "";

      // similarity 로그 출력
      if (faqList.length > 0) {
        console.group("🔍 FAQ 검색 similarity_score 로그");
        faqList.forEach((item, index) => {
          console.log(
            `${index + 1}번 질문: ${item.question} | similarity_score: ${item.similarity_score}`
          );
        });
        console.groupEnd();
      }

      // ✅ question + answer 함께 출력
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: `${bestQuestion}:\n\n${bestAnswer}`,
        },
        {
          from: "bot",
          text: "그 외 다른 기능이 궁금하다면 저에게 물어보세요!",
        },
      ]);
    } catch (err) {
      console.error("❌ FAQ 검색 오류:", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "FAQ 정보를 불러오지 못했습니다." },
      ]);
    }
    // 메뉴 다시 펼치기 (GUI 버튼 보이기)
    setIsMenuOpen(true);
  };




  return (
    <div style={styles.window}>
      {/* 상단바(헤) */}
      <ChatHeader username={username} onLoginClick={handleLoginButton} />

      {/* 대화창 및 대화내용 */}
      <ChatMessageList
        messages={messages}
        onSubButtonClick={handleSubButton}
        toggleCategory={toggleCategory}
        selectedCategories={selectedCategories}
        showCategorySelect={showCategorySelect}
        onCategorySubmit={handleCategorySubmit}
        isMenuOpen={isMenuOpen}
      />
      
      {/* 하단 GUI 버튼 메뉴 */}
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
    height: "650px",
    border: "1px solid #E5E5EC",
    margin: "20px auto",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
};