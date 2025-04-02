package com.d103.artformcore.repository;

import com.d103.artformcore.entity.Image;
import com.d103.artformcore.entity.Model;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModelRepository extends JpaRepository<Model, Long> {
    List<Model> findByUserIdAndDeletedAtIsNull(long userId);
    Page<Model> findByIsPublicTrueAndDeletedAtIsNull(Pageable pageable);

}
