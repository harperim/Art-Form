package com.d103.artformcore.repository;

import com.d103.artformcore.entity.Image;
import com.d103.artformcore.entity.Model;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ModelRepository extends JpaRepository<Model, Long> {
    List<Model> findByUserIdAndDeletedAtIsNull(long userId);
    Page<Model> findByIsPublicTrueAndDeletedAtIsNull(Pageable pageable);
    @Query(value = "SELECT * FROM model WHERE is_public = true AND deleted_at IS NULL ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Model> findRandomModels(@Param("limit") int limit);
}
