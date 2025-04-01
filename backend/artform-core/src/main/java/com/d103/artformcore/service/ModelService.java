package com.d103.artformcore.service;

import com.d103.artformcore.dto.ImageSaveDto;
import com.d103.artformcore.dto.ImageSaveResponseDto;
import com.d103.artformcore.dto.ModelSaveDto;
import com.d103.artformcore.dto.ModelSaveResponseDto;
import com.d103.artformcore.entity.Image;
import com.d103.artformcore.entity.Model;
import com.d103.artformcore.exception.CustomException;
import com.d103.artformcore.exception.ErrorCode;
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
                .uploadFileName(modelSaveDto.getUploadFileName())
                .build();
        try {
            return modelRepository.save(model);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.METADATA_SAVE_FAILED);
        }
    }
}
