package com.example.chatbot.controller;

import com.example.chatbot.model.User;
import com.example.chatbot.repository.UserRepository;
import com.example.chatbot.service.FastApiService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ProgramRecommendationController {

    private final FastApiService fastApiService;
    private final UserRepository userRepository;

    @PostMapping("/recommend-programs")
    public Map<String, Object> recommendPrograms(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        // 1️⃣ 로그인 여부 확인
        User sessionUser = (User) session.getAttribute("user");
        if (sessionUser == null) {
            response.put("loggedIn", false);
            response.put("message", "로그인이 필요합니다.");
            return response;
        }

        // 2️⃣ DB에서 사용자 조회
        Optional<User> dbUserOpt = userRepository.findByLoginId(sessionUser.getLoginId());
        if (dbUserOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "사용자 정보를 찾을 수 없습니다.");
            return response;
        }

        User user = dbUserOpt.get();

        // 3️⃣ 만나이 계산
        int age = 0;
        if (user.getBirthday() != null) {
            age = Period.between(user.getBirthday(), LocalDate.now()).getYears();
        }

        // 4️⃣ FastAPI 요청 본문 구성
        Map<String, Object> payload = Map.of(
            "age", age,
            "gender", user.getGender(),
            "region", user.getRegion(),
            "industry", user.getIndustry(),
            "n_k", 3
        );

        // 5️⃣ FastAPI 호출
        System.out.println(">>> FastAPI 요청 payload: " + payload);
        Map<String, Object> fastApiResponse = fastApiService.recommendProgram(payload);
        System.out.println(">>> FastAPI 응답: " + fastApiResponse);

        // 6️⃣ 결과 그대로 반환
        response.put("loggedIn", true);
        response.put("success", true);
        response.put("data", fastApiResponse);
        return response;
    }
}