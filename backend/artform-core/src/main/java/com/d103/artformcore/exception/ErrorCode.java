package com.d103.artformcore.exception;

public enum ErrorCode {
    IMAGE_NOT_FOUND("000", "이미지를 찾을 수 없습니다"),
    PRESIGNED_URL_GENERATE_FAILED("001", "Presigned URL 생성 중 오류가 발생하였습니다"),
<<<<<<< Updated upstream
    METADATA_SAVE_FAILED("002", "메타데이터 저장 중 오류가 발생했습니다");
=======
    METADATA_SAVE_FAILED("002", "메타데이터 저장 중 오류가 발생했습니다"),
    MODEL_NOT_FOUND("003", "모델을 찾을 수 없습니다"),
    DELETED_IMAGE("004", "삭제된 이미지입니다"),
    FORBIDDEN_IMAGE("005", "이미지 접근 권한이 없습니다");
>>>>>>> Stashed changes


    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
