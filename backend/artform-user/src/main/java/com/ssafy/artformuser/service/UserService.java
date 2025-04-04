package com.ssafy.artformuser.service;
import com.ssafy.artformuser.dto.*;
import com.ssafy.artformuser.dto.SignupRequestDto;

public interface UserService {

    void signup(SignupRequestDto signupRequestDto);

    void deleteUser(Long userId);

    ResponseCheckDto checkEmailAvailability(String email);

    ResponseCheckDto checkNicknameAvailability(String nickname);

    UserResponseDto getMyUserInfo();

    UserResponseDto getUserInfo(Long userId);
}
