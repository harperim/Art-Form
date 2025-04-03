package com.ssafy.artformuser.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "user_likes", uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "model_id"})})
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="like_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id",nullable = false)
    private User user;

    @Column(name = "model_id", nullable = false)
    private Long modelId;

    @Column(nullable = false)
    private String modelName;

    @Column(nullable = false)
    private String thumbnailId;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

}
