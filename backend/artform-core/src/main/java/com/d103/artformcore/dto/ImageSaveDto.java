package com.d103.artformcore.dto;

import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

@Getter
public class ImageSaveDto {
    private MultipartFile image;
    private long modelId;
    private long userId;
    private boolean isPublic;
}
