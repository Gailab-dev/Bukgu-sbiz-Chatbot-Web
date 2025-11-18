package com.example.chatbot.controller;

import com.example.chatbot.service.FastApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class IntentClassificationController {

    private final FastApiService fastApiService;

    // ✅ 의도 분류
    @PostMapping("/intent-classification")
    public Map<String, Object> classifyIntent(@RequestBody Map<String, Object> payload) {
        // FastAPI 호출 (/api/v1/intent_classification/)
        Map<String, Object> response = fastApiService.classifyIntent(payload);
        return response;
    }
}
