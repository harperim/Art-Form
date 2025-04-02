package com.d103.artformcore.service;

import com.d103.artformcore.dto.ImageLoadResponseDto;
import com.d103.artformcore.dto.ImageSaveDto;
import com.d103.artformcore.dto.ImageSaveResponseDto;
import com.d103.artformcore.entity.Image;
import com.d103.artformcore.entity.Model;
import com.d103.artformcore.exception.CustomException;
import com.d103.artformcore.exception.ErrorCode;
import com.d103.artformcore.repository.ImageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository imageRepository;
    private final S3Service s3Service;

    @Transactional
    public ImageSaveResponseDto getPresignedPutUrl(String fileType, String fileName) {
        String uploadFileName = fileName.substring(0, fileName.lastIndexOf("."))
                + "_" + UUID.randomUUID().toString() + fileName.substring(fileName.lastIndexOf("."));
        String presignedUrl = s3Service.createPresignedPutUrl("artform-data", "image/" + uploadFileName, fileType);
        if (presignedUrl.isEmpty()) {
            throw new CustomException(ErrorCode.PRESIGNED_URL_GENERATE_FAILED);
        }
        return new ImageSaveResponseDto(presignedUrl, uploadFileName);
    }

    public Image saveMetadata(ImageSaveDto imageSaveDto) {
        // TODO: model service에서 model 정보 불러와야 함.
        Model model = Model.builder()
                .modelId(imageSaveDto.getModelId())
                .build();

        Image image = Image.builder()
                .model(model)
                .userId(imageSaveDto.getUserId())
                .uploadFileName(imageSaveDto.getUploadFileName())
                .isPublic(imageSaveDto.isPublic())
                .createdAt(LocalDateTime.now())
                .build();
        try {
            return imageRepository.save(image);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.METADATA_SAVE_FAILED);
        }
    }

    public ImageLoadResponseDto getPresignedGetUrl(long imageId) {
        Image image = imageRepository.findById(imageId).orElse(null);
        if (image == null) {
            throw new CustomException(ErrorCode.IMAGE_NOT_FOUND);
        }
        String uploadFileName = image.getUploadFileName();
        String presignedUrl = s3Service.createPresignedGetUrl("artform-data", "image/" + uploadFileName);
        if (presignedUrl.isEmpty()) {
            throw new CustomException(ErrorCode.PRESIGNED_URL_GENERATE_FAILED);
        }
        Long modeId = image.getModel().getModelId();
        Long userId = image.getUserId();
        return new ImageLoadResponseDto(modeId, userId, presignedUrl, uploadFileName);
    }

    public List<ImageLoadResponseDto> getPresignedGetUrlRecentList(int page) {
        List<Image> imageList = imageRepository.findAll(
                PageRequest.of(page, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();

        List<ImageLoadResponseDto> presignedUrlDtoList = new ArrayList<>();
        for (Image image : imageList) {
            presignedUrlDtoList.add(getPresignedGetUrl(image.getImageId()));
        }
        return presignedUrlDtoList;
    }

    public List<ImageLoadResponseDto> getPresignedGetUrlMyList(int page, long userId) {
        List<Image> imageList = imageRepository.findByUserId(
                userId,
                PageRequest.of(page, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();

        List<ImageLoadResponseDto> presignedUrlDtoList = new ArrayList<>();
        for (Image image : imageList) {
            presignedUrlDtoList.add(getPresignedGetUrl(image.getImageId()));
        }
        return presignedUrlDtoList;
    }

    public List<ImageLoadResponseDto> getPresignedGetUrlLikedList(List<Long> imageIdList, long userId) {
        return null;
    }

    public Image deleteImage(Long imageId) {
        Image image = imageRepository.findById(imageId).orElseThrow(() -> {
            throw new CustomException(ErrorCode.IMAGE_NOT_FOUND);
        });
        image.setDeletedAt(LocalDateTime.now());
        return imageRepository.save(image);
    }

}
