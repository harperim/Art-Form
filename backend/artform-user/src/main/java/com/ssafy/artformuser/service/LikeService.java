package com.ssafy.artformuser.service;

import com.ssafy.artformuser.dto.ModelInfoDto;
import com.ssafy.artformuser.dto.ResponseDto;
import org.springframework.stereotype.Service;

@Service
public interface LikeService {
    // 좋아요
    ResponseDto toggleLike(Long userId, ModelInfoDto modelId);
}
