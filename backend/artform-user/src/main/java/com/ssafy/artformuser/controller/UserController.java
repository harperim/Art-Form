package com.ssafy.artformuser.controller;

import com.ssafy.artformuser.dto.*;
import com.ssafy.artformuser.dto.ResponseDto;
import com.ssafy.artformuser.dto.SignupRequestDto;
import com.ssafy.artformuser.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Tag(name = "유저 컨트롤러")
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    @Operation(summary = "회원가입",
            responses = {
                    @ApiResponse(responseCode = "200", description = "회원가입 성공"),
                    @ApiResponse(responseCode = "500", description = "회원가입 실패"),
                    @ApiResponse(responseCode = "409", description = "중복된 이메일 / 닉네임")
            })
    @PostMapping("/signup")
    public ResponseEntity<ResponseDto> signup(@Valid @RequestBody SignupRequestDto signupRequestDto) {
        userService.signup(signupRequestDto);
        return ResponseEntity.ok(new ResponseDto("회원가입 성공"));
    }
    @Operation(summary = "회원탈퇴",
            responses = {
                    @ApiResponse(responseCode = "200", description = "회원탈퇴"),
                    @ApiResponse(responseCode = "500", description = "회원탈퇴 실패"),
            })
    @DeleteMapping("/{userId}")
    public ResponseEntity<ResponseDto> deleteUser(@PathVariable("userId") Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(new ResponseDto("회원 탈퇴 성공"));
    }

    @Operation(summary = "이메일 중복 체크",
            responses = {
                    @ApiResponse(responseCode = "200", description = "중복체크 성공"),
                    @ApiResponse(responseCode = "500", description = "중복체크 실패"),
            })
    @GetMapping("/email-check/{email}")
    public ResponseEntity<ResponseCheckDto> emailCheck(@PathVariable("email") String email) {
        return ResponseEntity.ok(userService.checkEmailAvailability(email));
    }

    @Operation(summary = "닉네임 중복 체크",
            responses = {
                    @ApiResponse(responseCode = "200", description = "중복체크 성공"),
                    @ApiResponse(responseCode = "500", description = "중복체크 실패"),
            })
    @GetMapping("/nickname-check/{nickname}")
    public ResponseEntity<ResponseCheckDto> nicknameCheck(@PathVariable("nickname") String nickname) {
        return ResponseEntity.ok(userService.checkNicknameAvailability(nickname));
    }

    @Operation(summary = "내 정보 조회",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공"),
                    @ApiResponse(responseCode = "404", description = "유저 정보를 찾을 수 없습니다."),
                    @ApiResponse(responseCode = "500", description = "조회 실패"),
            })
    @GetMapping
    public ResponseEntity<UserResponseDto> getMyInfo() {
        UserResponseDto myUserInfo = userService.getMyUserInfo();
        return ResponseEntity.ok(myUserInfo);
    }

    @Operation(summary = "유저 정보 조회",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공"),
                    @ApiResponse(responseCode = "404", description = "유저 정보를 찾을 수 없습니다."),
                    @ApiResponse(responseCode = "500", description = "조회 실패"),
            })
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUser(@PathVariable("userId") Long userId) {
        UserResponseDto userInfo = userService.getUserInfo(userId);
        return ResponseEntity.ok(userInfo);
    }

    @Operation(summary = "유저 이름 목록 조회",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공"),
                    @ApiResponse(responseCode = "500", description = "조회 실패"),
            })
    @GetMapping("/name/{reviewUserIdList}")
    public ResponseEntity<ResponseNameList> getUser(@PathVariable("reviewUserIdList") List<Long> reviewUserIdList) {
        ResponseNameList userInfo = userService.getUserNameList(reviewUserIdList);
        return ResponseEntity.ok(userInfo);
    }
}
