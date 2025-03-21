package com.ssafy.artformcore.security;

import com.ssafy.artformcore.dao.RedisDao;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Duration;
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private final Key key;
    private final UserDetailsService userDetailsService;
    private final RedisDao redisDao;

    @Value("${jwt.access-token.expire-time}")
    private long ACCESS_TOKEN_EXPIRE_TIME;

    @Value("${jwt.refresh-token.expire-time}")
    private long REFRESH_TOKEN_EXPIRE_TIME;

    private static final String GRANT_TYPE = "Bearer";

    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey, UserDetailsService userDetailsService, RedisDao redisDao) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        this.userDetailsService = userDetailsService;
        this.redisDao = redisDao;
    }

    public JwtToken generateTokenWithAuthentication(Authentication authentication) {
        // 권한 가져오기
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        long now = (new Date()).getTime();
        String email = authentication.getName();
        return generateToken(now, email, authorities);
    }

    private JwtToken generateToken(long now, String email, String authorities) {
        Date accessTokenExpireDate = new Date(now + ACCESS_TOKEN_EXPIRE_TIME);
        String accessToken = generateAccessToken(email, authorities, accessTokenExpireDate);
        Date refreshTokenExpireDate = new Date(now + REFRESH_TOKEN_EXPIRE_TIME);
        String refreshToken = generateAccessToken(email, authorities, refreshTokenExpireDate);

        // redis에 저장
        redisDao.setValues(email, refreshToken, Duration.ofMinutes(REFRESH_TOKEN_EXPIRE_TIME));

        return JwtToken.builder()
                .grantType(GRANT_TYPE)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    // accessToken 생성
    private String generateAccessToken(String email, String authorities, Date expireDate) {
        return Jwts.builder()
                .setSubject(email) // 토큰 제목
                .claim("auth", authorities) // 권한 정보
                .setExpiration(expireDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Refresh Token 생성
    private String generateRefreshToken(String email, Date expireDate) {
        return Jwts.builder()
                .setSubject(email)
                .setExpiration(expireDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 복호화
    public Claims parseClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token) // 토큰 검증 & 파싱
                    .getBody();
        } catch (ExpiredJwtException e) {
            return e.getClaims();
        }
    }

    // 리프레시 토큰 삭제
    public void deleteRefreshToken(String email) {
        if (email == null) {
            throw new IllegalArgumentException("userId cannot be null");
        }
        redisDao.deleteValues(email);
    }

    public void getAuthentication(String token) {
        Claims claims = parseClaims(token);
    }
}
