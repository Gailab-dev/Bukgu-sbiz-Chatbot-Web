package com.example.chatbot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.List;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();

        // 허용된 호스트 목록 (FastAPI 서버만 허용)
        List<String> allowedHosts = List.of("192.168.0.15", "localhost");

        // 인터셉터 추가(모든 RestTemplate 요청을 가로채서 검사)
        ClientHttpRequestInterceptor whitelistInterceptor = (request, body, execution) -> {
            URI uri = request.getURI();
            String host = uri.getHost(); //요청 대상의 도메인/IP 추출

            // 허용되지 않은 서버로 나가는 요청 차단
            if (!allowedHosts.contains(host)) {
                throw new SecurityException(
                        "허용되지 않은 외부 서버 접근 시도: " + host);
            }

            return execution.execute(request, body);
        };

        restTemplate.getInterceptors().add(whitelistInterceptor);

        return restTemplate;
    }
}