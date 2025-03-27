package com.d103.artformcore.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;

@Slf4j
public class RequestLoggingFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // ContentCachingRequestWrapper로 요청 래핑
        ContentCachingRequestWrapper wrappedRequest =
                new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse =
                new ContentCachingResponseWrapper(response);

        // 요청 처리 전 - 인증 여부 확인
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticated = authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());
        try {
            // 다음 필터 실행
            filterChain.doFilter(wrappedRequest, wrappedResponse);
        } finally {
            // 본문은 필터 체인 실행 후에 읽어야 함
            String requestBody = new String(wrappedRequest.getContentAsByteArray(),
                    wrappedRequest.getCharacterEncoding());
            if (isAuthenticated) {
                log.debug("\n-------------------- \uD83D\uDD36 요청 발생 \uD83D\uDD36 --------------------" +
                                "\n[Authenticated]\nRequest uri\t: {} '{}'\nUser\t\t: {}\nStatus\t\t: {}\nUserAgent\t: {}\nRequest Body:\n{}" +
                                "\n----------------------------------------------------------",
                        wrappedRequest.getMethod(),
                        wrappedRequest.getRequestURI(),
                        authentication.getName(),
                        wrappedResponse.getStatus(),
                        wrappedRequest.getHeader("User-Agent"),
                        requestBody);
            } else {
                log.debug("\n-------------------- \uD83D\uDD36 요청 발생 \uD83D\uDD36 --------------------" +
                                "\n[Unauthenticated]\nRequest uri\t: {} '{}'\nStatus\t\t: {}\nUserAgent\t: {}\nRequest Body:\n{}" +
                                "\n----------------------------------------------------------",
                        wrappedRequest.getMethod(),
                        wrappedRequest.getRequestURI(),
                        wrappedResponse.getStatus(),
                        wrappedRequest.getHeader("User-Agent"),
                        requestBody);
            }
            // 응답 본문 복사 - 중요!
            wrappedResponse.copyBodyToResponse();
        }
    }
}
