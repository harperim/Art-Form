package com.d103.artformcore.security;

import jakarta.persistence.Entity;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtTokenValidator jwtTokenValidator;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String accessToken = getJwtFromRequest(request);
        System.out.println("!!!!!!!!!accessToken: " + accessToken);
        // 토큰 가지고 있을 경우
        if (accessToken != null) {
            // 토큰 검증
            if (jwtTokenValidator.validateAccessToken(accessToken)) {
                // Authentication 객체를 가져와 SecurityContext에 저장
                Authentication authentication = jwtTokenValidator.getAuthentication(accessToken);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        filterChain.doFilter(request, response);
    }

    // 액세스 토큰 받아오기
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            // "Bearer " 다음의 토큰 부분만 반환
            return bearerToken.substring(7);
        }
        return null;
    }
}
