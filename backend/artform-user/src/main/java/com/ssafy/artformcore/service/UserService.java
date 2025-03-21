package com.ssafy.artformcore.service;

import com.ssafy.artformcore.dto.*;
import com.ssafy.artformcore.security.JwtToken;

public interface UserService {

    void signup(SignupRequestDto signupRequestDto);

    JwtToken login(LoginRequestDto loginRequestDto);

    void logout(String logoutRequestDto, String email);

    void deleteUser(Long userId);

    boolean checkEmailAvailability(String email);

    boolean checkNicknameAvailability(String nickname);

    UserResponseDto getMyUserInfo();

    UserResponseDto getUserInfo(String userId);

    TokenRefreshResponseDto refreshAccessToken(String refreshToken);

}
