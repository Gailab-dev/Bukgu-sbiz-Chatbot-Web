package com.example.chatbot.service;

import com.example.chatbot.model.User;
import com.example.chatbot.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User authenticate(String loginId, String password) {
        return userRepository.findByLoginId(loginId)
                .filter(user -> user.getLoginPwd().equals(password))
                .orElse(null);
    }
}