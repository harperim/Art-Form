package com.ssafy.artformcore.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignupRequestDto {

    String email;
    String password;
    String nickname;

}
