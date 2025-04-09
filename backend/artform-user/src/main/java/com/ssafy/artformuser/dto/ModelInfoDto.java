package com.ssafy.artformuser.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ModelInfoDto {

    private Long modelId;
    private String modelName;
    private String thumbnailId;

}
