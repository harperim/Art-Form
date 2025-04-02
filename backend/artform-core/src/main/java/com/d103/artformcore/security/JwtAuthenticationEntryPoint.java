package com.d103.artformcore.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Enumeration;

@Slf4j
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        // Authorization 헤더 확인
        String uri = request.getRequestURI();
        String method = request.getMethod();
        String bearerToken = request.getHeader("Authorization");

        log.info("인증 실패 요청 정보: URI={}, METHOD={}", uri, method);
        log.info("인증 실패 시 Authorization 헤더: {}", bearerToken);

        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            log.info("헤더 {}: {}", headerName, request.getHeader(headerName));
        }
        // 헤더확인 끝

        String errorMessage;
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            errorMessage = "액세스 토큰이 없거나 유효한 형식이 아닙니다.";
            log.error("인증 실패: 액세스 토큰 없음");
        } else {
            errorMessage = "유효하지 않은 액세스 토큰입니다.";
            log.error("인증 실패: 유효하지 않은 토큰 - {}", authException.getMessage());
        }

        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("{\"error\": \"인증 실패\", \"message\": \"" + errorMessage + "\"}");
    }
}
