package com.codingplatform.coding_platform.users.controller;

import java.util.List;

import com.codingplatform.coding_platform.users.dto.UserDto;
import com.codingplatform.coding_platform.users.entity.User;
import com.codingplatform.coding_platform.users.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<UserDto> getAllUsers() {

        return userService.getAllUsers()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    private UserDto convertToDto(User user) {

        UserDto dto = new UserDto();

        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());

        return dto;
    }
}