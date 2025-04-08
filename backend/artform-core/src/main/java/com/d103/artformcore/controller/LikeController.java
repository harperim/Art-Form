package com.d103.artformcore.controller;


import com.d103.artformcore.dto.like.LikeIsTrueDto;
import com.d103.artformcore.dto.like.LikeListResponseDto;
import com.d103.artformcore.dto.ResponseDto;
import com.d103.artformcore.service.LikeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/model/like")
@Tag(name="좋아요 목록")
public class LikeController {

    private final LikeService likeService;

    @Operation(summary = "좋아요 클릭",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청"),
                    @ApiResponse(responseCode = "404", description = "사용자 또는 모델을 찾을 수 없음")
            })
    @PostMapping("/{modelId}")
    public ResponseEntity<ResponseDto> toggleLike(@PathVariable Long modelId, Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        ResponseDto responseDto = likeService.toggleLike(userId, modelId);// 서비스로 전달
        return ResponseEntity.ok(responseDto);
    }

    @Operation(summary = "좋아요한 모델 리스트",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
            })
    @GetMapping
    public ResponseEntity<LikeListResponseDto> likeList(Authentication authentication, @RequestParam int page) {
        Long userId = Long.valueOf(authentication.getName());
        LikeListResponseDto likeList = likeService.getLikeList(userId, page);
        return ResponseEntity.ok(likeList);
    }

    @Operation(summary = "좋아요한 여부 확인",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
            })
    @GetMapping("{modelId}")
    public ResponseEntity<LikeIsTrueDto> getIsLike(@PathVariable Long modelId, Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        LikeIsTrueDto likeList = likeService.getIsLike(userId, modelId);
        return ResponseEntity.ok(likeList);
    }
}