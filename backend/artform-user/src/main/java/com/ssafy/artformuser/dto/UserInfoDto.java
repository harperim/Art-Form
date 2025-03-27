package com.ssafy.artformuser.dto;

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
