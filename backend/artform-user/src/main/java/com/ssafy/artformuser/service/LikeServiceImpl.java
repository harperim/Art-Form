package com.ssafy.artformuser.service;

import com.ssafy.artformuser.domain.Like;
import com.ssafy.artformuser.domain.User;
import com.ssafy.artformuser.dto.ModelInfoDto;
import com.ssafy.artformuser.dto.ResponseDto;
import com.ssafy.artformuser.exception.UserNotFoundException;
import com.ssafy.artformuser.repository.LikeRepository;
import com.ssafy.artformuser.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService {

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final RabbitTemplate rabbitTemplate;

    @Override
    public ResponseDto toggleLike(Long userId, ModelInfoDto modelInfoDto) {

        // 좋아요 상태 확인
        Optional<Like> existingLike = likeRepository.findByUserIdAndModelId(userId, modelInfoDto.getModelId());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다. ID: " + userId));

        // 좋아요가 있으면
        if(existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());

            sendLikeEvent(userId, modelInfoDto, "cancel");
            return new ResponseDto("좋아요 취소");
        } else{
            Like like = Like.builder()
                    .user(user)
                    .modelId(modelInfoDto.getModelId())
                    .modelName(modelInfoDto.getModelName())
                    .thumbnailId(modelInfoDto.getThumbnailId())
                    .build();

            likeRepository.save(like);

            // RabbitMQ를 통한 이벤트 발행
            sendLikeEvent(userId, modelInfoDto, "create");

            log.info("사용자 {}가 모델 {} 좋아요 등록", userId, modelInfoDto.getModelName());
            return new ResponseDto("좋아요가 등록되었습니다.");
        }
    }

    private void sendLikeEvent(Long userId, ModelInfoDto modelInfoDto, String action) {
        Map<String, Object> message = new HashMap<>();
        message.put("userId", userId);
        message.put("modelId", modelInfoDto.getModelId());
        message.put("action", action);
        if ("create".equals(action)) {
            message.put("modelName", modelInfoDto.getModelName());
            message.put("thumbnailId", modelInfoDto.getThumbnailId());
        }
        rabbitTemplate.convertAndSend("like-exchange", "like." + action, message);
    }
}
