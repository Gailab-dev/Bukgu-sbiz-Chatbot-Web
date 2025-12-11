package com.example.chatbot.controller;

import com.example.chatbot.service.FastApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class PlatformGuideController {

    private final FastApiService fastApiService;

    // ✅ 플랫폼 기능 안내
    @PostMapping("/platform-guide")
    public Map<String, Object> platformGuide(@RequestBody Map<String, Object> payload) {
        return fastApiService.platformGuide(payload);
    }
}