package com.ssafy.artformuser.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.SQLException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(JwtAuthenticationException.class)
    public ResponseEntity<String> handleInvalidateTokenException(Exception e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다: " + e.getMessage());
    }

    @ExceptionHandler({AuthenticationException.class, InvalidTokenException.class} )
    public ResponseEntity<String> handleAuthenticationException(AuthenticationException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 실패" + e.getMessage());
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
    public ResponseEntity<String> handleBadCredentialsException(BadCredentialsException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("아이디 또는 비밀번호가 일치하지 않습니다.");
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleUserNotFoundException(UserNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }


}
