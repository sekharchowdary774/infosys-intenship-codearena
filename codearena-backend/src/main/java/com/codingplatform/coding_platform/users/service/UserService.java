package com.codingplatform.coding_platform.users.service;

import java.util.List;

import com.codingplatform.coding_platform.users.dto.UpdateProfileRequest;
import com.codingplatform.coding_platform.users.dto.UserDto;
import com.codingplatform.coding_platform.users.entity.User;
import com.codingplatform.coding_platform.users.repository.UserRepository;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;


    // =====================================================
    // GET ALL USERS
    // =====================================================

    public List<User> getAllUsers() {

        return userRepository.findAll();
    }


    // =====================================================
    // GET CURRENT USER
    // =====================================================

    public UserDto getCurrentUser(String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return convertToDto(user);
    }


    // =====================================================
    // UPDATE CURRENT USER
    // =====================================================

    public UserDto updateCurrentUser(
            String currentEmail,
            UpdateProfileRequest request) {

        User user = userRepository
                .findByEmail(currentEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );


        // Validate username

        if (request.getUsername() == null ||
                request.getUsername().trim().isEmpty()) {

            throw new RuntimeException(
                    "Username cannot be empty"
            );
        }


        // Validate email

        if (request.getEmail() == null ||
                request.getEmail().trim().isEmpty()) {

            throw new RuntimeException(
                    "Email cannot be empty"
            );
        }


        String newUsername =
                request.getUsername().trim();

        String newEmail =
                request.getEmail().trim();


        // Check username uniqueness

        if (!newUsername.equals(user.getUsername()) &&
                userRepository.existsByUsername(newUsername)) {

            throw new RuntimeException(
                    "Username already exists"
            );
        }


        // Check email uniqueness

        if (!newEmail.equals(user.getEmail()) &&
                userRepository.existsByEmail(newEmail)) {

            throw new RuntimeException(
                    "Email already exists"
            );
        }


        // Update user

        user.setUsername(newUsername);

        user.setEmail(newEmail);


        User updatedUser =
                userRepository.save(user);


        return convertToDto(updatedUser);
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