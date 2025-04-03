package com.d103.artformcore.dto;

import com.d103.artformcore.entity.Model;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ModelLoadResponseDto {
    private Model model;
    private String presignedUrl;
}
