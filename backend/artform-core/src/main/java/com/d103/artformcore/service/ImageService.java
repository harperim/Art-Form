package com.d103.artformcore.service;

import com.d103.artformcore.dto.ImageLoadResponseDto;
import com.d103.artformcore.dto.ImageSaveDto;
import com.d103.artformcore.dto.ImageSaveResponseDto;
import com.d103.artformcore.entity.Image;
import com.d103.artformcore.entity.Model;
import com.d103.artformcore.repository.ImageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository imageRepository;
    private final S3Service s3Service;

    @Transactional
    public ImageSaveResponseDto getPresignedPutUrl(String fileType, String fileName) {
        String uploadFileName = fileName.substring(0, fileName.lastIndexOf("."))
                + "_" + UUID.randomUUID().toString() + fileName.substring(fileName.lastIndexOf("."));
        String presignedUrl = s3Service.createPresignedPutUrl("artform-data", "image/" + uploadFileName, fileType);
        if (presignedUrl.isEmpty()) {
            System.out.println("presigned url 생성 실패");
            return null;
        }
        return new ImageSaveResponseDto(presignedUrl, uploadFileName);
    }

    public ImageLoadResponseDto getPresignedGetUrl(long imageId) {
        Image image = imageRepository.findById(imageId).orElse(null);
        String uploadFileName = image.getUploadFileName();
        String presignedUrl = s3Service.createPresignedGetUrl("artform-data", "image/" + uploadFileName);
        Long modeId = image.getModel().getModelId();
        Long userId = image.getUserId();
        if (presignedUrl.isEmpty()) {
            System.out.println("presigned url 생성 실패");
            return null;
        }
        return new ImageLoadResponseDto(modeId, userId, presignedUrl, uploadFileName);
    }

    public List<ImageLoadResponseDto> getPresignedGetUrlRecentList(int page) {
        List<Image> imageList = imageRepository.findAll(
                PageRequest.of(page, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();

        List<ImageLoadResponseDto> presignedUrlDtoList = new ArrayList<>();
        for (Image image : imageList) {
            presignedUrlDtoList.add(getPresignedGetUrl(image.getImageId()));
        }
        return presignedUrlDtoList;
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
