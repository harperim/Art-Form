package com.ssafy.artformuser.service;

import com.ssafy.artformuser.dto.ResponseDto;
import org.springframework.stereotype.Service;

@Service
public interface LikeService {
    
    // 좋아요
    void addLike(ResponseDto likeRequestDto);

    // 좋아요 취소
    void removeLike(Long likeId);


}
