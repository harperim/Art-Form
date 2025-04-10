package com.ssafy.artformuser.service;

import com.ssafy.artformuser.dto.LoginRequestDto;
import com.ssafy.artformuser.dto.ResponseDto;
import com.ssafy.artformuser.dto.TokenRefreshResponseDto;
import com.ssafy.artformuser.security.JwtToken;

public interface AuthService {

    JwtToken login(LoginRequestDto loginRequestDto);

    ResponseDto logout(String accessToken);

    TokenRefreshResponseDto refreshAccessToken(String refreshToken);
}
