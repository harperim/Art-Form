package com.d103.artformcore.controller;

import com.d103.artformcore.dto.ApiResponses;
import com.d103.artformcore.dto.ImageLoadResponseDto;
import com.d103.artformcore.dto.ImageSaveDto;
import com.d103.artformcore.dto.ImageSaveResponseDto;
import com.d103.artformcore.entity.Image;
import com.d103.artformcore.exception.CustomException;
import com.d103.artformcore.exception.ErrorCode;
import com.d103.artformcore.exception.ErrorResponse;
import com.d103.artformcore.service.ImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import static java.lang.Thread.sleep;

@Tag(name = "이미지", description = "이미지 관리 API")
@RestController
@RequestMapping("/image")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;

    @Operation(summary = "이미지 업로드 Presigned URL 요청",
            description = "S3에 이미지 파일을 업로드하기 위한 Presigned URL을 요청합니다")
    @GetMapping("/presigned-url")
    public ResponseEntity<ApiResponses<ImageSaveResponseDto>> getPresignedPutUrl(@RequestParam String fileType, @RequestParam String fileName, @RequestParam String service) {
        try {
            ImageSaveResponseDto imageSaveResponseDto = imageService.getPresignedPutUrl(fileType, fileName, service);
            return ResponseEntity.ok(ApiResponses.success(imageSaveResponseDto));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

    @Operation(summary = "이미지 메타데이터 업로드",
            description = "이미지의 메타데이터를 저장합니다",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
                    @ApiResponse(responseCode = "500", description = "오류 발생!"),
            })
    @PostMapping("/metadata")
    public ResponseEntity<ApiResponses<Image>> saveMetadata(@RequestBody ImageSaveDto imageSaveDto) {
        try {
            Image image = imageService.saveMetadata(imageSaveDto);
            System.out.println(imageSaveDto);
            return ResponseEntity.ok(ApiResponses.success(image));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

    @Operation(summary = "개별 이미지 다운로드 Presigned URL 요청", description = "특정 이미지의 다운로드 URL을 조회합니다",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
                    @ApiResponse(responseCode = "500", description = "오류 발생!"),
            })
    @GetMapping("/{imageId}/presigned-url")
    public ResponseEntity<ApiResponses<ImageLoadResponseDto>> getPresignedGetUrl(@PathVariable long imageId, @AuthenticationPrincipal UserDetails userDetails) {
        System.out.println("imageId: "+ imageId);
        try {
            ImageLoadResponseDto imageLoadResponseDto = imageService.getPresignedGetUrl(imageId, Long.parseLong(userDetails.getUsername()), "image");
            return ResponseEntity.ok(ApiResponses.success(imageLoadResponseDto));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

    // ***************************** 비동기 테스트 중 *****************************
    @GetMapping("/{imageId}/presigned-url/async")
    public CompletableFuture<ResponseEntity<ApiResponses<ImageLoadResponseDto>>> getPresignedUrlAsync(
            @PathVariable long imageId,
            @AuthenticationPrincipal UserDetails userDetails) {

        long userId = Long.parseLong(userDetails.getUsername());

        return imageService.getPresignedGetUrlAsync(imageId, userId, "image")
                .thenApply(response -> ResponseEntity.ok(ApiResponses.success(response)));
    }

    @GetMapping("/benchmark")
    public ApiResponses<String> benchmark(
            @AuthenticationPrincipal UserDetails userDetails) throws InterruptedException {
        sleep(300);
        return ApiResponses.success("");
    }

    // **************************************************************************

    @Operation(summary = "최근순 이미지 다운로드 Presigned URL 요청",
            description = "최근에 등록된 이미지 리스트를 페이지 단위로 조회합니다",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
                    @ApiResponse(responseCode = "500", description = "오류 발생!"),
            })
    @GetMapping("/recent")
    public ResponseEntity<ApiResponses<List<ImageLoadResponseDto>>> getPresignedGetUrlRecentList(@RequestParam int page, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<ImageLoadResponseDto> imageLoadResponseDtoList = imageService.getPresignedGetUrlRecentList(page, Long.parseLong(userDetails.getUsername()));
            return ResponseEntity.ok(ApiResponses.success(imageLoadResponseDtoList));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

    @Operation(summary = "내가 만든 이미지 다운로드 Presigned URL 요청",
            description = "사용자가 생성한 이미지 리스트를 페이지 단위로 조회합니다",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
                    @ApiResponse(responseCode = "500", description = "오류 발생!"),
            })
    @GetMapping("/my-gallery")
    public ResponseEntity<ApiResponses<List<ImageLoadResponseDto>>> getPresignedGetUrlMyList(@RequestParam int page, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // userDetail.getUserName()은 sub값을 불러옴.
            List<ImageLoadResponseDto> imageLoadResponseDtoList = imageService.getPresignedGetUrlMyList(page, Long.parseLong(userDetails.getUsername()));
            return ResponseEntity.ok(ApiResponses.success(imageLoadResponseDtoList));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

    @Operation(summary = "모델로 만든 이미지 Presigned URL 요청", description = "특정 모델로 만든 이미지의 Presigned URL List를 요청합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
                    @ApiResponse(responseCode = "500", description = "오류 발생!"),
            })
    @GetMapping("/model/{modelId}/presigned-url")
    public ResponseEntity<ApiResponses<List<ImageLoadResponseDto>>> getPresignedGetUrlList(@PathVariable long modelId, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<ImageLoadResponseDto> imageLoadResponseDtoList = imageService.getPresignedGetUrlList(modelId, Long.parseLong(userDetails.getUsername()));
            return ResponseEntity.ok(ApiResponses.success(imageLoadResponseDtoList));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

    @Operation(summary = "이미지 삭제",
            description = "특정 이미지를 삭제 처리합니다",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
                    @ApiResponse(responseCode = "500", description = "오류 발생!"),
            })
    @DeleteMapping("/{imageId}")
    public ResponseEntity<ApiResponses<String>> deleteImage(@PathVariable Long imageId) {
        try {
            imageService.deleteImage(imageId);
            return ResponseEntity.ok(ApiResponses.success("이미지 삭제 처리 성공"));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

}
