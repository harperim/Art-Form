package com.d103.artformcore.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long imageId;
    public long modelId;
    public long userId;
    public boolean isPublic;
    public String imageUrl;
    public String createdAt;
    public String deletedAt;
    public String uuid;
}
