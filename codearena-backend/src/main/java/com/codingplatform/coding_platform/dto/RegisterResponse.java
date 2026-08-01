package com.codingplatform.coding_platform.dto;



import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegisterResponse {

    private Long id;

    private String fullName;

    private String email;

}
