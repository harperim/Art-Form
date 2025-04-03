package com.d103.artformcore.dto;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ImageLoadResponseDto {
    private Long modelId;
    private Long userId;
    private String presignedUrl;
    private String uploadFileName;
}
