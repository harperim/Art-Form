package com.ssafy.artformuser.security;

import com.ssafy.artformuser.domain.User;
import com.ssafy.artformuser.repository.UserRepository;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("이메일을 찾을 수 없습니다: " + email));

        if (user.isDeleted())
            throw new DisabledException("탈퇴한 계정은 로그인이 불가능합니다");
        return new CustomUserDetails(user);
    }

    public UserDetails loadUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 ID를 찾을 수 없습니다: " + userId));

        if (user.isDeleted())
            throw new DisabledException("탈퇴한 계정은 로그인이 불가능합니다");

        return new CustomUserDetails(user);
    }

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

}
