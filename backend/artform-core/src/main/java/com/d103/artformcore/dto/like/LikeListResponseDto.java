package com.d103.artformcore.dto.like;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class LikeListResponseDto {
    String msg;
    List<LikeResponseDto> data;
}
