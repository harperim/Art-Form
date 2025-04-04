package com.d103.artformcore.dto;

import lombok.*;

@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ModelDownloadInfoDto {
    private String presignedUrl;
    private String uploadFileName;
}
