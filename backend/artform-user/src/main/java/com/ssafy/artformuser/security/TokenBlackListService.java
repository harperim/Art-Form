package com.ssafy.artformuser.security;

import com.ssafy.artformuser.dao.RedisDao;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class TokenBlackListService {
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisDao redisDao;
    private static final String BLACKLIST_PREFIX = "blacklist:";

    public void addBlacklist(String token) {
        String key = BLACKLIST_PREFIX + token;

        Claims claims = jwtTokenProvider.parseClaims(token);

        Date expiration = claims.getExpiration();
        long now = new Date().getTime();

        // 남은 시간
        long remainingExpiration = expiration.getTime() - now;

        // 토큰이 아직 만료되지 않은 경우에만 블랙리스트에 추가
        if (remainingExpiration > 0) {
            // 남은 만료 시간만큼만 Redis에 저장 (값은 중요하지 않으므로 빈 문자열 사용)
            // 이렇게 하면 토큰이 만료되는 시점에 Redis에서도 자동으로 제거됨
            redisDao.setValues(key, "", Duration.ofMillis(remainingExpiration));
        }
    }
    
    public boolean isBlacklisted(String token) {
        String key = BLACKLIST_PREFIX + token;
        // 토큰의 존재 여부만 확인
        return redisDao.getValues(key) != null;
    }
}
