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


        List<ReviewDto> reviewDtos = reviewList.stream()
                .map(review -> ReviewDto.builder()
                        .reviewId(review.getReviewId())
                        .modelId(model.getModelId())
                        .modelName(model.getModelName()) // 모델명 추가
                        .content(review.getContent())
                        .reviewImageName(review.getReviewImageName())
                        .userId(review.getUserId()) // 사용자 ID 추가
                        .createdAt(review.getCreatedAt())
                        .build())
                .toList();

        // 2. 이미지가 있는 리뷰만 필터링하여 이미지 이름 목록 생성
        List<String> imageFileNames = reviewDtos.stream()
                .map(ReviewDto::getReviewImageName)
                .filter(name -> name != null && !name.isEmpty())
                .toList();

        // 3. 이미지가 있는 경우 프리사인드 URL 한 번에 요청 및 처리
        if (!imageFileNames.isEmpty()) {
            // 이미지 서비스에서 모든 이미지의 presigned URL을 한 번에 요청
            List<ImageLoadResponseDto> responseList = imageService.getPresignedGetUrlByUploadFileName(
                    imageFileNames, userId, "review");

            // 응답 목록에서 이미지 이름과 URL 매핑 생성
            Map<String, String> imageUrlMap = new HashMap<>();
            for (ImageLoadResponseDto response : responseList) {
                // ImageLoadResponseDto에서 이미지 이름과 URL을 가져오는 방식은 실제 구현에 맞게 조정
                String imageName = response.getUploadFileName();
                String presignedUrl = response.getPresignedUrl();
                imageUrlMap.put(imageName, presignedUrl);
            }

            // 각 DTO에 해당하는 URL 매핑
            for (ReviewDto dto : reviewDtos) {
                String imageName = dto.getReviewImageName();
                if (imageName != null && !imageName.isEmpty() && imageUrlMap.containsKey(imageName)) {
                    dto.setPresignedUrl(imageUrlMap.get(imageName)); // presignedUrl 설정
                }
            }
        }

        // 4. 결과 반환
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
        List<ReviewDto> reviewDtos = reviewList.stream()
                .map(review -> ReviewDto.builder()
                        .reviewId(review.getReviewId())
                        .modelId(model.getModelId())
                        .modelName(model.getModelName())
                        .content(review.getContent())
                        .reviewImageName(review.getReviewImageName())
                        .userId(review.getUserId())
                        .createdAt(review.getCreatedAt())
                        .build())
                .toList();

        // 5. 이미지가 있는 리뷰의 presigned URL 처리
        List<String> imageFileNames = reviewDtos.stream()
                .map(ReviewDto::getReviewImageName)
                .filter(name -> name != null && !name.isEmpty())
                .toList();

        if (!imageFileNames.isEmpty()) {
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

        // 6. 결과 반환
        return ReviewListDto.builder()
                .msg("리뷰 생성 성공")
                .data(reviewDtos)
                .build();
    }


}
