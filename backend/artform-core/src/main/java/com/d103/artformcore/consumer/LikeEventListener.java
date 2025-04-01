package com.d103.artformcore.consumer;

import com.d103.artformcore.exception.ModelNotFoundException;
import com.d103.artformcore.service.ModelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class LikeEventListener {

    private final ModelService modelService;

    @RabbitListener(queues = "likes.queue")
    public void handleLikeEvent(Map<String, Object> message) {
        log.info("좋아요 이벤트 수신: {}", message);

        Long modelId = Long.valueOf(message.get("modelId").toString());
        String action = (String) message.get("action");

        try {
            if ("create".equals(action)) {
                modelService.incrementLikeCount(modelId);
                log.info("모델 ID {} 좋아요 증가", modelId);
            } else if ("cancel".equals(action)) {
                modelService.decrementLikeCount(modelId);
                log.info("모델 ID {} 좋아요 감소", modelId);
            }
        } catch (ModelNotFoundException e) {
            // 모델이 없는 경우 로그만 남기고 정상 처리로 간주 (메시지 재시도 방지)
            log.warn("모델을 찾을 수 없어 좋아요 처리를 건너뜁니다. 모델 ID: {}", modelId);
        }
    }
}
