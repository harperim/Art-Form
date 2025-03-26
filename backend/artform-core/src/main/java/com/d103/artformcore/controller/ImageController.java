package com.d103.artformcore.controller;

import com.d103.artformcore.dto.ImageSaveDto;
import com.d103.artformcore.dto.PresignedUrlDto;
import com.d103.artformcore.entity.Image;
import com.d103.artformcore.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;


@RestController
@RequestMapping("/image")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;

    @GetMapping("/presign")
    public ResponseEntity<?> getPresignedUrl(@RequestParam String fileType, @RequestParam String fileName) {
        System.out.println("fileType: " + fileType + ", fileName: " + fileName);
        PresignedUrlDto presignedUrlDto = imageService.getPresignedUrl(fileType, fileName);
        if (presignedUrlDto != null) {
            return ResponseEntity.status(HttpStatus.OK).body(presignedUrlDto);
        }
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body("presigned url 생성 실패");
    }

    @PostMapping("/metadata")
    public ResponseEntity<?> saveMetadata(@RequestBody ImageSaveDto imageSaveDto) {
        System.out.println(imageSaveDto);
        Image image = imageService.saveMetadata(imageSaveDto);
        if (image != null) {
            return ResponseEntity.status(HttpStatus.OK).body(image);
        }
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body("이미지 메타데이터 저장 실패");
    }

//    @GetMapping("/{uuid}")
//    public ResponseEntity<?> getTest(@PathVariable String uuid) {
//        System.out.println(uuid);
//        File image = imageService.getImage(uuid);
//        if (image.exists()) {
//            return  ResponseEntity.status(HttpStatus.OK).body(image);
//        }
//        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
//    }
}
