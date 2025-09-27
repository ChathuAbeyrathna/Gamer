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
    // Injects the UserService dependency
    @Autowired
    private UserService userService;

    // Handles user registration
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            // Registers the user and returns the new user object
            User newUser = userService.registerUser(user);
            return ResponseEntity.ok(newUser);
        } catch (Exception e) {
            // Returns error message if registration fails
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Handles user login
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        // Attempts login and retrieves token
        String token = userService.loginAndGetToken(email, password);

        if (token != null) {
            // Returns token and email if login is successful
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "email", email));
        } else {
            // Returns error if login fails
            return ResponseEntity.status(401).body("Invalid email or password");
        }
    }

    // Handles forgot password requests by sending a reset link
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            // Initiates password reset process
            userService.initiatePasswordReset(email);
            return ResponseEntity.ok("Reset link sent");
        } catch (Exception e) {
            // Returns error if process fails
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Handles password reset requests
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            String token = body.get("token");
            String newPassword = body.get("newPassword");
            // Resets the user's password
            userService.resetPassword(token, newPassword);
            return ResponseEntity.ok("Password updated successfully");
        } catch (Exception e) {
            // Returns error if reset fails
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
