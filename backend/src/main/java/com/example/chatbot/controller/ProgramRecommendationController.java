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
    public Map<String, Object> recommendPrograms(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 1️⃣ userId 추출 (프런트에서 username 키로 넘어옴)
            Object idObj = request.get("username");
            if (idObj == null) {
                response.put("success", false);
                response.put("message", "로그인 정보가 없습니다. (userId 누락)");
                return response;
            }

            Long userId;
            if (idObj instanceof Number) {
                userId = ((Number) idObj).longValue();
            } else {
                userId = Long.parseLong(idObj.toString());
            }

            // 2️⃣ DB 조회
            Optional<User> dbUserOpt = userRepository.findById(userId);
            if (dbUserOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "사용자 정보를 찾을 수 없습니다.");
                return response;
            }

            User user = dbUserOpt.get();

            // 3️⃣ 필수 값 확인 및 기본값 처리
            int age = 0;
            if (user.getBirthday() != null) {
                age = Period.between(user.getBirthday(), LocalDate.now()).getYears();
            }

            String gender = user.getGender() != null ? user.getGender() : "정보없음";
            String region = user.getRegion() != null ? user.getRegion() : "정보없음";
            String industry = user.getIndustry() != null ? user.getIndustry() : "정보없음";

            // 4️⃣ FastAPI 요청 payload 구성 (요청 명세에 맞게)
            Map<String, Object> payload = new HashMap<>();
            payload.put("age", age);                      // int
            payload.put("gender", gender);                // string
            payload.put("region", region);                // string
            payload.put("industry", industry);            // string
            payload.put("n_k", 3);                        // optional int

            System.out.println(">>> FastAPI 요청 payload: " + payload);

            // 5️⃣ FastAPI 호출
            Map<String, Object> fastApiResponse = fastApiService.recommendProgram(payload);
            System.out.println(">>> FastAPI 응답: " + fastApiResponse);

            // 6️⃣ 결과 반환
            response.put("loggedIn", true);
            response.put("success", true);
            response.put("data", fastApiResponse);
            return response;

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "추천 프로그램 처리 중 오류가 발생했습니다: " + e.getMessage());
            return response;
        }
    }
}