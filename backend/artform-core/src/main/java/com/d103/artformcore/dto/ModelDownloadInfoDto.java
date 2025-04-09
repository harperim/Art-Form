package com.d103.artformcore.dto;

import com.d103.artformcore.entity.Model;
import lombok.*;

@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ModelDownloadInfoDto {
    private Model model;
    private String presignedUrl;
}
