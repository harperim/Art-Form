package com.d103.artformcore.controller;

import com.d103.artformcore.dto.review.ReviewListDto;
import com.d103.artformcore.dto.review.ReviewRequestDto;
import com.d103.artformcore.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name="리뷰")
@RestController
@RequestMapping("/model/review")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "해당 모델의 리뷰 조회",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
            })
    @GetMapping("/{modelId}")
    public ResponseEntity<ReviewListDto> getModelReviews(@PathVariable("modelId") Long modelId, Authentication authentication,
                                                         HttpServletRequest request) {

        Long userId = Long.valueOf(authentication.getName());
        String authHeader = request.getHeader("Authorization");

        ReviewListDto reviews = reviewService.getModelReviews(modelId, userId, authHeader);
        return ResponseEntity.ok(reviews);
    }

    @Operation(summary = "리뷰 등록",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
            })
    @PostMapping("/{modelId}")
    public ResponseEntity<ReviewListDto> createReview(@PathVariable("modelId") Long modelId, @RequestBody ReviewRequestDto reviewDto, Authentication authentication,
                                                      HttpServletRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        String authHeader = request.getHeader("Authorization");

        ReviewListDto responseDto = reviewService.addReview(modelId, reviewDto, userId, authHeader);
        return ResponseEntity.ok(responseDto);
    }

    @Operation(summary = "리뷰 삭제",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
            })
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ReviewListDto> deleteReview(@PathVariable("reviewId") Long reviewId, Authentication authentication,
                                                      HttpServletRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        String authHeader = request.getHeader("Authorization");
        ReviewListDto reviewListDto = reviewService.deleteReview(reviewId,userId,authHeader);
        return ResponseEntity.ok(reviewListDto);
    }
}
