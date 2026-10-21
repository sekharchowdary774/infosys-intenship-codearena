package com.codingplatform.coding_platform.users.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {

    private String username;

    private String email;
}