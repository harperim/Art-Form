package com.d103.artformcore.controller;

import com.d103.artformcore.dto.ApiResponse;
import com.d103.artformcore.dto.ImageLoadResponseDto;
import com.d103.artformcore.dto.ImageSaveDto;
import com.d103.artformcore.dto.ImageSaveResponseDto;
import com.d103.artformcore.entity.Image;
import com.d103.artformcore.exception.CustomException;
import com.d103.artformcore.exception.ErrorResponse;
import com.d103.artformcore.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/image")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;

    @GetMapping("/presigned-url")
    public ResponseEntity<?> getPresignedPutUrl(@RequestParam String fileType, @RequestParam String fileName) {
        try {
            ImageSaveResponseDto imageSaveResponseDto = imageService.getPresignedPutUrl(fileType, fileName);
            return ResponseEntity.ok(ApiResponse.success(imageSaveResponseDto));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }

    @PostMapping("/metadata")
    public ResponseEntity<ApiResponse<Image>> saveMetadata(@RequestBody ImageSaveDto imageSaveDto) {
        try {
            Image image = imageService.saveMetadata(imageSaveDto);
            return ResponseEntity.ok(ApiResponse.success(image));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }

    @GetMapping("/{imageId}/presigned-url")
    public ResponseEntity<ApiResponse<ImageLoadResponseDto>> getPresignedGetUrl(@PathVariable long imageId) {
        try {
            ImageLoadResponseDto imageLoadResponseDto = imageService.getPresignedGetUrl(imageId);
            return ResponseEntity.ok(ApiResponse.success(imageLoadResponseDto));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getPresignedGetUrlRecentList(@RequestParam int page) {
        try {
            List<ImageLoadResponseDto> imageLoadResponseDtoList = imageService.getPresignedGetUrlRecentList(page);
            return ResponseEntity.ok(ApiResponse.success(imageLoadResponseDtoList));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }

    @GetMapping("/my-gallery")
    public ResponseEntity<?> getPresignedGetUrlMyList(@RequestParam int page, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // userDetail.getUserName()은 sub값을 불러옴.
            List<ImageLoadResponseDto> imageLoadResponseDtoList = imageService.getPresignedGetUrlMyList(page, Long.parseLong(userDetails.getUsername()));
            return ResponseEntity.ok(ApiResponse.success(imageLoadResponseDtoList));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }

    @PostMapping("/liked")
    public ResponseEntity<?> getPresignedGetUrlLikedList(@RequestBody List<Long> imageIdList, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<ImageLoadResponseDto> imageLoadResponseDtoList = imageService.getPresignedGetUrlLikedList(imageIdList, Long.parseLong(userDetails.getUsername()));
            return ResponseEntity.ok(ApiResponse.success(imageLoadResponseDtoList));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<?> deleteImage(@PathVariable Long imageId) {
        try {
            imageService.deleteImage(imageId);
            return ResponseEntity.ok(ApiResponse.success("이미지 삭제 처리 성공"));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }


}
