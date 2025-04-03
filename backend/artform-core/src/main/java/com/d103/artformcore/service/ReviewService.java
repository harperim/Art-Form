package com.d103.artformcore.service;

import com.d103.artformcore.dto.ResponseDto;
import com.d103.artformcore.dto.review.ReviewDto;
import com.d103.artformcore.dto.review.ReviewListDto;
import com.d103.artformcore.dto.review.ReviewRequestDto;
import com.d103.artformcore.entity.Model;
import com.d103.artformcore.entity.Review;
import com.d103.artformcore.exception.ModelNotFoundException;
import com.d103.artformcore.exception.ReviewNotFoundException;
import com.d103.artformcore.repository.ModelRepository;
import com.d103.artformcore.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ModelRepository modelRepository;
    private final ImageService imageService;

    public ReviewListDto getModelReviews(Long modelId){
        Model model = modelRepository.findById(modelId).orElseThrow(() -> new ModelNotFoundException("모델 미존재"));
        List<Review> reviewList = reviewRepository.findReviewByModel(model);

        // 아무것도 없으면
        if (reviewList.isEmpty()) {
            return ReviewListDto.builder()
                    .msg("조회 성공")
                    .data(List.of())
                    .build();
        }


        // 1. 수동으로 엔티티를 DTO로 변환
        List<ReviewDto> reviewDtos = reviewList.stream()
                .map(review -> ReviewDto.builder()
                        .reviewId(review.getReviewId())
                        .content(review.getContent())
                        .reviewImageName(review.getReviewImageName())
                        .createdAt(review.getCreatedAt())
                        // 기타 필요한 필드들
                        .build())
                .toList();


        // 이미지 있는 리뷰
        List<Review> reviewsWithImages = reviewList.stream()
                .filter(review -> review.getReviewImageName() != null && !review.getReviewImageName().isEmpty())
                .toList();

        // 이미지가 있는경우
        if (!reviewsWithImages.isEmpty()) {

        }




        return ReviewListDto.builder()
                .msg("조회 성공")
                .data(reviewDtos)
                .build();
    }


    public ReviewListDto deleteModelReviews(Long reviewId){

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException("리뷰를 찾을 수 없습니다: " + reviewId));


        Long modelId = review.getModel().getModelId();

        reviewRepository.deleteById(reviewId);

        List<Review> reviewList = reviewRepository.findReviewByModel(review.getModel());

        List<ReviewDto> reviewDtos = reviewList.stream()
                .map(r -> ReviewDto.builder()
                        .reviewId(r.getReviewId())
                        .content(r.getContent())
                        .reviewImageName(r.getReviewImageName())
                        .createdAt(r.getCreatedAt())
                        .build())
                .toList();


        return ReviewListDto.builder()
                .msg("삭제 성공")
                .data(reviewDtos)
                .build();

    }

}
