package com.d103.artformcore.controller;

import com.d103.artformcore.dto.ImageSaveDto;
import com.d103.artformcore.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/image")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;

    @PostMapping("/test")
    public ResponseEntity<?> putTest(@ModelAttribute ImageSaveDto imageSaveDto) {
        imageService.saveImage(imageSaveDto);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }
}
