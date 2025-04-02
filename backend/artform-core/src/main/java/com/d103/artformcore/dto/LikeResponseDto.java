package com.d103.artformcore.dto;

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
}
