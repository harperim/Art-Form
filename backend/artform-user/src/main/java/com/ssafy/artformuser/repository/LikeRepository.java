package com.ssafy.artformuser.repository;

import com.ssafy.artformuser.domain.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByUserIdAndModelId(Long userId, Long modelId);
}

