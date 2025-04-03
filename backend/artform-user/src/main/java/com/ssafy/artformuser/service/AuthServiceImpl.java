package com.ssafy.artformuser.service;

import com.ssafy.artformuser.dao.RedisDao;
import com.ssafy.artformuser.dto.JwtTokenDto;
import com.ssafy.artformuser.dto.LoginRequestDto;
import com.ssafy.artformuser.dto.ResponseDto;
import com.ssafy.artformuser.dto.TokenRefreshResponseDto;
import com.ssafy.artformuser.exception.InvalidTokenException;
import com.ssafy.artformuser.exception.JwtAuthenticationException;
import com.ssafy.artformuser.security.JwtToken;
import com.ssafy.artformuser.security.JwtTokenProvider;
import com.ssafy.artformuser.security.TokenBlackListService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
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
    private final RedisDao redisDao;

    @Override
    public JwtToken login(LoginRequestDto loginDto) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(loginDto.getEmail(),loginDto.getPassword());

        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        return jwtTokenProvider.generateTokenWithAuthentication(authentication);
    }

    @Override
    public ResponseDto logout(String accessToken) {
        String userId = String.valueOf(jwtTokenProvider.getUserIdFromToken(accessToken));
        jwtTokenProvider.deleteRefreshToken(userId);
        tokenBlackListService.addBlacklist(accessToken);
        return new ResponseDto("로그아웃 성공!");
    }

    @Override
    public TokenRefreshResponseDto refreshAccessToken(String refreshToken) {

        if (tokenBlackListService.isBlacklisted(refreshToken)) {
            throw new JwtAuthenticationException("이미 무효화된 토큰입니다. 다시 로그인해주세요.");
        }

        if (refreshToken == null || !jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw new InvalidTokenException("유효하지 않은 Refresh Token입니다");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);

        String savedRefreshToken = (String) redisDao.getValues(String.valueOf(userId));

        if (savedRefreshToken == null) {
            throw new JwtAuthenticationException("리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.");
        }

        if (!savedRefreshToken.equals(refreshToken)) {
            tokenBlackListService.addBlacklist(refreshToken);
            throw new JwtAuthenticationException("유효하지 않은 리프레시 토큰입니다. 보안을 위해 해당 토큰은 무효화되었습니다.");
        }

        Claims claims = jwtTokenProvider.parseClaims(refreshToken);
        String authorities = claims.get("auth", String.class);

        // 새 액세스 토큰만 생성
        long now = System.currentTimeMillis();
        Date accessTokenExpireDate = new Date(now + jwtTokenProvider.getAccessTokenExpireTime());
        String accessToken = jwtTokenProvider.generateAccessToken(String.valueOf(userId), authorities, accessTokenExpireDate);

        // 새 리프래시 토큰 생성
        Date refreshTokenExpireDate = new Date(now + jwtTokenProvider.getRefreshTokenExpireTime());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(String.valueOf(userId), refreshTokenExpireDate);

        // 기존 리프래시 토큰 블랙리스트에 추가 (선택적)
        tokenBlackListService.addBlacklist(refreshToken);

        JwtTokenDto jwtTokenDto = JwtTokenDto.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .build();

        return TokenRefreshResponseDto.builder()
                .msg("재발급 성공")
                .data(jwtTokenDto)
                .build();

    }
}
