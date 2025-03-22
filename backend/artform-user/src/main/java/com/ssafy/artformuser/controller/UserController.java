package com.ssafy.artformuser.controller;

import com.ssafy.artformuser.dto.ResponseDto;
import com.ssafy.artformuser.dto.SignupRequestDto;
import com.ssafy.artformuser.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "유저 컨트롤러")
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    @Operation(summary = "회원가입",
            responses = {
                    @ApiResponse(responseCode = "200", description = "회원가입 성공"),
                    @ApiResponse(responseCode = "401", description = "회원가입 실패")
    })
    @PostMapping("/signup")
    public ResponseEntity<ResponseDto> signup(@Valid @RequestBody SignupRequestDto signupRequestDto) {
        userService.signup(signupRequestDto);
        return ResponseEntity.ok(new ResponseDto("회원가입 성공"));
    }

//    // 로그인
//    @Operation(summary = "로그인",
//            description = "이메일과 비밀번호로 로그인합니다.",
//            responses = {
//                    @ApiResponse(responseCode = "200", description = "로그인 성공"),
//                    @ApiResponse(responseCode = "401", description = "로그인 실패"),
//            })

}
