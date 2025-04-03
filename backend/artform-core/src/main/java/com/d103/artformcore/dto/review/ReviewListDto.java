package com.d103.artformcore.dto.review;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewListDto {
    String msg;
    List<ReviewDto> data;
}
