package com.d103.artformcore.service;

import com.d103.artformcore.dto.*;
import com.d103.artformcore.entity.Model;
import com.d103.artformcore.exception.CustomException;
import com.d103.artformcore.exception.ErrorCode;
import com.d103.artformcore.exception.ModelNotFoundException;
import com.d103.artformcore.repository.ModelRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

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
        try {
            Model model = Model.builder()
                    .modelName(modelSaveDto.getModelName())
                    .userId(modelSaveDto.getUserId())
                    .isPublic(modelSaveDto.isPublic())
                    .description(modelSaveDto.getDescription())
                    .uploadFileName(modelSaveDto.getUploadFileName())
                    .createdAt(LocalDateTime.now())
                    .build();
            return modelRepository.save(model);
        } catch (Exception e) {
            System.out.println(e);
            throw new CustomException(ErrorCode.METADATA_SAVE_FAILED);
        }
    }

    public ModelLoadResponseDto getPresignedGetUrl(long modelId, long userId, String token) {
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
        String userName;
        // userName 조회
        try {
            // RestTemplate을 사용하는 경우
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", token ); // 토큰 가져오는 메서드 필요
            headers.set("accept", "*/*");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    "http://j12d103.p.ssafy.io:8082/user/" + userId,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                userName = (String) data.get("nickname");
            } else {
                userName = "Unknown User";
            }
        } catch (Exception e) {
            userName = "Unknown User";
        }
        // userName 조회 끝

        return new ModelLoadResponseDto(model, userName);
    }

    public List<ModelLoadResponseDto> getPresignedGetUrlRecentList(int page, long userId, String token) {
        List<Model> modelList = modelRepository.findByIsPublicTrueAndDeletedAtIsNull(
                PageRequest.of(page, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();

        List<ModelLoadResponseDto> presignedUrlDtoList = new ArrayList<>();
        for (Model model : modelList) {
            presignedUrlDtoList.add(getPresignedGetUrl(model.getModelId(), userId, token));
        }
        return presignedUrlDtoList;
    }

    public List<ModelLoadResponseDto> getPresignedGetUrlMyList(long userId, String token) {
        List<Model> modelList = modelRepository.findByUserIdAndDeletedAtIsNull(userId);

        List<ModelLoadResponseDto> presignedUrlDtoList = new ArrayList<>();
        for (Model model : modelList) {
            presignedUrlDtoList.add(getPresignedGetUrl(model.getModelId(), userId, token));
        }
        return presignedUrlDtoList;
    }

    public List<ModelLoadResponseDto> getPresignedGetUrlHotList(int page, long userId, String token) {
        List<Model> modelList = modelRepository.findByIsPublicTrueAndDeletedAtIsNull(
                PageRequest.of(page, 5, Sort.by(Sort.Direction.DESC, "likeCount"))
        ).getContent();
        List<ModelLoadResponseDto> presignedUrlDtoList = new ArrayList<>();
        for (Model model : modelList) {
            presignedUrlDtoList.add(getPresignedGetUrl(model.getModelId(), userId, token));
        }
        return presignedUrlDtoList;
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

    public Model updateModelMetadata(long userId, long modelId, ModelEditDto modelEditDto) {
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

        model.setModelName(modelEditDto.getModelName());
        model.setDescription(modelEditDto.getDescription());
        model.setPublic(modelEditDto.isPublic());

        return modelRepository.save(model);
    }

    public List<ModelLoadResponseDto> getPresignedGetUrlRandomList(int count, long userId, String token) {
        List<Model> randomModels = modelRepository.findRandomModels(count);

        List<ModelLoadResponseDto> presignedUrlDtoList = new ArrayList<>();
        for (Model model : randomModels) {
            presignedUrlDtoList.add(getPresignedGetUrl(model.getModelId(), userId, token));
        }
        return presignedUrlDtoList;
    }

    public ModelDownloadInfoDto getModelDownloadInfo(long modelId, long userId) {
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

        return new ModelDownloadInfoDto(presignedUrl, model.getUploadFileName());
    }
}
