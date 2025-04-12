package com.gamer.gamer_backend.controller;

import com.gamer.gamer_backend.models.User;
import com.gamer.gamer_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User newUser = userService.registerUser(user);
            return ResponseEntity.ok(newUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        String token = userService.loginAndGetToken(email, password);

        if (token != null) {
            // Return both token and email
            return ResponseEntity.ok(Map.of(
                "token", token,
                "email", email
            ));
        } else {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
    }

}