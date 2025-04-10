package com.d103.artformcore.dto.like;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class LikeResponseDto {
    private String imageSrc;
    private String userId;
    private String modelId;
    private String modelName;
}
