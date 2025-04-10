package com.ssafy.artformuser.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResponseCheckDto {

    String msg;
    boolean data;

}
