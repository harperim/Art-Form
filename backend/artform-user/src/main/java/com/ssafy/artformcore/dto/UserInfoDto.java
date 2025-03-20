package com.ssafy.artformcore.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserInfoDto {

    private String userId;
    private String email;
    private String nickname;

}
