package com.d103.artformcore.dto.review;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewRequestDto {

    private String content;
    private String uploadFileName;

}
