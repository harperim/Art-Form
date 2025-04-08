package com.d103.artformcore.config;

import org.springframework.core.task.TaskDecorator;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityContextTaskDecorator implements TaskDecorator {
    @Override
    public Runnable decorate(Runnable runnable) {
        SecurityContext context = SecurityContextHolder.getContext();
        System.out.println("원본 스레드 인증 정보: " +
                (context.getAuthentication() != null ? context.getAuthentication().getName() : "없음"));

        return () -> {
            try {
                SecurityContextHolder.setContext(context);
                System.out.println("비동기 스레드 인증 정보: " +
                        (SecurityContextHolder.getContext().getAuthentication() != null ?
                                SecurityContextHolder.getContext().getAuthentication().getName() : "없음"));

                runnable.run();
            } finally {
                SecurityContextHolder.clearContext();
            }
        };
    }
}
