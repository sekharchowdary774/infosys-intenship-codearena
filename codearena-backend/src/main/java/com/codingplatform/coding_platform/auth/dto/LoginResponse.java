package com.codingplatform.coding_platform.auth.dto;




import com.codingplatform.coding_platform.common.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    private String token;

    private String tokenType;

    private String username;

    private Role role;
}
