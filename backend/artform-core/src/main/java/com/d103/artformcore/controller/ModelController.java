package com.d103.artformcore.controller;

import com.d103.artformcore.dto.ApiResponse;
import com.d103.artformcore.dto.ImageSaveDto;
import com.d103.artformcore.dto.ModelSaveDto;
import com.d103.artformcore.dto.ModelSaveResponseDto;
import com.d103.artformcore.entity.Image;
import com.d103.artformcore.entity.Model;
import com.d103.artformcore.exception.CustomException;
import com.d103.artformcore.exception.ErrorResponse;
import com.d103.artformcore.service.ModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

}
