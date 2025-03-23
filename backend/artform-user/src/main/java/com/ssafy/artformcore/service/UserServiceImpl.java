package com.ssafy.artformcore.service;

import com.ssafy.artformcore.domain.User;
import com.ssafy.artformcore.dto.*;
import com.ssafy.artformcore.exception.AuthenticationException;
import com.ssafy.artformcore.exception.UserNotFoundException;
import com.ssafy.artformcore.repository.UserRepository;
import com.ssafy.artformcore.security.JwtToken;
import com.ssafy.artformcore.security.JwtTokenProvider;
import com.ssafy.artformcore.security.TokenBlackListService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.token.TokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void signup(SignupRequestDto signupDto) {
        String encodePassword = passwordEncoder.encode(signupDto.getPassword());
        User user = User.builder()
                .email(signupDto.getEmail())
                .password(encodePassword)
                .nickname(signupDto.getNickname())
                .build();
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(()-> new UserNotFoundException("User not found"));
        user.setDeleted(true);
    }

    @Override
    public boolean checkEmailAvailability(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Override
    public boolean checkNicknameAvailability(String nickname) {
        return userRepository.findByNickname(nickname).isPresent();
    }

    @Override
    public UserResponseDto getMyUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationException("인증 정보가 없습니다.");
        }

        // accessToken에서 추출한 userId 가져오기
        Long userId = Long.valueOf(authentication.getName());

        // DB에서 사용자 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        UserInfoDto userInfoDto = UserInfoDto.builder()
                .userId(user.getId().toString())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .build();

        return UserResponseDto.builder()
                .msg("조회 성공")
                .data(userInfoDto)
                .build();
    }

    @Override
    public UserResponseDto getUserInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        UserInfoDto userInfoDto = UserInfoDto.builder()
                .userId(user.getId().toString())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .build();

        return UserResponseDto.builder()
                .msg("조회 성공")
                .data(userInfoDto)
                .build();
    }

    @Override
    public TokenRefreshResponseDto refreshAccessToken(String refreshToken) {

        return null;
    }
}
