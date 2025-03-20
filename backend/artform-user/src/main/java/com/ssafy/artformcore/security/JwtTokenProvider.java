package com.ssafy.artformcore.security;

import com.ssafy.artformcore.dao.RedisDao;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private final Key key;
    private final UserDetailsService userDetailsService;
    private final RedisDao redisDao;

    @Value("${jwt.access-token.expire-time}")
    private long ACCESS_TOKEN_EXPIRE_TIME;

    @Value("${jwt.refresh-token.expire-time}")
    private long REFRESH_TOKEN_EXPIRE_TIME;

    @Value("${jwt.secret}")


    private static final String GRANT_TYPE = "Bearer";

    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey, UserDetailsService userDetailsService, RedisDao redisDao) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        this.userDetailsService = userDetailsService;
        this.redisDao = redisDao;
    }

    public String createAccessToken(String email){
        Claims claims = Jwts.claims().setSubject(email);
        Date now = new Date();
        Date validity = new Date(now.getTime() + ACCESS_TOKEN_EXPIRE_TIME);

        return "a";
    }
}
