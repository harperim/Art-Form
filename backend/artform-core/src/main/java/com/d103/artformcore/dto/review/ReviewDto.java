package com.d103.artformcore.dto.review;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewDto {
    private Long reviewId;
    private Long modelId;
    private String modelName; // 모델 이름 추가 (필요시)
    private String reviewImageName;
    private String presignedUrl;
    private Long userId;
    private String userName;
    private String content;
    private LocalDateTime createdAt;
}
