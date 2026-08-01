package com.codingplatform.coding_platform.service;

import com.codingplatform.coding_platform.dto.LoginRequest;
import com.codingplatform.coding_platform.dto.LoginResponse;
import com.codingplatform.coding_platform.dto.RegisterRequest;
import com.codingplatform.coding_platform.dto.RegisterResponse;

public interface AuthService {

    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

}