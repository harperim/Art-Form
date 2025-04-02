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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

    public ModelLoadResponseDto getPresignedGetUrl(long modelId, long userId) {
        Model model = modelRepository.findById(modelId)
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));
        // 삭제 여부 확인
        if (model.getDeletedAt() != null) {
            throw new CustomException(ErrorCode.DELETED_MODEL);
        }
        // 인가 여부 확인
        if (!model.isPublic() && !model.getUserId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN_MODEL);
        }

        String uploadFileName = model.getUploadFileName();
        String presignedUrl = s3Service.createPresignedGetUrl("artform-data", "model/" + uploadFileName);
        if (presignedUrl.isEmpty()) {
            throw new CustomException(ErrorCode.PRESIGNED_URL_GENERATE_FAILED);
        }

        return new ModelLoadResponseDto(model, presignedUrl);
    }


    public Model deleteModel(Long modelId) {
        Model model = modelRepository.findById(modelId).orElseThrow(() -> {
            throw new CustomException(ErrorCode.MODEL_NOT_FOUND);
        });
        model.setDeletedAt(LocalDateTime.now());
        return modelRepository.save(model);
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

    public List<ModelLoadResponseDto> getPresignedGetUrlRecentList(int page, long userId) {
        List<Model> modelList = modelRepository.findByIsPublicTrueAndDeletedAtIsNull(
                PageRequest.of(page, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();

        List<ModelLoadResponseDto> presignedUrlDtoList = new ArrayList<>();
        for (Model model : modelList) {
            presignedUrlDtoList.add(getPresignedGetUrl(model.getModelId(), userId));
        }
        return presignedUrlDtoList;
    }

    public List<ModelLoadResponseDto> getPresignedGetUrlMyList(long userId) {
        List<Model> modelList = modelRepository.findByUserIdAndDeletedAtIsNull(userId);

        List<ModelLoadResponseDto> presignedUrlDtoList = new ArrayList<>();
        for (Model model : modelList) {
            presignedUrlDtoList.add(getPresignedGetUrl(model.getModelId(), userId));
        }
        return presignedUrlDtoList;
    }
}
