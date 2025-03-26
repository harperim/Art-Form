package com.ssafy.artformcore.controller;

import com.ssafy.artformcore.dto.*;
import com.ssafy.artformcore.security.JwtToken;
import com.ssafy.artformcore.security.JwtTokenProvider;
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

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteParent(@PathVariable("userId") Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/email-check/{email}")
    public ResponseEntity<Boolean> emailCheck(@PathVariable("email") String email) {
        Boolean isAvailable = userService.checkEmailAvailability(email);
        return ResponseEntity.ok(isAvailable);
    }

    @GetMapping("/nickname-check/{nickname}")
    public ResponseEntity<Boolean> nicknameCheck(@PathVariable("nickname") String nickname) {
        Boolean isAvailable = userService.checkNicknameAvailability(nickname);
        return ResponseEntity.ok(isAvailable);
    }

    @GetMapping
    public ResponseEntity<UserResponseDto> getMyInfo(@RequestHeader("Authorization") String authorization) {
        UserResponseDto myUserInfo = userService.getMyUserInfo();
        return ResponseEntity.ok(myUserInfo);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUser(@PathVariable("userId") Long userId) {
        UserResponseDto userInfo = userService.getUserInfo(userId);
        return ResponseEntity.ok(userInfo);
    }

}
