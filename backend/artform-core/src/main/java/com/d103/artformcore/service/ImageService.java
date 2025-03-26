package com.d103.artformcore.service;

import com.d103.artformcore.dto.ImageSaveDto;
import com.d103.artformcore.dto.PresignedUrlDto;
import com.d103.artformcore.entity.Image;
import com.d103.artformcore.entity.Model;
import com.d103.artformcore.repository.ImageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;

@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository imageRepository;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Transactional
    public PresignedUrlDto getPresignedUrl(String fileType, String fileName) {
        String uploadFileName = fileName.substring(0, fileName.lastIndexOf("."))
                + "_" + UUID.randomUUID().toString() + fileName.substring(fileName.lastIndexOf("."));
        String presignedUrl = createPresignedUrl("artform-data", uploadFileName, fileType);
        if (presignedUrl.isEmpty()) {
            System.out.println("presigned url 생성 실패");
            return null;
        }
        return new PresignedUrlDto(presignedUrl, uploadFileName);
    }

    public String createPresignedUrl(String bucketName, String keyName, String contentType) {
        // presign request를 위한 정보 생성
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(keyName)
                .contentType(contentType)
                .build();

        // presign request 생성
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))  // The URL expires in 10 minutes.
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        // System.out.println(presignedRequest.url().toString());
        // System.out.println(presignedRequest.url().toExternalForm());
        // toExternalForm()과 같은 값을 리턴한다...왜지...?
        return presignedRequest.url().toExternalForm();
    }

    public Image saveMetadata(ImageSaveDto imageSaveDto) {
        Model model = Model.builder()
                .modelId(imageSaveDto.getModelId())
                .build();

        Image image = Image.builder()
                .model(model)
                .userId(imageSaveDto.getUserId())
                .uploadFileName(imageSaveDto.getUploadFileName())
                .isPublic(imageSaveDto.isPublic())
                .createdAt(LocalDateTime.now())
                .build();

        System.out.println(image);

        return imageRepository.save(image);
    }

//    @Transactional
//    public boolean saveImage(ImageSaveDto imageSaveDto) {
//        try {
//            // 서버에 파일을 저장하지 않고, 요청 데이터를 S3로 바로 보냄(stream)
//            MultipartFile image = imageSaveDto.getImage();
//            String imageUuid = UUID.randomUUID().toString();    // s3에 저장되는 key
//
//            // ObjectMetadata 설정(stream을 위해 필요)
//            S3ObjectMetadata metadata = new ObjectMetadata();
//            metadata.setContentLength(image.getSize());
//            metadata.setContentType(image.getContentType());
//
//            PutObjectRequest putObjectRequest =
//
//            // S3에 저장
//            s3Client.putObject("artform-data", imageUuid, image.getInputStream(), metadata);
//
//            // 메타데이터 저장
//            imageRepository.save(Image.builder()
//                    .isPublic(imageSaveDto.isPublic())
//                    .uuid(imageUuid)
//                    .userId(imageSaveDto.getUserId())
//                    .modelId(imageSaveDto.getModelId())
//                    .build());
//
//            //TODO: 메타데이터 저장 실패 시 S3에 저장한 이미지 롤백
//        } catch (IOException e) {
//            throw new RuntimeException(e);
//        }
//        return true;
//    }
}
