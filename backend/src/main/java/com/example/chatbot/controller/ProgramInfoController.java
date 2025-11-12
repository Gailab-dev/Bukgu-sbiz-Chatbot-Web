package com.example.chatbot.controller;

import com.example.chatbot.service.FastApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ProgramInfoController {

    private final FastApiService fastApiService;

    @PostMapping("/program-info")
    public Map<String, Object> getProgramInfo(@RequestBody Map<String, Object> payload) {
        // FastAPI 호출 (/api/v1/program_info)
        Map<String, Object> fastApiResponse = fastApiService.programInfo(payload);
        return fastApiResponse;
    }
}