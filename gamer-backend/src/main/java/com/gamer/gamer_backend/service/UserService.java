package com.gamer.gamer_backend.service;

import com.gamer.gamer_backend.models.User;
import com.gamer.gamer_backend.repository.UserRepository;
import com.gamer.gamer_backend.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword())); // Encrypt password
        return userRepository.save(user);
    }

    public String loginAndGetToken(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return jwtUtil.generateToken(email); // Return token
            }
        }
        return null;
    }
}