package com.codingplatform.coding_platform.auth.service;

import com.codingplatform.coding_platform.auth.dto.LoginRequest;
import com.codingplatform.coding_platform.auth.dto.LoginResponse;
import com.codingplatform.coding_platform.auth.dto.RegisterRequest;
import com.codingplatform.coding_platform.auth.dto.RegisterResponse;
import com.codingplatform.coding_platform.common.Role;
import com.codingplatform.coding_platform.security.JwtService;
import com.codingplatform.coding_platform.users.repository.UserRepository;
import com.codingplatform.coding_platform.users.entity.User;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;


    // REGISTER
    public RegisterResponse register(RegisterRequest request) {

        // Check email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Check username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Create User object
        User user = new User();

        user.setUsername(request.getUsername());

        user.setEmail(request.getEmail());

        // Encrypt password
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Default role
        user.setRole(Role.USER);

        // Save user
        userRepository.save(user);

        return new RegisterResponse(
                "User registered successfully"
        );
    }


    // LOGIN
    public LoginResponse login(LoginRequest request) {

        // Find user by email
        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(
                        () -> new RuntimeException(
                                "Invalid email or password"
                        )
                );

        // Check password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        // Generate JWT
        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(
                token,
                "Bearer",
                user.getUsername(),
                user.getRole()
        );
    }
}
