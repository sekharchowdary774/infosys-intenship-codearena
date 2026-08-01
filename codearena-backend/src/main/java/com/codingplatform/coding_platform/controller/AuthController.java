package com.codingplatform.coding_platform.controller;

import com.codingplatform.coding_platform.dto.LoginRequest;
import com.codingplatform.coding_platform.dto.LoginResponse;
import com.codingplatform.coding_platform.dto.RegisterRequest;
import com.codingplatform.coding_platform.dto.RegisterResponse;
import com.codingplatform.coding_platform.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
@Tag(name = "Authentication")

public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register User")
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return new ResponseEntity<>(
                authService.register(request),
                HttpStatus.CREATED
        );
    }

    @Operation(summary = "Login User")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }
}