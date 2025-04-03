package com.d103.artformcore.dto;

import com.d103.artformcore.entity.Image;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ImageLoadResponseDto {
    private Image image;
    private String presignedUrl;
}
