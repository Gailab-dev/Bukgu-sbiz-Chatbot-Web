package com.example.chatbot.controller;

import com.example.chatbot.model.User;
import com.example.chatbot.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request, HttpSession session) {
        String loginId = request.get("loginId");
        String password = request.get("password");

        User user = authService.authenticate(loginId, password);
        Map<String, Object> response = new HashMap<>();

        if (user != null) {
            session.setAttribute("user", user);
            response.put("success", true);
            response.put("message", "로그인 성공");
            response.put("username", user.getName());
        } else {
            response.put("success", false);
            response.put("message", "아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        return response;
    }

    @GetMapping("/session")
    public Map<String, Object> getSession(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        User user = (User) session.getAttribute("user");

        if (user != null) {
            response.put("loggedIn", true);
            response.put("username", user.getName());
        } else {
            response.put("loggedIn", false);
        }
        return response;
    }

    @PostMapping("/logout")
    public Map<String, Object> logout(HttpSession session) {
        session.invalidate();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return response;
    }
}
