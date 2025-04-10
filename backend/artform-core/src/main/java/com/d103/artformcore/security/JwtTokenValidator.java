package com.d103.artformcore.security;

import com.d103.artformcore.exception.JwtAuthenticationException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenValidator {

    private Key key;

    public JwtTokenValidator(@Value("${jwt.secret}") String secretKey) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
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
            String sub = claims.getSubject();
            Date expiration = claims.getExpiration();

//            log.info("토큰 파싱 성공: subject={}, auth={}, expiration={}", sub, auth, expiration);

            return auth != null;
        } catch (SignatureException e) {
            log.error("Invalid JWT Signature: {}", e.getMessage());
        } catch (SecurityException | MalformedJwtException e) {
            log.warn("Invalid JWT Token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT Token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("Unsupported JWT Token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims string is empty: {}", e.getMessage());
        } catch (Exception e) {
            log.error("기타 예외 발생: {}", e.getMessage());
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

        UserDetails userDetails = new User(claims.getSubject(), "", authorities);

        return new UsernamePasswordAuthenticationToken(userDetails, "", authorities);
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
}
