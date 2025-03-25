package com.d103.artformcore.service;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.*;
import com.d103.artformcore.dto.ImageSaveDto;
import com.d103.artformcore.entity.Image;
import com.d103.artformcore.repository.ImageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;

@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository imageRepository;
    private final AmazonS3Client amazonS3Client;

    @Transactional
    public boolean saveImage(ImageSaveDto imageSaveDto) {
        try {
            // 서버에 파일을 저장하지 않고, 요청 데이터를 S3로 바로 보냄(stream)
            MultipartFile image = imageSaveDto.getImage();
            String imageUuid = UUID.randomUUID().toString();    // s3에 저장되는 key

            // ObjectMetadata 설정(stream을 위해 필요)
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(image.getSize());
            metadata.setContentType(image.getContentType());

            createPresignedUrl("artform-data", imageUuid, (Map<String, String>) metadata);

            // S3에 저장
            amazonS3Client.putObject("artform-data", imageUuid, image.getInputStream(), metadata);

            // 메타데이터 저장
            imageRepository.save(Image.builder()
                    .isPublic(imageSaveDto.isPublic())
                    .uuid(imageUuid)
                    .userId(imageSaveDto.getUserId())
                    .modelId(imageSaveDto.getModelId())
                    .build());

            //TODO: 메타데이터 저장 실패 시 S3에 저장한 이미지 롤백
        } catch (AmazonServiceException e) {
            System.err.println(e.getMessage());
            return false;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return true;
    }

    public String createPresignedUrl(String bucketName, String keyName, Map<String, String> metadata) {
        try (S3Presigner presigner = S3Presigner.create()) {

            // presign request를 위한 정보 생성
            PutObjectRequest objectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(keyName)
                    .metadata(metadata)
                    .build();

            // presign request 생성
            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(10))  // The URL expires in 10 minutes.
                    .putObjectRequest(objectRequest)
                    .build();


            PresignedPutObjectRequest presignedRequest = presigner.presignPutObject(presignRequest);
            System.out.println(presignedRequest.url().toString());
            System.out.println(presignedRequest.url().toExternalForm());
            // String myURL = presignedRequest.url().toString(); // toExternalForm()과 같은 값을 리턴한다...왜지...?
            return presignedRequest.url().toExternalForm();
        }
    }


    public File getImage(String uuid) {
        try {
            S3Object obj = amazonS3Client.getObject("artfor-data", uuid);
            FileOutputStream fos = new FileOutputStream(new File(uuid));
            byte[] read_buf = new byte[1024];
            int read_len = 0;
            S3ObjectInputStream s3is = obj.getObjectContent();
            while ((read_len = s3is.read(read_buf)) > 0) {
                fos.write(read_buf, 0, read_len);
            }
            s3is.close();
            fos.close();

        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return null;    // TODO: 임시
    }
}
