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
@ToString
@Table(name = "image")
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    @ManyToOne
    @JoinColumn(name = "model_id", nullable = false)
    private Model model;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private boolean isPublic = true;

    @Column(nullable = false, length = 255)
    private String uploadFileName;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime deletedAt;
}

