package com.ssafy.artformuser.event;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LikeEvent {
    private String eventId;          // 이벤트 고유 ID (멱등성을 위함)
    private String eventType;        // "LIKE_ADDED" 또는 "LIKE_REMOVED"
    private Long userId;             // 좋아요를 누른 사용자 ID
    private String contentType;      // 좋아요 대상 콘텐츠 타입 (예: "POST", "COMMENT")
    private Long contentId;          // 좋아요 대상 콘텐츠 ID
    private LocalDateTime timestamp; // 이벤트 발생 시간
    private Long version;
}
