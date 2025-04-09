package com.ssafy.artformuser.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class TokenRefreshRequestDto {

    String refreshToken;

}
