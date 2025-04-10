package com.d103.artformcore.dto;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ImageSaveResponseDto {
    private String presignedUrl;
    private String uploadFileName;
}
