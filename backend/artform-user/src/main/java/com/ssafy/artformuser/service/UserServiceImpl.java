package com.ssafy.artformuser.service;

import com.ssafy.artformuser.domain.User;
import com.ssafy.artformuser.dto.*;
import com.ssafy.artformuser.exception.AuthenticationException;
import com.ssafy.artformuser.exception.UserNotFoundException;
import com.ssafy.artformuser.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.ssafy.artformuser.dto.SignupRequestDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void signup(SignupRequestDto signupDto) {
        String encodePassword = passwordEncoder.encode(signupDto.getPassword());
        User user = User.builder()
                .email(signupDto.getEmail())
                .password(encodePassword)
                .nickname(signupDto.getNickname())
                .build();
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(()-> new UserNotFoundException("User not found"));
        user.setDeleted(true);
    }

    @Override
    public ResponseCheckDto checkEmailAvailability(String email) {
        return new ResponseCheckDto("체크 완료",userRepository.findByEmail(email).isEmpty());
    }

    @Override
    public ResponseCheckDto checkNicknameAvailability(String nickname) {
        return new ResponseCheckDto("체크 완료",userRepository.findByNickname(nickname).isEmpty());
    }

    @Override
    public UserResponseDto getMyUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // accessToken에서 추출한 userId 가져오기
        Long userId = Long.valueOf(authentication.getName());

        // DB에서 사용자 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        UserInfoDto userInfoDto = UserInfoDto.builder()
                .userId(user.getId().toString())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .build();

        return UserResponseDto.builder()
                .msg("조회 성공")
                .data(userInfoDto)
                .build();
    }

    @Override
    public UserResponseDto getUserInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        UserInfoDto userInfoDto = UserInfoDto.builder()
                .userId(user.getId().toString())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .build();

        return UserResponseDto.builder()
                .msg("조회 성공")
                .data(userInfoDto)
                .build();
    }

    @Override
    public ResponseNameList getUserNameList(List<Long> idList) {

        if (idList == null || idList.isEmpty()) {
            return ResponseNameList.builder()
                    .build();
        }

        // 사용자 정보 조회
        List<User> users = userRepository.findAllById(idList);

        Map<Long, String> userNameMap = users.stream()
                .collect(Collectors.toMap(User::getId, User::getNickname));

        // 순서보장
        List<String> orderedNames = idList.stream()
                .map(userNameMap::get)
                .filter(Objects::nonNull)
                .toList();

        return ResponseNameList.builder()
                .userNameList(orderedNames)
                .build();
    }

}
