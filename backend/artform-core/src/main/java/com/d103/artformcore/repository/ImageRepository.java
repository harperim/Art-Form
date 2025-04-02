package com.d103.artformcore.repository;

import com.d103.artformcore.entity.Image;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.net.ContentHandler;

public interface ImageRepository extends JpaRepository<Image, Long> {
    Page<Image> findByUserId(Long userId, Pageable pageable);
    Page<Image> findByIsPublicTrueAndDeletedAtIsNull(Pageable pageable);
}
