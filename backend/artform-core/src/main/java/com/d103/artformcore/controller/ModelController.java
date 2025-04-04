package com.d103.artformcore.controller;

import com.d103.artformcore.dto.*;
import com.d103.artformcore.entity.Model;
import com.d103.artformcore.exception.CustomException;
import com.d103.artformcore.exception.ErrorResponse;
import com.d103.artformcore.service.ModelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name="모델")
@RestController
@RequestMapping("/model")
@RequiredArgsConstructor
public class ModelController {
    private final ModelService modelService;

    @Operation(summary = "모델 업로드 Presigned URL 요청",
            description = "S3에 모델 파일을 업로드하기 위한 Presigned URL을 요청합니다",
    responses = {
            @ApiResponse(responseCode = "200", description = "처리 성공!"),
            @ApiResponse(responseCode = "500", description = "오류 발생!"),
    })
    @GetMapping("/presigned-url")
    public ResponseEntity<ApiResponses<ModelSaveResponseDto>> getPresignedPutUrl(@RequestParam String fileType, @RequestParam String fileName) {
        try {
            ModelSaveResponseDto modelSaveResponseDto = modelService.getPresignedPutUrl(fileType, fileName);
            return ResponseEntity.ok(ApiResponses.success(modelSaveResponseDto));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

    @Operation(summary = "모델 메타데이터 업로드", description = "모델의 메타데이터를 저장합니다",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
                    @ApiResponse(responseCode = "500", description = "오류 발생!"),
            })
    @PostMapping("/metadata")
    public ResponseEntity<ApiResponses<Model>> saveMetadata(@RequestBody ModelSaveDto modelSaveDto) {
        try {
            System.out.println(modelSaveDto);
            Model model = modelService.saveMetadata(modelSaveDto);
            System.out.println(model);
            return ResponseEntity.ok(ApiResponses.success(model));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

    @Operation(summary = "모델 presigned url 조회", description = "특정 모델의 다운로드 URL을 조회합니다",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
                    @ApiResponse(responseCode = "500", description = "오류 발생!"),
            })
    @GetMapping("/{modelId}/presigned-url")
    public ResponseEntity<ApiResponses<ModelDownloadInfoDto>> getModelDownloadInfo(@PathVariable long modelId, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            ModelDownloadInfoDto modelDownloadInfo = modelService.getModelDownloadInfo(modelId, Long.parseLong(userDetails.getUsername()));
            return ResponseEntity.ok(ApiResponses.success(modelDownloadInfo));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

    @Operation(summary = "최근 모델 조회", description = "최근 등록된 모델 리스트를 페이지 단위로 조회합니다",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
                    @ApiResponse(responseCode = "500", description = "오류 발생!"),
            })
    @GetMapping("/recent")
    public ResponseEntity<ApiResponses<List<ModelLoadResponseDto>>> getPresignedGetUrlRecentList(@RequestParam int page, @AuthenticationPrincipal UserDetails userDetails, HttpServletRequest request) {
        try {
            List<ModelLoadResponseDto> modelLoadResponseDtoList = modelService.getPresignedGetUrlRecentList(page, Long.parseLong(userDetails.getUsername()), request.getHeader("Authorization"));
            return ResponseEntity.ok(ApiResponses.success(modelLoadResponseDtoList));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

    @Operation(summary = "내 모델 조회", description = "사용자가 등록한 모델 리스트를 조회합니다",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
                    @ApiResponse(responseCode = "500", description = "오류 발생!"),
            })
    @GetMapping("/my-model")
    public ResponseEntity<ApiResponses<List<ModelLoadResponseDto>>> getPresignedGetUrlMyList(@AuthenticationPrincipal UserDetails userDetails, HttpServletRequest request) {
        try {
            // userDetail.getUserName()은 sub값을 불러옴.
            List<ModelLoadResponseDto> modelLoadResponseDtoList = modelService.getPresignedGetUrlMyList(Long.parseLong(userDetails.getUsername()), request.getHeader("Authorization"));
            return ResponseEntity.ok(ApiResponses.success(modelLoadResponseDtoList));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

    @Operation(summary = "인기 모델 조회", description = "좋아요 수가 많은 인기 모델을 페이지 단위로 조회합니다",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
                    @ApiResponse(responseCode = "500", description = "오류 발생!"),
            })
    @GetMapping("/hot")
    public ResponseEntity<ApiResponses<List<ModelLoadResponseDto>>> getPresignedGetUrlHotList(@AuthenticationPrincipal UserDetails userDetails,
                                                                                              @RequestParam int page, HttpServletRequest request) {
        try {
            // userDetail.getUserName()은 sub값을 불러옴.
            List<ModelLoadResponseDto> modelLoadResponseDtoList = modelService.getPresignedGetUrlHotList(page, Long.parseLong(userDetails.getUsername()), request.getHeader("Authorization"));
            return ResponseEntity.ok(ApiResponses.success(modelLoadResponseDtoList));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

    @Operation(summary = "모델 조회(랜덤)", description = "랜덤으로 모델을 지정된 개수만큼 조회합니다",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
                    @ApiResponse(responseCode = "500", description = "오류 발생!"),
            })
    @GetMapping("/random")
    public ResponseEntity<ApiResponses<List<ModelLoadResponseDto>>> getPresignedGetUrlRandomList(@AuthenticationPrincipal UserDetails userDetails,
                                                                                                 @RequestParam int count, HttpServletRequest request) {
        try {
            // userDetail.getUserName()은 sub값을 불러옴.
            List<ModelLoadResponseDto> modelLoadResponseDtoList = modelService.getPresignedGetUrlRandomList(count, Long.parseLong(userDetails.getUsername()), request.getHeader("Authorization"));
            return ResponseEntity.ok(ApiResponses.success(modelLoadResponseDtoList));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

    @Operation(summary = "모델 정보 수정", description = "모델의 메타데이터를 수정합니다",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
                    @ApiResponse(responseCode = "500", description = "오류 발생!"),
            })
    @PostMapping("/edit/{modelId}")
    public ResponseEntity<ApiResponses<Model>> updateModelMetadata(@AuthenticationPrincipal UserDetails userDetails, @PathVariable long modelId, @RequestBody ModelEditDto modelEditDto) {
        try {
            Model model = modelService.updateModelMetadata(Long.parseLong(userDetails.getUsername()), modelId, modelEditDto);
            return ResponseEntity.ok(ApiResponses.success(model));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

    @Operation(summary = "모델 삭제", description = "모델을 삭제합니다",
            responses = {
                    @ApiResponse(responseCode = "200", description = "처리 성공!"),
                    @ApiResponse(responseCode = "500", description = "오류 발생!"),
            })
    @DeleteMapping("/{modelId}")
    public ResponseEntity<ApiResponses<String>> deleteModel(@PathVariable Long modelId) {
        try {
            modelService.deleteModel(modelId);
            return ResponseEntity.ok(ApiResponses.success("모델 삭제 처리 성공"));
        } catch (CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getErrorCode().getCode(), e.getErrorCode().getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponses.error(errorResponse));
        }
    }

}
