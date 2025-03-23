package com.ssafy.artformcore.service;

import com.ssafy.artformcore.dto.LoginRequestDto;
import com.ssafy.artformcore.dto.TokenRefreshResponseDto;
import com.ssafy.artformcore.exception.InvalidTokenException;
import com.ssafy.artformcore.security.JwtToken;
import com.ssafy.artformcore.security.JwtTokenProvider;
import com.ssafy.artformcore.security.TokenBlackListService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlackListService tokenBlackListService;

    @Override
    public JwtToken login(LoginRequestDto loginDto) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(loginDto.getEmail(),loginDto.getPassword());

        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        return jwtTokenProvider.generateTokenWithAuthentication(authentication);
    }

    @Override
    public void logout(String accessToken, String userId) {
        jwtTokenProvider.deleteRefreshToken(userId);
        tokenBlackListService.addBlacklist(accessToken);
    }

    @Override
    public TokenRefreshResponseDto refreshAccessToken(String refreshToken) {

        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            throw new InvalidTokenException("유효하지 않은 Refresh Token입니다");
        }



    }
}
