package com.d103.artformcore.service;

import com.d103.artformcore.dto.ResponseNameList;
import com.d103.artformcore.dto.like.LikeIsTrueDto;
import com.d103.artformcore.dto.like.LikeListResponseDto;
import com.d103.artformcore.dto.like.LikeResponseDto;
import com.d103.artformcore.dto.ResponseDto;
import com.d103.artformcore.entity.Like;
import com.d103.artformcore.entity.Model;
import com.d103.artformcore.repository.LikeRepository;
import com.d103.artformcore.repository.ModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final ModelRepository modelRepository;
    private final ImageService imageService;

    @Value("${service.user.url}")
    private String userServiceUrl;

    @Transactional
    public ResponseDto toggleLike(Long userId, Long modelId) {

        // 좋아요 상태 확인
        Optional<Like> existingLike = likeRepository.findByUserIdAndModel_ModelId(userId, modelId);

        // 모델이 없으면
        Model model = modelRepository.findById(modelId)
                .orElseThrow(() -> new RuntimeException("Model not found with id: " + modelId));

        if (existingLike.isPresent()) {
            // 좋아요가 이미 있으면 삭제
            likeRepository.delete(existingLike.get());

            // 모델의 좋아요 카운트 감소
            model.setLikeCount(model.getLikeCount() - 1);
            modelRepository.save(model);

            return new ResponseDto("좋아요 삭제", false);
        } else {
            // 좋아요가 없으면 추가
            Like like = Like.builder()
                    .userId(userId)
                    .model(model)
                    .modelName(model.getModelName())
                    .createdAt(model.getCreatedAt())
                    .build();

            likeRepository.save(like);

            // 모델의 좋아요 카운트 증가
            model.setLikeCount(model.getLikeCount() + 1);
            modelRepository.save(model);

            return new ResponseDto("좋아요 등록", true);
        }
    }

    // 좋아요 한 리스트 호출
    public LikeListResponseDto getLikeList(Long userId, int page, String authHeader) {
        int size = 5;

        // 전체 좋아요 목록을 순서대로 가져옵니다
        List<Like> allLikes = likeRepository.findByUserIdOrderByCreatedAtDesc(userId);

        // 좋아요 리스트가 없으면
        if (allLikes.isEmpty()) {
            return new LikeListResponseDto("success", Collections.emptyList());
        }

        // 페이징 처리
        int start = page * size;
        int end = Math.min(start + size, allLikes.size());

        // 범위가 유효한지 확인
        if (start >= allLikes.size()) {
            return new LikeListResponseDto("success", Collections.emptyList());
        }

        // 페이지에 해당하는 데이터만 추출
        List<Like> likeList = allLikes.subList(start, end);

        // 썸네일 ID 받아오기
        List<Long> thumbnailIdList = likeList.stream()
                .map(like -> like.getModel().getThumbnailId())
                .filter(Objects::nonNull)  // null 값 필터링
                .toList();

        // 이미지 URL 조회
        List<String> imageUrlList = imageService.getPresignedGetUrlLikedList(thumbnailIdList, userId);

        // 모델 제작자 ID 목록 추출
        List<Long> modelUserIdList = likeList.stream()
                .map(like -> like.getModel().getUserId())
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        // 유저 ID 목록 추출
        Map<Long, String> userNameMap = getUserNames(modelUserIdList, authHeader);

        // DTO 변환
        List<LikeResponseDto> likeResponseList = getLikeResponseDtoList(userId, likeList, imageUrlList, userNameMap);

        return new LikeListResponseDto("조회 성공", likeResponseList);
    }

    private static List<LikeResponseDto> getLikeResponseDtoList(Long userId, List<Like> likeList, List<String> imageUrlList, Map<Long, String> userNameMap) {
        List<LikeResponseDto> likeResponseList = new ArrayList<>();

        for (int i = 0; i < likeList.size(); i++) {
            Like like = likeList.get(i);
            String imageSrc = i < imageUrlList.size() ? imageUrlList.get(i) : "";

            // 모델 생성자 ID
            Long modelUserId = like.getModel().getUserId();

            LikeResponseDto responseDto = new LikeResponseDto();
            responseDto.setImageSrc(imageSrc);
            responseDto.setUserId(userId.toString());  // 좋아요를 누른 사용자 ID
            responseDto.setModelId(like.getModel().getModelId().toString());
            responseDto.setModelName(like.getModelName());
            responseDto.setUserName(userNameMap.getOrDefault(modelUserId, "Unknown User"));  // 모델 생성자 이름

            likeResponseList.add(responseDto);
        }
        return likeResponseList;
    }

    public LikeIsTrueDto getIsLike(Long userId, Long modelId) {
        Optional<Like> byUserIdAndModelModelId = likeRepository.findByUserIdAndModel_ModelId(userId, modelId);
        Boolean isLike = byUserIdAndModelModelId.isPresent();
        return new LikeIsTrueDto("조회 성공",isLike);
    }

    private Map<Long, String> getUserNames(List<Long> userIdList, String authHeader) {
        try {
            // 필요할 때마다 RestTemplate 생성
            RestTemplate restTemplate = new RestTemplate();

            // 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);  // authHeader는 메서드 파라미터로 전달받아야 함
            headers.set("accept", "*/*");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            // ID 목록을 문자열로 변환
            String idListParam = String.join(",", userIdList.stream().map(String::valueOf).toList());

            String url = userServiceUrl + "/user/name/" + idListParam;

            // exchange 메서드 사용
            ResponseEntity<ResponseNameList> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    ResponseNameList.class
            );

            Map<Long, String> userNameMap = new HashMap<>();
            ResponseNameList nameList = response.getBody();

            if (nameList != null && nameList.getUserNameList() != null) {
                // 서비스에서 순서가 보장되므로, 같은 인덱스의 ID와 이름을 매핑
                for (int i = 0; i < userIdList.size() && i < nameList.getUserNameList().size(); i++) {
                    Long id = userIdList.get(i);
                    String name = nameList.getUserNameList().get(i);
                    userNameMap.put(id, name);
                }
            }
            return userNameMap;
        } catch (Exception e) {
            // 로그 추가
            System.err.println("사용자 이름 조회 중 오류 발생: " + e.getMessage());
            // 실패 시 빈 맵 반환
            return new HashMap<>();
        }
    }
}