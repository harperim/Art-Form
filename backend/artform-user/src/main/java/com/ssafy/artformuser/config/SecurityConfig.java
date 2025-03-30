package com.ssafy.artformuser.config;

import com.ssafy.artformuser.exception.JwtAuthenticationException;
import com.ssafy.artformuser.security.CustomAuthenticationFailureHandler;
import com.ssafy.artformuser.security.JwtFilter;
import com.ssafy.artformuser.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.servlet.util.matcher.MvcRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAuthenticationFailureHandler authenticationFailureHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http , HandlerMappingIntrospector introspector) throws Exception {

        MvcRequestMatcher.Builder mvc = new MvcRequestMatcher.Builder(introspector);

        MvcRequestMatcher[] permitAllList = {
                mvc.pattern("/user/auth/login"), mvc.pattern("/user/signup"),
                mvc.pattern("/user/email-check/*"),mvc.pattern("/user/nickname-check/*"),
        };

        MvcRequestMatcher[] swaggerPatterns = {
                mvc.pattern("/user/v3/api-docs"),
                mvc.pattern("/user/v3/api-docs/**"),
                mvc.pattern("/user/swagger-ui/**"),
                mvc.pattern("/swagger-resources/**"),
                mvc.pattern("/webjars/**"),
        };

        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .httpBasic(AbstractHttpConfigurer::disable)
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // 폼 로직 비활성화
        http.formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable);


        //  로그인 실패시
        http.formLogin(form -> form
                .loginProcessingUrl("/user/auth/login") // 로그인 처리 URL
                .failureHandler(authenticationFailureHandler) // 로그인 실패 핸들러
                .permitAll()
        );

        http.exceptionHandling(exception -> exception
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
        );

        // 허용
        http.authorizeHttpRequests(authorize ->
                authorize.requestMatchers(permitAllList).permitAll()
                        .requestMatchers(swaggerPatterns).permitAll()
                        .anyRequest().authenticated()
        );

        http.addFilterBefore(new JwtFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        // Todo 추후 도메인으로 변경
        corsConfiguration.addAllowedOrigin("*");
        corsConfiguration.addAllowedHeader("*");
        corsConfiguration.setAllowedMethods(Arrays.asList(
                "GET","POST","DELETE","OPTIONS"
        ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        //모든 요청 허용
        source.registerCorsConfiguration("/**", corsConfiguration);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}