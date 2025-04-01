package com.ssafy.artformuser.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LikeListResponseDto {
    String msg;
    List<LikeDto> likeList;
}