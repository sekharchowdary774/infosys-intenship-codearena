package com.codingplatform.coding_platform.dto;



import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {

    private String token;

    private String type;

    private Long id;

    private String fullName;

    private String email;

    private String role;

}
