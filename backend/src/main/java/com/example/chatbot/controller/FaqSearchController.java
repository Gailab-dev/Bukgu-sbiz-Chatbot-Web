package com.example.chatbot.controller;

import com.example.chatbot.service.FastApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chatbot")
public class FaqSearchController {

    private final FastApiService fastApiService;

    @PostMapping("/faq-search")
    public ResponseEntity<Map<String, Object>> searchFaq(@RequestBody Map<String, Object> request) {
        try {
            String question = (String) request.get("question");
            if (question == null || question.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "질문이 비어있습니다."));
            }

            // ✅ FastAPI 요청
            Map<String, Object> payload = Map.of("question", question, "n_k", 3);
            Map<String, Object> fastApiResponse = fastApiService.faqSearch(payload);

            List<Map<String, Object>> faqList = (List<Map<String, Object>>) fastApiResponse.get("faq_list");
            if (faqList == null || faqList.isEmpty()) {
                return ResponseEntity.ok(Map.of("message", "FAQ 데이터(faqList)를 찾을 수 없습니다."));
            }

            // ✅ 가장 낮은 similarity_score (유사도 낮을수록 좋은 구조라면 min / 높을수록 좋으면 max)
            Optional<Map<String, Object>> best = faqList.stream()
                    .min(Comparator.comparingDouble(f ->
                            ((Number) f.getOrDefault("similarity_score", 9999)).doubleValue()
                    ));

            if (best.isEmpty()) {
                return ResponseEntity.ok(Map.of("message", "FAQ 데이터(best)를 찾을 수 없습니다."));
            }

            Map<String, Object> bestFaq = best.get();

            // ✅ question + answer 함께 반환
            Map<String, Object> responseBody = new LinkedHashMap<>();
            responseBody.put("question", bestFaq.get("question"));
            responseBody.put("answer", bestFaq.get("answer"));
            responseBody.put("faq_list", faqList);

            return ResponseEntity.ok(responseBody);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "SERVER_ERROR",
                    "message", e.getMessage()
            ));
        }
    }
}