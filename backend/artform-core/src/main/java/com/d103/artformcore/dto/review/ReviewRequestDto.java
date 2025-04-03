package com.d103.artformcore.dto.review;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewRequestDto {

    private Long id;
    private String content;
    private String author;
}
