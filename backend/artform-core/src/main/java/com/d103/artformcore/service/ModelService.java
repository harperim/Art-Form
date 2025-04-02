package com.d103.artformcore.service;

import com.d103.artformcore.dto.ImageLoadResponseDto;
import com.d103.artformcore.dto.ModelLoadResponseDto;
import com.d103.artformcore.dto.ModelSaveDto;
import com.d103.artformcore.dto.ModelSaveResponseDto;
import com.d103.artformcore.entity.Image;
import com.d103.artformcore.entity.Model;
import com.d103.artformcore.exception.CustomException;
import com.d103.artformcore.exception.ErrorCode;
import com.d103.artformcore.exception.ModelNotFoundException;
import com.d103.artformcore.repository.ModelRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ModelService {
    private final ModelRepository modelRepository;
    private final S3Service s3Service;

    @Transactional
    public ModelSaveResponseDto getPresignedPutUrl(String fileType, String fileName) {
        String uploadFileName = fileName.substring(0, fileName.lastIndexOf("."))
                + "_" + UUID.randomUUID().toString() + fileName.substring(fileName.lastIndexOf("."));
        String presignedUrl = s3Service.createPresignedPutUrl("artform-data", "model/" + uploadFileName, fileType);
        if (presignedUrl.isEmpty()) {
            throw new CustomException(ErrorCode.PRESIGNED_URL_GENERATE_FAILED);
        }
        return new ModelSaveResponseDto(presignedUrl, uploadFileName);
    }

    public Model saveMetadata(ModelSaveDto modelSaveDto) {
        Model model = Model.builder()
                .modelName(modelSaveDto.getModelName())
                .userId(modelSaveDto.getUserId())
                .isPublic(modelSaveDto.isPublic())
                .description(modelSaveDto.getDescription())
                .uploadFileName(modelSaveDto.getUploadFileName())
                .build();
        try {
            return modelRepository.save(model);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.METADATA_SAVE_FAILED);
        }
    }

    public void incrementLikeCount(Long modelId) {
        Model model = modelRepository.findById(modelId)
                .orElseThrow(() -> new ModelNotFoundException("모델을 찾을 수 없습니다: " + modelId));
        model.setLikeCount(model.getLikeCount() + 1);
        modelRepository.save(model);
    }

    public void decrementLikeCount(Long modelId) {
        Model model = modelRepository.findById(modelId)
                .orElseThrow(() -> new ModelNotFoundException("모델을 찾을 수 없습니다: " + modelId));
        if (model.getLikeCount() > 0) {
            model.setLikeCount(model.getLikeCount() - 1);
            modelRepository.save(model);
        }
    }

    public Model deleteModel(Long modelId) {
        Model model = modelRepository.findById(modelId).orElseThrow(() -> {
            throw new CustomException(ErrorCode.MODEL_NOT_FOUND);
        });
        model.setDeletedAt(LocalDateTime.now());
        return modelRepository.save(model);
    }

    public ModelLoadResponseDto getPresignedGetUrl(long imageId, long userId) {
        Model model = modelRepository.findById(imageId).orElse(null);
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
}
