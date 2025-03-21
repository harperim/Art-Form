package com.ssafy.artformcore.service;

import com.ssafy.artformcore.domain.User;
import com.ssafy.artformcore.dto.*;
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
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final TokenBlackListService tokenBlackListService;

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
    public JwtToken login(LoginRequestDto loginRequestDto) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(loginRequestDto.getEmail(), loginRequestDto.getPassword());
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        return jwtTokenProvider.generateTokenWithAuthentication(authentication);
    }

    @Override
    public void logout(String accessToken , String userId) {
        jwtTokenProvider.deleteRefreshToken(userId);
        tokenBlackListService.addBlacklist(accessToken);
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
        return null;
    }

    @Override
    public UserResponseDto getUserInfo(String userId) {
        return null;
    }

    @Override
    public TokenRefreshResponseDto refreshAccessToken(String refreshToken) {

        return null;
    }
}
