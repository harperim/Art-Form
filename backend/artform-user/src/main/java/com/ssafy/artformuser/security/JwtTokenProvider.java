package com.ssafy.artformuser.security;

import com.ssafy.artformuser.dao.RedisDao;
import com.ssafy.artformuser.exception.JwtAuthenticationException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Duration;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    private final Key key;
    private final CustomUserDetailsService userDetailsService; // 타입 수정
    private final RedisDao redisDao;

    @Value("${jwt.access-token.expire-time}")
    private long ACCESS_TOKEN_EXPIRE_TIME;

    @Value("${jwt.refresh-token.expire-time}")
    private long REFRESH_TOKEN_EXPIRE_TIME;

    private static final String GRANT_TYPE = "Bearer";

    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey, CustomUserDetailsService userDetailsService, RedisDao redisDao) {
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

        Long userId = ((CustomUserDetails) authentication.getPrincipal()).getUserId();
        return generateToken(now, String.valueOf(userId), authorities);
    }

    private JwtToken generateToken(long now, String userId, String authorities) {
        Date accessTokenExpireDate = new Date(now + ACCESS_TOKEN_EXPIRE_TIME);
        String accessToken = generateAccessToken(userId, authorities, accessTokenExpireDate);
        Date refreshTokenExpireDate = new Date(now + REFRESH_TOKEN_EXPIRE_TIME);
        String refreshToken = generateRefreshToken(userId, refreshTokenExpireDate);

        // redis에 저장
        redisDao.setValues(userId, refreshToken, Duration.ofMinutes(REFRESH_TOKEN_EXPIRE_TIME));

        return JwtToken.builder()
                .grantType(GRANT_TYPE)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    // accessToken 생성
    public String generateAccessToken(String userId, String authorities, Date expireDate) {

        return Jwts.builder()
                .setSubject(String.valueOf(userId)) // 토큰 제목
                .claim("auth", authorities) // 권한 정보
                .setExpiration(expireDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Refresh Token 생성
    public String generateRefreshToken(String userId, Date expireDate) {

        String refreshToken = Jwts.builder()
                .setSubject(String.valueOf(userId))
                .setExpiration(expireDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        redisDao.setValues(userId, refreshToken, Duration.ofMinutes(REFRESH_TOKEN_EXPIRE_TIME));
        return refreshToken;
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

    public Long getUserIdFromToken(String token) {
        Claims claims = parseClaims(token);
        return Long.parseLong(claims.getSubject());
    }



    // 액세스 토큰 검증
    public Boolean validateAccessToken(String token) {

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)// 만료확인
                    .getBody();

            String auth = claims.get("auth", String.class);
            log.info("auth={}", auth);
            return auth != null;
        } catch (SignatureException e) {
            log.error("Invalid JWT Signature");
        } catch (SecurityException | MalformedJwtException e) {
            log.warn("Invalid JWT Token", e);
        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT Token", e);
        } catch (UnsupportedJwtException e) {
            log.warn("Unsupported JWT Token", e);
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims string is empty", e);
        }
        return false;
    }

    // 리프레시 토큰 검증
    public Boolean validateRefreshToken(String token) {

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)// 만료확인
                    .getBody();

            String userId = claims.getSubject();
            String refreshToken = (String) redisDao.getValues(userId);

            return refreshToken != null && refreshToken.equals(token);
        } catch (SignatureException e) {
            log.error("Invalid JWT Signature");
        } catch (SecurityException | MalformedJwtException e) {
            log.warn("Invalid JWT Token", e);
        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT Token", e);
        } catch (UnsupportedJwtException e) {
            log.warn("Unsupported JWT Token", e);
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims string is empty", e);
        }
        return false;
    }

    // 인증된 사용자 정보
    public Authentication getAuthentication(String token){

        Claims claims = parseClaims(token);
        if (claims.get("auth") == null) {
            throw new JwtAuthenticationException("권한 정보가 없는 토큰입니다");
        }

        // Claim에서 권한 정보 가져오기
        Collection<? extends GrantedAuthority> authorities = Arrays.stream(claims.get("auth").toString().split(","))
                .map(SimpleGrantedAuthority::new)
                .toList();

        Long userId = Long.parseLong(claims.getSubject());

        // 사용자 ID로 UserDetails 조회 (사용자 정보를 DB에서 새로 가져옴)
        UserDetails userDetails = new User(claims.getSubject(), "", authorities);

        return new UsernamePasswordAuthenticationToken(userDetails, "", authorities);
    }

    public long getAccessTokenExpireTime() {
        return ACCESS_TOKEN_EXPIRE_TIME;
    }

    public long getRefreshTokenExpireTime() {
        return REFRESH_TOKEN_EXPIRE_TIME;
    }
}
