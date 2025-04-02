package com.d103.artformcore.config;

import com.d103.artformcore.filter.RequestLoggingFilter;
import com.d103.artformcore.security.JwtAuthenticationEntryPoint;
import com.d103.artformcore.security.JwtFilter;
import com.d103.artformcore.security.JwtTokenValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.servlet.util.matcher.MvcRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

import java.util.Arrays;

@EnableWebSecurity
@RequiredArgsConstructor
@Configuration
public class SecurityConfig {

    private final JwtTokenValidator validator;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, HandlerMappingIntrospector introspector) throws Exception {

        MvcRequestMatcher.Builder mvc = new MvcRequestMatcher.Builder(introspector);

        MvcRequestMatcher[] swaggerPatterns = {
                mvc.pattern("/core/v3/api-docs"),
                mvc.pattern("/core/v3/api-docs/**"),
                mvc.pattern("/core/swagger-ui/**"),
                mvc.pattern("/swagger-resources/**"),
                mvc.pattern("/webjars/**")
        };


        // 세션 정책 변경, CSRF 필터 해제, 모든 url 허용, 로길 필터 추가 , 모든 요청에 인증 필요
        return http
                .sessionManagement((session) -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception ->{
                    System.out.println("exception 발생");
                    exception.authenticationEntryPoint(jwtAuthenticationEntryPoint);
                })
                .authorizeHttpRequests(authorize ->
                        authorize.requestMatchers(swaggerPatterns).permitAll()
                                .anyRequest().authenticated()
                )
                .addFilterBefore(new JwtFilter(validator), UsernamePasswordAuthenticationFilter.class)
                .build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("*");
        configuration.setAllowedMethods(Arrays.asList(
                "GET","POST","DELETE","OPTIONS"
        ));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
