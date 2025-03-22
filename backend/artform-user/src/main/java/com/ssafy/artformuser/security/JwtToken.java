package com.ssafy.artformuser.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Builder
@AllArgsConstructor
@Getter
@ToString
public class JwtToken {
    private String grantType; // JWT에 대한 인증 타입 (ex. Bearer)
    private String accessToken;
    private String refreshToken;
}
