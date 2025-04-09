package com.ssafy.artformuser.dto;

import com.ssafy.artformuser.security.JwtToken;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDto {

    private String message;
    private JwtToken jwtToken;

}
