package com.d103.artformcore.service;

import com.d103.artformcore.dto.ImageLoadResponseDto;
import com.d103.artformcore.dto.ImageSaveDto;
import com.d103.artformcore.dto.ImageSaveResponseDto;
import com.d103.artformcore.entity.Image;
import com.d103.artformcore.entity.Model;
import com.d103.artformcore.exception.CustomException;
import com.d103.artformcore.exception.ErrorCode;
import com.d103.artformcore.repository.ImageRepository;
import com.d103.artformcore.repository.ModelRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;


@Service
@RequiredArgsConstructor
@Slf4j
public class ImageService {
    private final ImageRepository imageRepository;
    private final ModelRepository modelRepository;
    private final S3Service s3Service;

    @Transactional
    public ImageSaveResponseDto getPresignedPutUrl(String fileType, String fileName, String service) {
        String uploadFileName = fileName.substring(0, fileName.lastIndexOf("."))
                + "_" + UUID.randomUUID().toString() + fileName.substring(fileName.lastIndexOf("."));
        String presignedUrl = s3Service.createPresignedPutUrl("artform-data", service + "/" + uploadFileName, fileType);
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
                .isPublic(true)
                .createdAt(LocalDateTime.now())
                .build();
        try {
            return imageRepository.save(image);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.METADATA_SAVE_FAILED);
        }
    }

    public List<ImageLoadResponseDto> getPresignedGetUrlByUploadFileName(List<String> uploadFileNameList, long userId, String service) {
        List<ImageLoadResponseDto> imageLoadResponseDtoList = new ArrayList<>();
        for (String upfile : uploadFileNameList) {
            ImageLoadResponseDto imageLoadResponseDto = getPresignedGetUrl(imageRepository.findByUploadFileName(upfile).getImageId(), userId, service);
            imageLoadResponseDtoList.add(imageLoadResponseDto);
        }
        return imageLoadResponseDtoList;
    }

    public ImageLoadResponseDto getPresignedGetUrl(long imageId, long userId, String service) {
        Image image = imageRepository.findByImageIdAndDeletedAtIsNull(imageId)
                .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND));
        // 인가 여부 확인
        if (!image.isPublic() && !image.getUserId().equals(userId)) {
            System.out.println(image.isPublic() + " " + image.getUserId());
            throw new CustomException(ErrorCode.FORBIDDEN_IMAGE);
        }

        String uploadFileName = image.getUploadFileName();
        String presignedUrl = s3Service.createPresignedGetUrl("artform-data", service + "/" + uploadFileName);
        if (presignedUrl.isEmpty()) {
            throw new CustomException(ErrorCode.PRESIGNED_URL_GENERATE_FAILED);
        }
        Long modelId = image.getModel().getModelId();
        return new ImageLoadResponseDto(image, presignedUrl);
    }

    // ***************************** 비동기 테스트 중 *****************************
    @Async("taskExecutor")
    public CompletableFuture<ImageLoadResponseDto> getPresignedGetUrlAsync(long imageId, long userId, String service) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("userId: {}", userId);
        log.info("비동기 메소드 내부 인증 정보: {}", auth != null ? auth.getName() + ", 권한: " + auth.getAuthorities() : "없음" );

        SecurityContext securityContext = SecurityContextHolder.getContext();
        return CompletableFuture.supplyAsync(() -> {
            // 비동기 작업에서 SecurityContext 설정
            SecurityContextHolder.setContext(securityContext);

            ImageLoadResponseDto imageLoadResponseDto = new ImageLoadResponseDto();
            // 비즈니스 로직 수행

            return imageLoadResponseDto;
        });
    }
    // **************************************************************************

    public List<ImageLoadResponseDto> getPresignedGetUrlRecentList(int page, long userId) {
        List<Image> imageList = imageRepository.findByIsPublicTrueAndDeletedAtIsNull(
                PageRequest.of(page, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
        System.out.println(imageList);
        List<ImageLoadResponseDto> presignedUrlDtoList = new ArrayList<>();
        for (Image image : imageList) {
            presignedUrlDtoList.add(getPresignedGetUrl(image.getImageId(), userId, "image"));
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
            presignedUrlDtoList.add(getPresignedGetUrl(image.getImageId(), userId, "image"));
        }
        return presignedUrlDtoList;
    }

    public List<String> getPresignedGetUrlLikedList(List<Long> imageIdList, long userId) {
        List<String> presignedUrlList = new ArrayList<>();
        for (long imageId : imageIdList) {
            presignedUrlList.add(getPresignedGetUrl(imageId, userId, "image").getPresignedUrl());
        }
        return presignedUrlList;
    }

    public Image deleteImage(Long imageId) {
        Image image = imageRepository.findById(imageId).orElseThrow(() -> {
            throw new CustomException(ErrorCode.IMAGE_NOT_FOUND);
        });
        image.setDeletedAt(LocalDateTime.now());
        return imageRepository.save(image);
    }

    public List<ImageLoadResponseDto> getPresignedGetUrlList(long modelId, long userId) {
        modelRepository.findById(modelId).orElseThrow(() -> {
            throw new CustomException(ErrorCode.MODEL_NOT_FOUND);
        });
        List<Image> imageList = imageRepository.findByModel_ModelIdAndDeletedAtIsNullAndIsPublicTrue(modelId);
        List<ImageLoadResponseDto> imageLoadResponseDtoList = new ArrayList<>();
        for (Image image : imageList) {
            imageLoadResponseDtoList.add(getPresignedGetUrl(image.getImageId(), userId, "image"));
        }
        return imageLoadResponseDtoList;
    }
}
