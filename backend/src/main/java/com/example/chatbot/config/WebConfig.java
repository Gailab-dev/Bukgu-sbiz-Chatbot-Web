package com.example.chatbot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.allowed.origins}")
    private String allowedOrigins;

    @Value("${app.cookie.domain}")
    private String cookieDomain;

    // ✅ CORS 설정
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowCredentials(true)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }

    // ✅ React 라우터를 위한 경로 매핑
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Forward root and SPA client routes (no dot paths) to index.html
        registry.addViewController("/")
            .setViewName("forward:/index.html");

        registry.addViewController("/{path:[^\\.]*}")
            .setViewName("forward:/index.html");
    }

    // ✅ 쿠키 설정 (포트 간 공유)
    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setSameSite("None");         // 교차 포트 허용
        serializer.setUseSecureCookie(false);   // HTTPS 강제 안함 (필요 시 true)
        serializer.setDomainName(cookieDomain); // 도메인 환경변수 기반 설정
        serializer.setCookiePath("/");
        return serializer;
    }
}