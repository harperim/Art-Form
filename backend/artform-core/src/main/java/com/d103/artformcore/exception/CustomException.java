package com.d103.artformcore.exception;

public class CustomException extends RuntimeException {
    private final ErrorCode errorcode;

    public CustomException(ErrorCode errorcode) {
        this.errorcode = errorcode;
    }

    public ErrorCode getErrorCode() {
        return errorcode;
    }
}
