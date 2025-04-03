package com.ssafy.artformuser.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(JwtAuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleInvalidateTokenException(Exception e) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "token_expired");
        response.put("message", "인증 토큰이 만료되었습니다: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<Map<String, String>> handleInvalidTokenException(InvalidTokenException e) {
        Map<String, String> response = new HashMap<>();
        response.put("msg", "유효하지 않은 토큰입니다: " + e.getMessage());
        response.put("error", "invalid_token");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthenticationException(AuthenticationException e) {
        Map<String, String> response = new HashMap<>();
        response.put("msg", "인증 실패: " + e.getMessage());
        response.put("error", "authentication_failed");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDataIntegrityViolationException(DataIntegrityViolationException e) {
        if (e.getMessage() != null && e.getMessage().contains("users_email_key")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("중복된 이메일입니다");
        }
        if (e.getMessage() != null && e.getMessage().contains("users_nickname_key")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("중복된 닉네임입니다");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("데이터 무결성 위반: " + e.getMessage());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<String> handleConstraintViolationException(ConstraintViolationException e) {
        if (e.getMessage() != null && e.getMessage().contains("올바른 형식의 이메일 주소여야 합니다")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("올바른 이메일 형식이 아닙니다");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("입력값 검증 실패: " + e.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentialsException(BadCredentialsException e) {
        Map<String, String> response = new HashMap<>();
        response.put("msg", "아이디 또는 비밀번호가 일치하지 않습니다.");
        response.put("error", "invalid_credentials");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleUserNotFoundException(UserNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }


}
