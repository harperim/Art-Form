package com.d103.artformcore.service;

import com.d103.artformcore.dto.ImageLoadResponseDto;
import com.d103.artformcore.dto.ImageSaveResponseDto;
import com.d103.artformcore.dto.PutReviewResponseDto;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ModelRepository modelRepository;
    private final ImageService imageService;

    public ReviewListDto getModelReviews(Long modelId, Long userId) {
        Model model = modelRepository.findById(modelId).orElseThrow(() -> new ModelNotFoundException("모델 미존재"));
        List<Review> reviewList = reviewRepository.findReviewByModel(model);

        // 아무것도 없으면
        if (reviewList.isEmpty()) {
            return ReviewListDto.builder()
                    .msg("조회 성공")
                    .data(List.of())
                    .build();
        }
        // 리뷰 DTO 리스트 기져오기
        List<ReviewDto> reviewDtos = convertToReviewDtoListAndProcessImages(reviewList, userId);

        return ReviewListDto.builder()
                .msg("조회 성공")
                .data(reviewDtos)
                .build();
    }

    public ReviewListDto addReview(Long modelId, ReviewRequestDto reviewRequestDto, Long userId) {

        Model model = modelRepository.findById(modelId)
                .orElseThrow(() -> new ModelNotFoundException("모델을 찾을 수 없습니다."));

        // 저장
        Review savedReview = Review.builder()
                .model(model)
                .userId(userId)
                .content(reviewRequestDto.getContent())
                .reviewImageName(reviewRequestDto.getUploadFileName())
                .build();
        reviewRepository.save(savedReview);

        List<Review> reviewList = reviewRepository.findReviewByModel(model);

        // dto 변환
        List<ReviewDto> reviewDtos = convertToReviewDtoListAndProcessImages(reviewList, userId);

        // 6. 결과 반환
        return ReviewListDto.builder()
                .msg("리뷰 생성 성공")
                .data(reviewDtos)
                .build();
    }

    public ReviewListDto deleteReview(Long reviewId, Long userId) {
        // 리뷰 존재 여부 확인
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException("리뷰를 찾을 수 없습니다."));

        // 리뷰 작성자 확인
        if (!review.getUserId().equals(userId)) {
            throw new IllegalArgumentException("리뷰 삭제 권한이 없습니다.");
        }

        // 리뷰에 연관된 모델 가져오기
        Model model = review.getModel();

        // 리뷰 삭제
        reviewRepository.delete(review);

        // 해당 모델의 모든 리뷰 가져오기
        List<Review> reviewList = reviewRepository.findReviewByModel(model);

        // 리뷰 DTO 변환
        List<ReviewDto> reviewDtos = convertToReviewDtoListAndProcessImages(reviewList, userId);
        
        return ReviewListDto.builder()
                .msg("삭제 성공")
                .data(reviewDtos)
                .build();
    }
    
    // DTO 변환 및 이미지 처리
    private List<ReviewDto> convertToReviewDtoListAndProcessImages(List<Review> reviewList, Long userId) {
        // Entity를 DTO로 변환
        List<ReviewDto> reviewDtos = reviewList.stream()
                .map(review -> ReviewDto.builder()
                        .reviewId(review.getReviewId())
                        .modelId(review.getModel().getModelId())
                        .modelName(review.getModel().getModelName())
                        .content(review.getContent())
                        .reviewImageName(review.getReviewImageName())
                        .userId(review.getUserId())
                        .createdAt(review.getCreatedAt())
                        .build())
                .toList();


        // 이미지가 있는 리뷰만 필터링하여 이미지 이름 목록 생성
        List<String> imageFileNames = reviewDtos.stream()
                .map(ReviewDto::getReviewImageName)
                .filter(name -> name != null && !name.isEmpty())
                .toList();

        // 이미지가 있는 경우 프리사인드 URL 처리
        if (!imageFileNames.isEmpty()) {
            processPresignedUrls(reviewDtos, imageFileNames, userId);
        }

        return reviewDtos;
    }
    
    // Presigned url 받아오기
    private void processPresignedUrls(List<ReviewDto> reviewDtos, List<String> imageFileNames, Long userId) {
        // 이미지 서비스에서 presigned URL 요청
            List<ImageLoadResponseDto> responseList = imageService.getPresignedGetUrlByUploadFileName(
                    imageFileNames, userId, "review");

        // URL 매핑 생성
        Map<String, String> imageUrlMap = new HashMap<>();
        for (ImageLoadResponseDto response : responseList) {
            String imageName = response.getUploadFileName();
            String presignedUrl = response.getPresignedUrl();
            imageUrlMap.put(imageName, presignedUrl);
        }

        // 각 DTO에 URL 설정
        for (ReviewDto dto : reviewDtos) {
            String imageName = dto.getReviewImageName();
            if (imageName != null && !imageName.isEmpty() && imageUrlMap.containsKey(imageName)) {
                dto.setPresignedUrl(imageUrlMap.get(imageName));
            }
        }
    }



}
