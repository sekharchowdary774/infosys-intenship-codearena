package com.codingplatform.coding_platform.users.controller;

import java.util.List;

import com.codingplatform.coding_platform.users.dto.UpdateProfileRequest;
import com.codingplatform.coding_platform.users.dto.UserDto;
import com.codingplatform.coding_platform.users.entity.User;
import com.codingplatform.coding_platform.users.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    // =====================================================
    // GET ALL USERS
    // =====================================================

    @GetMapping
    public List<UserDto> getAllUsers() {

        return userService.getAllUsers()
                .stream()
                .map(this::convertToDto)
                .toList();
    }


    // =====================================================
    // GET CURRENT USER
    // =====================================================

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(
            Authentication authentication) {

        return ResponseEntity.ok(
                userService.getCurrentUser(
                        authentication.getName()
                )
        );
    }


    // =====================================================
    // UPDATE CURRENT USER
    // =====================================================

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateCurrentUser(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {

        return ResponseEntity.ok(
                userService.updateCurrentUser(
                        authentication.getName(),
                        request
                )
        );
    }


    // =====================================================
    // CONVERT USER → DTO
    // =====================================================

    private UserDto convertToDto(User user) {

        UserDto dto = new UserDto();

        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());

        return dto;
    }
}