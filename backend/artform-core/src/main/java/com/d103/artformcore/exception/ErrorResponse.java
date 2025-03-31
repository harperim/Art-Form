package com.d103.artformcore.exception;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class ErrorResponse {
    private final String code;
    private final String message;
}
