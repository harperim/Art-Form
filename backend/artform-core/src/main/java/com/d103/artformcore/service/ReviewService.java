package com.d103.artformcore.service;

import com.d103.artformcore.dto.ImageLoadResponseDto;
import com.d103.artformcore.dto.ResponseNameList;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ModelRepository modelRepository;
    private final ImageService imageService;

    @Value("${service.user.url}")
    private String userServiceUrl;

    public ReviewListDto getModelReviews(Long modelId, Long userId, String authHeader, int page) {
        Model model = modelRepository.findById(modelId).orElseThrow(() -> new ModelNotFoundException("모델 미존재"));
        List<Review> reviewList = reviewRepository.findReviewByModelOrderByCreatedAtDesc(model);
        int totalCount = reviewList.size();
        // 아무것도 없으면
        if (reviewList.isEmpty()) {
            return ReviewListDto.builder()
                    .msg("조회 성공")
                    .data(Collections.emptyList())
                    .reviewCount(totalCount)
                    .build();
        }

        // 페이징 처리
        int PAGE_SIZE = 5;
        int start = page * PAGE_SIZE;
        int end = Math.min(start + PAGE_SIZE, reviewList.size());

        // 범위가 유효한지 확인
        if (start >= reviewList.size()) {
            return ReviewListDto.builder()
                    .msg("조회 성공")
                    .data(Collections.emptyList())
                    .reviewCount(totalCount)
                    .build();
        }

        // 페이지에 해당하는 데이터만 추출
        List<Review> pageReviews = reviewList.subList(start, end);

        // 리뷰 DTO 리스트 기져오기
        List<ReviewDto> reviewDtos = convertToReviewDtoListAndProcessImages(pageReviews, userId, authHeader);

        return ReviewListDto.builder()
                .msg("조회 성공")
                .data(reviewDtos)
                .reviewCount(totalCount)
                .build();
    }

    public ReviewListDto addReview(Long modelId, ReviewRequestDto reviewRequestDto, Long userId, String authHeader) {

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

        List<Review> reviewList = reviewRepository.findReviewByModelOrderByCreatedAtDesc(model);

        // dto 변환
        List<ReviewDto> reviewDtos = convertToReviewDtoListAndProcessImages(reviewList, userId, authHeader);

        // 6. 결과 반환
        return ReviewListDto.builder()
                .msg("리뷰 생성 성공")
                .data(reviewDtos)
                .build();
    }

    public ReviewListDto deleteReview(Long reviewId, Long userId, String authHeader) {
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
        List<Review> reviewList = reviewRepository.findReviewByModelOrderByCreatedAtDesc(model);

        // 리뷰 DTO 변환
        List<ReviewDto> reviewDtos = convertToReviewDtoListAndProcessImages(reviewList, userId, authHeader);
        
        return ReviewListDto.builder()
                .msg("삭제 성공")
                .data(reviewDtos)
                .build();
    }


    // DTO 변환 및 이미지 처리
    private List<ReviewDto> convertToReviewDtoListAndProcessImages(List<Review> reviewList, Long userId, String authHeader) {
        // 리뷰 작성자 ID 목록 가져오기
        List<Long> reviewUserIdList = reviewList.stream()
                .map(Review::getUserId)
                .distinct()
                .toList();

        // 사용자 이름 목록 가져오기
        List<String> userNameList = new ArrayList<>();

        if (!reviewUserIdList.isEmpty()) {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
            headers.set("accept", "*/*");

            List<String> stringIds = reviewUserIdList.stream()
                    .map(Object::toString)
                    .toList();
            String idListParam = String.join(",", stringIds);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            try {
                String url = userServiceUrl + "/user/name/" + idListParam;
                ResponseEntity<ResponseNameList> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        entity,
                        ResponseNameList.class
                );

                ResponseNameList nameList = response.getBody();
                if (nameList != null && nameList.getUserNameList() != null) {
                    userNameList = nameList.getUserNameList();
                }
            } catch (Exception e) {
                // 예외 처리 - 이름을 가져오지 못한 경우 처리
                System.err.println("사용자 이름 조회 실패: " + e.getMessage());
            }
        }

        // Entity를 DTO로 변환 (사용자 ID별 이름 매핑을 만들기 위한 Map)
        Map<Long, String> userNameMap = new HashMap<>();
        for (int i = 0; i < reviewUserIdList.size() && i < userNameList.size(); i++) {
            userNameMap.put(reviewUserIdList.get(i), userNameList.get(i));
        }

        // Entity를 DTO로 변환
        List<ReviewDto> reviewDtos = reviewList.stream()
                .map(review -> {
                    Long reviewUserId = review.getUserId();
                    return ReviewDto.builder()
                            .reviewId(review.getReviewId())
                            .modelId(review.getModel().getModelId())
                            .modelName(review.getModel().getModelName())
                            .content(review.getContent())
                            .reviewImageName(review.getReviewImageName())
                            .userId(reviewUserId)
                            .userName(userNameMap.getOrDefault(reviewUserId, null)) // 사용자 이름 추가
                            .createdAt(review.getCreatedAt())
                            .build();
                })
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
            String imageName = response.getImage().getUploadFileName();
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
