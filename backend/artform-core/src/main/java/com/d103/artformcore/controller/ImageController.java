package com.d103.artformcore.controller;

import com.d103.artformcore.dto.ImageSaveDto;
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

    @PostMapping("/upload")
    public ResponseEntity<?> putTest(@ModelAttribute ImageSaveDto imageSaveDto) {
        System.out.println(imageSaveDto);
        if (imageService.saveImage(imageSaveDto)) {
            return ResponseEntity.status(HttpStatus.OK).body(null);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<?> getTest(@PathVariable String uuid) {
        System.out.println(uuid);
        File image = imageService.getImage(uuid);
        if (image.exists()) {
            return  ResponseEntity.status(HttpStatus.OK).body(image);
        }
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
    }
}
