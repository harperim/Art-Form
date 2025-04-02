package com.d103.artformcore.service;

import com.d103.artformcore.dto.ImageLoadResponseDto;
import com.d103.artformcore.dto.LikeListResponseDto;
import com.d103.artformcore.dto.LikeResponseDto;
import com.d103.artformcore.dto.ResponseDto;
import com.d103.artformcore.entity.Like;
import com.d103.artformcore.entity.Model;
import com.d103.artformcore.repository.LikeRepository;
import com.d103.artformcore.repository.ModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final ModelRepository modelRepository;
    private final ImageService imageService;

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

            return new ResponseDto("좋아요 증가", true);
        } else {
            // 좋아요가 없으면 추가
            Like like = Like.builder()
                    .userId(userId)
                    .model(model)
                    .modelName(model.getModelName())
                    .build();

            likeRepository.save(like);

            // 모델의 좋아요 카운트 증가
            model.setLikeCount(model.getLikeCount() + 1);
            modelRepository.save(model);

            return new ResponseDto("좋아요 감소", true);
        }
    }

    public LikeListResponseDto getLikeList(Long userId) {

        List<Like> likeList = likeRepository.findByUserId(userId);
        // 좋아요 리스트가 없으면
        if (likeList.isEmpty()) {
            return new LikeListResponseDto("success", null);
        }

        // 썸네일 ID 받아오기
        List<Long> thumbnailIdList = likeList.stream()
                .map(like -> like.getModel().getThumbnailId())
                .toList();

        List<String> imageUrlList = imageService.getPresignedGetUrlLikedList(thumbnailIdList, userId);

        List<LikeResponseDto> likeResponseList = getLikeResponseDtoList(userId, likeList, imageUrlList);

        return new LikeListResponseDto("조회 성공", likeResponseList);
    }

    private static List<LikeResponseDto> getLikeResponseDtoList(Long userId, List<Like> likeList, List<String> imageUrlList) {
        List<LikeResponseDto> likeResponseList = new ArrayList<>();

        for (int i = 0; i < likeList.size(); i++) {
            Like like = likeList.get(i);
            String imageSrc = i < imageUrlList.size() ? imageUrlList.get(i) : "";

            LikeResponseDto responseDto = new LikeResponseDto();
            responseDto.setImageSrc(imageSrc);
            responseDto.setUserId(userId.toString());
            responseDto.setModelId(like.getModel().getModelId().toString());

            likeResponseList.add(responseDto);
        }
        return likeResponseList;
    }
}