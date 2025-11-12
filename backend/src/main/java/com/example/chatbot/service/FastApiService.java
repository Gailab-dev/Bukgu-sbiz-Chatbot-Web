package com.example.chatbot.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class FastApiService {

    @Value("${fastapi.base-url}")
    private String fastApiBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private Map<String, Object> post(String endpoint, Map<String, Object> payload) {
        String url = fastApiBaseUrl + endpoint;
        ResponseEntity<String> response = restTemplate.postForEntity(url, payload, String.class);

        System.out.println(">>> FastAPI 응답 상태: " + response.getStatusCode());
        System.out.println(">>> FastAPI 원문 응답: " + response.getBody());

        try {
            // ✅ JSON 문자열을 Map으로 직접 변환
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(response.getBody(), Map.class);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("⚠️ FastAPI 응답 파싱 실패: " + e.getMessage());
            return Map.of("error", "FastAPI response parse failed", "raw", response.getBody());
        }
    }

    // ✅ 1. 의도 분류
    public Map<String, Object> classifyIntent(Map<String, Object> payload) {
        return post("/api/v1/intent_classification/", payload);
    }

    // ✅ 2. 북구청 지원사업 추천
    public Map<String, Object> recommendProgram(Map<String, Object> payload) {
        return post("/api/v1/bukgu_program_recommendation/", payload);
    }

    // ✅ 3. 지원사업 상세정보
    public Map<String, Object> programInfo(Map<String, Object> payload) {
        return post("/api/v1/program_info/", payload);
    }

    // ✅ 4. 플랫폼 기능 안내
    public Map<String, Object> platformGuide(Map<String, Object> payload) {
        return post("/api/v1/platform_guide/", payload);
    }

    // ✅ 5. FAQ 검색
    public Map<String, Object> faqSearch(Map<String, Object> payload) {
        return post("/api/v1/faq_search/", payload);
    }
}