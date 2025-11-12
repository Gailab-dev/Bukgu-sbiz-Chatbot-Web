package com.example.chatbot.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // ✅ CORS 설정
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:8080")
                .allowCredentials(true)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }

    // ✅ React 라우터를 위한 경로 매핑
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // ✅ 점(.)이 없는 경로만 React 라우터로 전달
        // 즉, JS/CSS/map/json 등 파일 요청은 그대로 유지
        registry.addViewController("/{path:[^\\.]*}")
                .setViewName("forward:/index.html");
    }
}