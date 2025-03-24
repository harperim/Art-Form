package com.d103.artformcore.service;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.d103.artformcore.dto.ImageSaveDto;
import com.d103.artformcore.repository.ImageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository imageRepository;
    private final AmazonS3Client amazonS3Client;

    @Transactional
    public List<Boolean> saveImage(ImageSaveDto imageSaveDto) {
        String imageUuid = UUID.randomUUID().toString();
        ObjectMetadata objectMetadata = new ObjectMetadata();

        try {
            objectMetadata.setContentType(imageSaveDto.getImage().getContentType());
            objectMetadata.setContentLength(imageSaveDto.getImage().getInputStream().available());

            amazonS3Client.putObject("artform-data", imageUuid)

        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }
}
