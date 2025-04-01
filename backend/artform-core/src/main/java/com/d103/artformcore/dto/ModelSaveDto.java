package com.d103.artformcore.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ModelSaveDto {
    private Long userId;
    private String modelName;
    private boolean isPublic;
    private String uploadFileName;
}
