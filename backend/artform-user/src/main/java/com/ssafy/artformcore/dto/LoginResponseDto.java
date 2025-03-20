package com.ssafy.artformcore.dto;

import com.ssafy.artformcore.security.JwtToken;
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
