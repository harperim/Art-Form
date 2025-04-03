package com.d103.artformcore.controller;

import com.d103.artformcore.dto.*;
import com.d103.artformcore.entity.Image;
import com.d103.artformcore.entity.Model;
import com.d103.artformcore.exception.CustomException;
import com.d103.artformcore.exception.ErrorResponse;
import com.d103.artformcore.service.ModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/model")
@RequiredArgsConstructor
public class ModelController {
    private final ModelService modelService;

    @GetMapping("/presigned-url")
    public ResponseEntity<ApiResponse<ModelSaveResponseDto>> getPresignedPutUrl(@RequestParam String fileType, @RequestParam String fileName) {
        try {
            ModelSaveResponseDto modelSaveResponseDto = modelService.getPresignedPutUrl(fileType, fileName);
            return ResponseEntity.ok(ApiResponse.success(modelSaveResponseDto));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }

    @PostMapping("/metadata")
    public ResponseEntity<ApiResponse<Model>> saveMetadata(@RequestBody ModelSaveDto modelSaveDto) {
        try {
            Model model = modelService.saveMetadata(modelSaveDto);
            return ResponseEntity.ok(ApiResponse.success(model));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }

    @GetMapping("/{modelId}/presigned-url")
    public ResponseEntity<ApiResponse<ModelLoadResponseDto>> getPresignedGetUrl(@PathVariable long modelId, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            ModelLoadResponseDto modelLoadResponseDto = modelService.getPresignedGetUrl(modelId, Long.parseLong(userDetails.getUsername()));
            return ResponseEntity.ok(ApiResponse.success(modelLoadResponseDto));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getPresignedGetUrlRecentList(@RequestParam int page, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<ModelLoadResponseDto> modelLoadResponseDtoList = modelService.getPresignedGetUrlRecentList(page, Long.parseLong(userDetails.getUsername()));
            return ResponseEntity.ok(ApiResponse.success(modelLoadResponseDtoList));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }

    @GetMapping("/my-model")
    public ResponseEntity<?> getPresignedGetUrlMyList(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            // userDetail.getUserName()은 sub값을 불러옴.
            List<ModelLoadResponseDto> modelLoadResponseDtoList = modelService.getPresignedGetUrlMyList(Long.parseLong(userDetails.getUsername()));
            return ResponseEntity.ok(ApiResponse.success(modelLoadResponseDtoList));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }

    @GetMapping("/hot")
    public ResponseEntity<?> getPresignedGetUrlHotList(@AuthenticationPrincipal UserDetails userDetails,
                                                       @RequestParam int page) {
        try {
            // userDetail.getUserName()은 sub값을 불러옴.
            List<ModelLoadResponseDto> modelLoadResponseDtoList = modelService.getPresignedGetUrlHotList(page, Long.parseLong(userDetails.getUsername()));
            return ResponseEntity.ok(ApiResponse.success(modelLoadResponseDtoList));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }

    @PostMapping("/edit/{modelId}")
    public ResponseEntity<?> updateModelMetadata(@AuthenticationPrincipal UserDetails userDetails, @PathVariable long modelId, @RequestBody ModelEditDto modelEditDto) {
        try {
            Model model = modelService.updateModelMetadata(Long.parseLong(userDetails.getUsername()), modelId, modelEditDto);
            return ResponseEntity.ok(ApiResponse.success(model));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }

    @DeleteMapping("/{modelId}")
    public ResponseEntity<?> deleteModel(@PathVariable Long modelId) {
        try {
            modelService.deleteModel(modelId);
            return ResponseEntity.ok(ApiResponse.success("모델 삭제 처리 성공"));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }

}
