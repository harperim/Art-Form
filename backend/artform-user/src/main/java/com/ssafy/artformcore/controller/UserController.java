package com.ssafy.artformcore.controller;

import com.ssafy.artformcore.dto.LoginRequestDto;
import com.ssafy.artformcore.dto.LoginResponseDto;
import com.ssafy.artformcore.dto.ResponseDto;
import com.ssafy.artformcore.dto.SignupRequestDto;
import com.ssafy.artformcore.security.JwtToken;
import com.ssafy.artformcore.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@Tag(name = "유저 컨트롤러")
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    @Operation(summary = "회원가입",
            responses = {
                    @ApiResponse(responseCode = "200", description = "회원가입 성공"),
                    @ApiResponse(responseCode = "400", description = "회원가입 실패")
    })
    @PostMapping("/signup")
    public ResponseEntity<ResponseDto> signup(@Valid @RequestBody SignupRequestDto signupRequestDto) {
        userService.signup(signupRequestDto);
        return ResponseEntity.ok(new ResponseDto("회원가입 성공"));
    }

    @Operation(summary = "로그인",
            responses = {
                    @ApiResponse(responseCode = "200", description = "로그인 성공"),
                    @ApiResponse(responseCode = "401", description = "로그인 실패")
            })
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto loginRequestDto) {
        JwtToken jwtToken = userService.login(loginRequestDto);
        LoginResponseDto loginResponseDto = new LoginResponseDto("로그인 성공",jwtToken);
        return ResponseEntity.ok(loginResponseDto);
    }

    // 로그아웃
    @Operation(summary = "부모 로그아웃")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authorization, @RequestBody Map<String, String> map) {
        String email = map.get("email");
        String accessToken = authorization.substring(7);
        userService.logout(accessToken, email);

        return ResponseEntity.ok().build();
    }


}
