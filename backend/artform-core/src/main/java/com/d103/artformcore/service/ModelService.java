package com.d103.artformcore.service;

import com.d103.artformcore.entity.Model;
import com.d103.artformcore.exception.ModelNotFoundException;
import com.d103.artformcore.repository.ModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ModelService {
    private final ModelRepository modelRepository;
    private final S3Service s3Service;

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
}
