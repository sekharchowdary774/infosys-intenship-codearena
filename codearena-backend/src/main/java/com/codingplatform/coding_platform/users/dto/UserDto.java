package com.codingplatform.coding_platform.users.dto;



import com.codingplatform.coding_platform.common.Role;
import lombok.Data;

@Data
public class UserDto {

    private Long id;

    private String username;

    private String email;

    private Role role;

}
