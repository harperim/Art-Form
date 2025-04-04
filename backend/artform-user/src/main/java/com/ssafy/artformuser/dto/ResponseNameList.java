package com.ssafy.artformuser.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResponseNameList {
    List<String> userNameList;
}
