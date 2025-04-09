package com.d103.artformcore.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "model")
public class Model {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long modelId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 255)
    private String modelName;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private boolean isPublic = true;

    @Column(nullable = false)
    private int likeCount = 0;

    @Column(nullable = false, length = 255)
    private String uploadFileName;

    private Long thumbnailId;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime deletedAt;
}

