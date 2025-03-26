package com.d103.artformcore.dto;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class PresignedUrlDto {
    String presignedUrl;
    String uploadFileName;
}
