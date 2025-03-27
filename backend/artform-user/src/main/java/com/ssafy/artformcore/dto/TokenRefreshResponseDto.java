package com.ssafy.artformcore.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TokenRefreshResponseDto {

    private String msg;
    private String refreshToken;

}
