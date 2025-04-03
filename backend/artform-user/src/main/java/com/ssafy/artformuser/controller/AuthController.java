package com.ssafy.artformuser.controller;

import com.ssafy.artformuser.dto.*;
import com.ssafy.artformuser.security.JwtToken;
import com.ssafy.artformuser.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@Tag(name = "인증 API")
@RestController
@RequestMapping("/user/auth")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "로그인",
            responses = {
                    @ApiResponse(responseCode = "200", description = "로그인 성공"),
                    @ApiResponse(responseCode = "401", description = "로그인 실패")
            })
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto loginRequestDto) {
        JwtToken jwtToken = authService.login(loginRequestDto);
        LoginResponseDto loginResponseDto = new LoginResponseDto("로그인 성공",jwtToken);
        return ResponseEntity.ok(loginResponseDto);
    }

    // 로그아웃
    @Operation(summary = "로그아웃")
    @PostMapping("/logout")
    public ResponseEntity<ResponseDto> logout(@RequestHeader("Authorization") String authorization) {
        String accessToken = authorization.substring(7);
        ResponseDto responseDto = authService.logout(accessToken);

        return ResponseEntity.ok(responseDto);
    }

    @Operation(summary = "액세스 토큰 재발급",
            responses = {
                    @ApiResponse(responseCode = "200", description = "재발급 성공"),
                    @ApiResponse(responseCode = "400", description = "재발급 실패")
            })

    @PostMapping("/oauth/accesstoken")
    public ResponseEntity<TokenRefreshResponseDto> refreshAccessToken(@Valid @RequestBody TokenRefreshRequestDto requestDto) {
        TokenRefreshResponseDto responseDto = authService.refreshAccessToken(requestDto.getRefreshToken());
        return ResponseEntity.ok(responseDto);
    }
}
