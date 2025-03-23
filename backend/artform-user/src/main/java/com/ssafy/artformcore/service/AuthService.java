package com.ssafy.artformcore.service;

import com.ssafy.artformcore.dto.LoginRequestDto;
import com.ssafy.artformcore.dto.SignupRequestDto;
import com.ssafy.artformcore.dto.TokenRefreshResponseDto;
import com.ssafy.artformcore.security.JwtToken;

public interface AuthService {

    JwtToken login(LoginRequestDto loginRequestDto);

    void logout(String logoutRequestDto, String email);

    TokenRefreshResponseDto refreshAccessToken(String refreshToken);
}
