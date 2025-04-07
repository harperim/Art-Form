package com.d103.artformcore.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
@Slf4j
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtTokenValidator jwtTokenValidator;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        String method = request.getMethod();
        if (!uri.contains("/actuator/prometheus")) {
            log.info("요청 정보: URI={}, METHOD={}", uri, method);

            String accessToken = getJwtFromRequest(request);

            // 토큰 가지고 있을 경우
            if (accessToken != null) {
                if (jwtTokenValidator.validateAccessToken(accessToken)) {
                    log.info("토큰 검증 성공");
                    Authentication authentication = jwtTokenValidator.getAuthentication(accessToken);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    log.warn("토큰 검증 실패");
                }
            } else {
                log.warn("토큰이 없음");
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
