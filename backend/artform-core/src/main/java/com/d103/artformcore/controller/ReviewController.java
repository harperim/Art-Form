package com.d103.artformcore.controller;

import com.d103.artformcore.dto.ResponseDto;
import com.d103.artformcore.dto.review.ReviewListDto;
import com.d103.artformcore.dto.review.ReviewRequestDto;
import com.d103.artformcore.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/model")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/{model_id}")
    public ResponseEntity<ReviewListDto> getModelReviews(@PathVariable("model_id") Long modelId) {
        ReviewListDto reviews = reviewService.getModelReviews(modelId);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping
    public ResponseEntity<ReviewListDto> createReview(@RequestBody ReviewRequestDto reviewDto) {

        return ResponseEntity.ok(createdReview);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ReviewListDto> deleteReview(@PathVariable Long reviewId) {
        ReviewListDto createdReview = reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(createdReview);
    }
}
