package com.d103.artformcore.controller;

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
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/image")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;

    @GetMapping("/presign")
    public ResponseEntity<?> getPresignedPutUrl(@RequestParam String fileType, @RequestParam String fileName) {
        try {
            ImageSaveResponseDto imageSaveResponseDto = imageService.getPresignedPutUrl(fileType, fileName);
            return ResponseEntity.status(HttpStatus.OK).body(imageSaveResponseDto);
        } catch (CustomException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage()));
        }
    }

    @PostMapping("/metadata")
    public ResponseEntity<?> saveMetadata(@RequestBody ImageSaveDto imageSaveDto) {
        try {
            Image image = imageService.saveMetadata(imageSaveDto);
            return ResponseEntity.status(HttpStatus.OK).body(image);
        } catch (CustomException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage()));
        }
    }

    @GetMapping("/presign/{imageId}")
    public ResponseEntity<?> getPresignedGetUrl(@PathVariable long imageId) {
        try {
            ImageLoadResponseDto imageLoadResponseDto = imageService.getPresignedGetUrl(imageId);
            return ResponseEntity.status(HttpStatus.OK).body(imageLoadResponseDto);
        } catch (CustomException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage()));
        }
    }

    @GetMapping("/presign/recent/{page}")
    public ResponseEntity<?> getPresignedGetUrlRecentList(@PathVariable int page) {
        System.out.println("recent/page: " + page);
        List<ImageLoadResponseDto> imageLoadResponseDtoList = imageService.getPresignedGetUrlRecentList(page);
        if (!imageLoadResponseDtoList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.OK).body(imageLoadResponseDtoList);
        }
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body("presigned url 생성 실패");
    }

//    @DeleteMapping("/{imageId}")
//    public ResponseEntity<?> deleteImage(@PathVariable Long imageId) {
//        System.out.println("delete: " + imageId);
//        imageService.deleteImage(imageId);
//        if (!imageLoadResponseDtoList.isEmpty()) {
//            return ResponseEntity.status(HttpStatus.OK).body(imageLoadResponseDtoList);
//        }
//        return ResponseEntity.status(HttpStatus.NO_CONTENT).body("presigned url 생성 실패");
//    }

}
