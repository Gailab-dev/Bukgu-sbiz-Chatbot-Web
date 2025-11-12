package com.example.chatbot.controller;

import com.example.chatbot.service.FastApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final FastApiService fastApiService;

    // ✅ CUI: 사용자가 입력한 문장을 intent 분류 → 해당 서비스 호출
    @PostMapping("/message")
    public ResponseEntity<?> handleMessage(@RequestBody Map<String, Object> request) {
        String text = (String) request.get("text");
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Empty message"));
        }

        // 1️⃣ 의도 분류 요청
        Map<String, Object> intentRes = fastApiService.classifyIntent(Map.of("text", text));

        String intent = (String) intentRes.get("intent");
        Map<String, Object> params = (Map<String, Object>) intentRes.get("extracted_params");

        // 2️⃣ intent에 따라 실제 API 호출
        Map<String, Object> response;
        switch (intent) {
            case "program_recommendation" -> response = fastApiService.recommendProgram(params);
            case "program_info" -> response = fastApiService.programInfo(params);
            case "platform_guide" -> response = fastApiService.platformGuide(params);
            case "faq_search" -> response = fastApiService.faqSearch(params);
            default -> response = Map.of("message", "죄송합니다. 요청을 이해하지 못했습니다.");
        }

        return ResponseEntity.ok(response);
    }

    // ✅ GUI: 버튼 클릭 시 직접 API 호출
    @PostMapping("/service")
    public ResponseEntity<?> handleService(@RequestBody Map<String, Object> request) {
        String type = (String) request.get("type");
        Map<String, Object> payload = (Map<String, Object>) request.get("payload");

        return switch (type) {
            case "program" -> ResponseEntity.ok(fastApiService.recommendProgram(payload));
            case "program_info" -> ResponseEntity.ok(fastApiService.programInfo(payload));
            case "guide" -> ResponseEntity.ok(fastApiService.platformGuide(payload));
            case "faq" -> ResponseEntity.ok(fastApiService.faqSearch(payload));
            default -> ResponseEntity.badRequest().body(Map.of("error", "Invalid type"));
        };
    }
}