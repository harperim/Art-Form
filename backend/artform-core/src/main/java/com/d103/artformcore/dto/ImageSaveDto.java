package com.d103.artformcore.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@ToString
public class ImageSaveDto {
    private long modelId;
    private long userId;
    private boolean isPublic;
    private String uploadFileName;
}