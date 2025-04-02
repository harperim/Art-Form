package com.d103.artformcore.service;

import com.d103.artformcore.dto.ResponseDto;
import com.d103.artformcore.entity.Like;
import com.d103.artformcore.entity.Model;
import com.d103.artformcore.repository.LikeRepository;
import com.d103.artformcore.repository.ModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final ModelRepository modelRepository;

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

//    public ResponseDto getLikeList(Long userId) {
//
//        List<Like> likeList = likeRepository.findByUserId(userId);
//        if (likeList.isEmpty()) {
//            return new ResponseDto("success", false);
//        }
//
//
//
//
//
//
//
//    }
}