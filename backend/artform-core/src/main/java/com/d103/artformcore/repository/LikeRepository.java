package com.d103.artformcore.repository;

import com.d103.artformcore.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByUserIdAndModel_ModelId(Long userId, Long modelId);

    List<Like> findByUserId(Long userId);
}