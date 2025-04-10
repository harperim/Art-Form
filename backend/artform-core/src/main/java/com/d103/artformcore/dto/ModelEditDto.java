package com.d103.artformcore.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Builder
public class ModelEditDto {
    private String modelName;
    private String description;
    private boolean isPublic;
}
