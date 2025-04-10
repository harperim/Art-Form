package com.d103.artformcore.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Builder
public class ModelSaveDto {
    private Long userId;
    private String modelName;
    private String description;
    private boolean isPublic;
    private String uploadFileName;
}
