package com.d103.artformcore.controller;

import com.d103.artformcore.dto.PutReviewResponseDto;
import com.d103.artformcore.dto.review.ReviewListDto;
import com.d103.artformcore.dto.review.ReviewRequestDto;
import com.d103.artformcore.service.ReviewService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name="리뷰")
@RestController
@RequestMapping("/model")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;


    @GetMapping("/{modelId}")
    public ResponseEntity<ReviewListDto> getModelReviews(@PathVariable("modelId") Long modelId, Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        ReviewListDto reviews = reviewService.getModelReviews(modelId, userId);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping("{modelId}")
    public ResponseEntity<ReviewListDto> createReview(@PathVariable("modelId") Long modelId, @RequestBody ReviewRequestDto reviewDto, Authentication authentication) {

        Long userId = Long.valueOf(authentication.getName());
        ReviewListDto responseDto = reviewService.addReview(modelId, reviewDto, userId);
        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ReviewListDto> deleteReview(@PathVariable("reviewId") Long reviewId, Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        ReviewListDto reviewListDto = reviewService.deleteReview(reviewId,userId);
        return ResponseEntity.ok(reviewListDto);
    }
}
