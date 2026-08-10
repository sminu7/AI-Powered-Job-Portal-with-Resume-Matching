package com.example.backend.service;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    // Constructor injection for the repository
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Logic to register a new user
    public User registerUser(User user) {
        // Here you would normally hash the password before saving
        return userRepository.save(user);
    }

    // Logic to find a user by email
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}