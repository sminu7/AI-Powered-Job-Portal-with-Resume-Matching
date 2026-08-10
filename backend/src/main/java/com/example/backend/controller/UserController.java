package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Connects to your React/Vite frontend port
public class UserController {

    private final UserService userService;

    // Constructor injection for the service
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Endpoint for user registration
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    // Endpoint for checking/logging in a user by email
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        Optional<User> userOpt = userService.getUserByEmail(email);

        // Simple password check (In production, use hashed match verification)
        if (userOpt.isPresent() && userOpt.get().getPassword() != null && userOpt.get().getPassword().equals(password)) {
            return ResponseEntity.ok(userOpt.get());
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
    }
}