import React, { useState, useEffect, useLayoutEffect } from "react";
import axios from "axios";
import { sendMessage, callService } from "../api/chatApi";

export default function ChatPage() {
  /* -----------------------------------------------------
  1. 상태(State) 정의
  ----------------------------------------------------- */
   // 사용자가 입력한 메세지
  // input(문자열) : 사용자가 입력한 메시지 내용을 저장
  //setInput()(함수) : 문자열 상태를 변경하는 함수 (React 자동 제공)
  const [input, setInput] = useState("");

  // 봇 대화창에 표시되는 전체 메시지 목록
  // messages(배열 (객체[])) : 대화창에 표시되는 메시지 목록을 저장
  //setMessages()(함수) : 배열 상태를 변경하는 함수 (React 자동 제공)
  //각 메시지는 {from: "user" | "bot", text: "..."} 형태로 저장  
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: `안녕하세요 고객님.
        북구청 소상공인 지원 챗봇입니다.
        궁금한 내용을 직접 입력하시거나
        아래 버튼에서 선택해 주세요.`,
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
      // 로그인 안 된 상태 → 로그인 페이지 새 창 열고 현재 창 닫기
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
    setIsMenuOpen(false); // 대화 시작 시 메뉴 닫기
    e.preventDefault();
    if (!input.trim()) return; // 공백 방지

    const userInput = input.trim();

    // 1️⃣ 사용자 메시지 추가
    setMessages((prev) => [...prev, { from: "user", text: userInput }]);
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
            },
          ]);
          break;
      }
    } catch (err) {
      console.error("❌ 의도 분류 API 오류:", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "서버 연결에 문제가 발생했습니다." },
      ]);
    }
  };

  /* -----------------------------------------------------
  5. GUI 버튼 클릭 시 동작
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
      { from: "user", text: labelMap[type] || `[${type}] 선택` },
    ]);

    // "소상공인 지원사업" 클릭 시 하위 버튼 표시
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
            "사업 검색 및 신청"
          ],
        },
        {
          from: "bot",
          text: "그 외 다른 기능이 궁금하다면 저에게 물어보세요!",
        },
      ]);
      return; // 함수의 조기 종료
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
        },
      ]);
      return;
    }

    // 🔹 기본 로직 (나머지 버튼은 FastAPI 호출)
    const res = await callService(type);
    setMessages((prev) => [
        ...prev,
        { from: "bot", text: res.message || JSON.stringify(res) },
    ]);
  };

  /* -----------------------------------------------------
  6. 상위에서 클릭 라벨을 받아 분기 처리
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
  6-1. 지원사업 추천 하위 버튼 클릭 시 동작
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
          { from: "bot", text: res.data.message || "로그인이 필요합니다." },
        ]);
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
        },
      ]);
    } catch (err) {
      // 예외 처리
      console.error("❌ 추천 API 오류:", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "추천 정보를 불러오지 못했습니다." },
      ]);
    }
  };
  /* -----------------------------------------------------
  6-2. 북구청지원사업안내 하위 버튼 클릭 시 동작
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
      }
    ]);
    // 메뉴 다시 펼치기 (GUI 버튼 보이기)
    setIsMenuOpen(true);  
  };
  /* -----------------------------------------------------
  6-3. 광주광역시 지원사업 하위 버튼 클릭 시 동작
  ----------------------------------------------------- */
  const handleGwangjuProgram = () => {
    setShowCategorySelect(true);
    setSelectedCategories([]);
    setSelectedRegion("광주");
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text: "원하시는 지원사업 분야를 선택해주세요. (복수 선택 가능):",
        categoryButtons: categories,
      },
    ]);
  };
  /* -----------------------------------------------------
  6-4. 일반 지원사업 하위 버튼 클릭 시 동작
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
        categoryButtons: categories,
      },
    ]);
  };
  /* -----------------------------------------------------
  6-5. 더보기 하위 버튼 클릭 시 동작
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
  /* -----------------------------------------------------
  6-5. 처음으로 하위 버튼 클릭 시 동작
  ----------------------------------------------------- */
  const handleRestartClick = () => {
    // 메뉴 다시 펼치기 (GUI 버튼 보이기)
    setIsMenuOpen(true);

    // 챗봇 인사 멘트 다시 출력 (이전 대화는 유지)
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text: `안녕하세요 고객님.
          북구청 소상공인 지원 챗봇입니다.
          궁금한 내용을 직접 입력하시거나
          아래 버튼에서 선택해 주세요.`,
      },
    ]);
  };
  /* -----------------------------------------------------
  6-6. 플랫폼 기능 안내 하위 버튼 클릭 시 동작
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
          { from: "bot", text: "해당 기능에 대한 안내 정보를 찾지 못했습니다." },
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
  6-6. 플랫폼 기능 안내 하위 버튼 클릭 시 동작
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
  7. 광주광역시 지원사업 선택 / 일반 지원사업 하위버튼
     (카테고리 선택 / 제출)
  ----------------------------------------------------- */
  /* 광주광역시 지원사업 / 일반 지원사업 카테고리("금융", "내수", "경영", "전체") 버튼을 클릭할 때 
    선택/해제 상태를 토글(전환) 하는 역할 */
  /* 카테고리 다중 선택 버튼"의 상태를 관리하는 함수 */
  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  };
  /*카테고리 선택 후 '선택 완료' 버튼 클릭 시 실행되는 함수*/ 
  /* 선택된 카테고리(selectedCategories)를 기준으로 FastAPI(Spring Boot → FastAPI)에서 
    관련 지원사업 목록을 요청하고, 결과를 챗봇 메시지 형태로 화면에 출력한다.*/
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
        text: `선택하신 분야: ${selectedCategories.join(", ")}\n관련 지원사업을 불러오는 중입니다...`,
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
          setMessages((prev) => [
            ...prev,
            { from: "bot", text: "현재 선택하신 분야에 해당하는 지원사업이 없습니다." },
            { from: "bot", text: "다른 분야를 선택하시거나 처음으로 돌아가주세요.", subButtons: ["처음으로"] },
          ]);
          return;
        }
        // 결과가 1~3개인 경우 → 모두 바로 표시
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

      // case 2️⃣: 응답된 프로그램이 4~9개일 때 → 처음 3개만 표시 + "더보기" 버튼 표시
      const firstThree = programs.slice(0, 3);
      const remaining = programs.slice(3);
      setRemainingPrograms(remaining);
      // 챗봇 메시지 업데이트
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
      // ✅ 6️⃣ FastAPI 통신 실패 시 예외 처리
      console.error("❌ 지원사업 API 호출 오류:", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "지원사업 정보를 불러오지 못했습니다." },
      ]);
    }
  };

  /* -----------------------------------------------------
  7. "플랫폼 기능 안내" 하위 버튼(회원가입 및 로그인, 마이페이지 기능, 사업 검색 및 신청) 클릭 시 동작
  ----------------------------------------------------- */
  // ✅ 자동 스크롤
  // 메시지가 변할 때 (기본)
  useLayoutEffect(() => {
    const chatBox = document.querySelector("#chatBox");
    if (!chatBox) return;

    requestAnimationFrame(() => {
      chatBox.scrollTop = chatBox.scrollHeight;
    });
  }, [messages, isMenuOpen]);

  return (  
    <div style={styles.window}>
      {/* 상단바 */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>소상공인 지원 챗봇</h3>
        </div>
        <button
          style={{
            ...styles.loginBtn,
            cursor: username ? "not-allowed" : "pointer",
          }}
          onClick={handleLoginButton}
          disabled={!!username} // 로그인 상태면 비활성화
        >
          {username ? `${username}님` : "로그인"}
        </button>
      </div>

      {/* 대화창 */}
      <div id="chatBox" 
        style={styles.chatBox}
      >
        {/* 대화 메시지 */}
        {messages.map((m, i) =>
          m.from === "user" ? (
            <div key={i} style={styles.userMsgBox}>
              <div style={styles.userBubble}>{m.text}</div>
            </div>
          ) : (
            <div key={i} style={styles.botMsgBox}>
              <div style={styles.botProfile}>🤖</div>
              <div style={{ ...styles.botBubble, whiteSpace: "pre-line" }}>
                {m.text}

                {/* 🔹 일반 하위 버튼 (예: 지원사업 추천 등) */}
                {m.subButtons && (
                  <div style={styles.subButtonBox}>
                    {m.subButtons.map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (btn.onClick) {
                            // ✅ 플랫폼 기능 안내 버튼 (onClick 함수 직접 실행)
                            btn.onClick();
                          } else if (typeof btn === "string") {
                            // ✅ 일반 챗봇용 하위 버튼
                            handleSubButton(btn);
                          } else if (btn.link) {
                            // ✅ 외부 링크용 버튼
                            window.open(btn.link, "_blank");
                          }
                        }}
                        style={styles.subButton}
                      >
                        {btn.title || btn} {/* 문자열이면 그대로, 객체면 title */}
                      </button>
                    ))}
                  </div>
                )}

                {/* 🔹 ✅ 카테고리 선택창 (광주광역시 지원사업일 때 표시) */}
                {m.categoryButtons && showCategorySelect && (
                  <div style={styles.categoryBox}>
                    {m.categoryButtons.map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleCategory(cat)}
                        style={{
                          ...styles.categoryBtn,
                          backgroundColor: selectedCategories.includes(cat)
                            ? "#1E88E5"
                            : "#fff",
                          color: selectedCategories.includes(cat)
                            ? "#fff"
                            : "#1E88E5",
                        }}
                      >
                        {cat}
                      </button>
                    ))}

                    {/* ✅ 선택 완료 버튼 (최소 1개 이상 선택해야 활성화) */}
                    <button
                      onClick={handleCategorySubmit}
                      style={{
                        ...styles.submitBtn,
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
            </div>
          )
        )}
      </div>

      {/* GUI 버튼 (슬라이드 토글 가능) */}
      <div
        style={{
          ...styles.buttonBox,
          maxHeight: isMenuOpen ? "110px" : "15px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* 🔹 상단 토글 핸들 (흰색 바) */}
        <div
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            width: "60px",
            height: "5px",
            backgroundColor: "#fff",
            borderRadius: "3px",
            position: "absolute",
            top: "6px",
            left: "50%",
            transform: "translateX(-50%)",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        ></div>

        {/* 버튼 리스트 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            paddingTop: "18px",
            opacity: isMenuOpen ? 1 : 0,
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              handleClick("program", e);
              setIsMenuOpen(false);
            }}
            style={styles.menuBtn}
          >
            소상공인 지원사업
          </button>
          <button
            type="button"
            onClick={(e) => {
              handleClick("guide", e);
              setIsMenuOpen(false);
            }}
            style={styles.menuBtn}
          >
            플랫폼 기능 안내
          </button>
          <button
            type="button"
            onClick={(e) => {
              handleClick("faq", e);
              setIsMenuOpen(false);
            }}
            style={styles.menuBtn}
          >
            자주 묻는 질문
          </button>
        </div>
      </div>

      {/* 입력창 */}
      <div style={styles.inputBox}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
          style={styles.input}
          // ✅ Enter 키 입력 시 handleSend() 호출
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // 줄바꿈 방지
              handleSend(e);
            }
          }}
        />
        <button type="button" onClick={handleSend} style={styles.sendBtn}>
          ➤
        </button>
      </div>
    </div>
  );
}

const styles = {
  window: {
    width: "420px",
    height: "700px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    margin: "40px auto",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  header: {
    backgroundColor: "#1E88E5",
    color: "white",
    padding: "10px 15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
  },
  title: { margin: 0, fontSize: "16px" },
  loginBtn: {
    backgroundColor: "white",
    color: "#1E88E5",
    border: "none",
    borderRadius: "6px",
    padding: "5px 10px",
    cursor: "pointer",
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    backgroundColor: "#f7f9fc",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  botMsgBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  },
  botProfile: {
    fontSize: "22px",
    lineHeight: "30px",
  },
  botBubble: {
    backgroundColor: "#fff",
    padding: "10px 15px",
    borderRadius: "15px",
    border: "1px solid #ddd",
    maxWidth: "75%",
  },
  userMsgBox: {
    display: "flex",
    justifyContent: "flex-end",
  },
  userBubble: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "15px",
    maxWidth: "75%",
  },
  buttonBox: {
    display: "flex",
    justifyContent: "space-around",
    padding: "10px",
    borderTop: "1px solid #ddd",
    backgroundColor: "#fff",
  },
  menuBtn: {
    flex: 1,
    margin: "0 4px",
    backgroundColor: "#E3F2FD",
    border: "1px solid #90CAF9",
    borderRadius: "10px",
    padding: "8px",
    cursor: "pointer",
    fontSize: "13px",
    color: "#1976D2",
    fontWeight: "bold",
  },
  inputBox: {
    display: "flex",
    borderTop: "1px solid #ddd",
    padding: "8px",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  sendBtn: {
    marginLeft: "8px",
    backgroundColor: "#1E88E5",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    fontSize: "18px",
    cursor: "pointer",
  },
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