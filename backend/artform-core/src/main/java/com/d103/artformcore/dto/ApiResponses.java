package com.d103.artformcore.dto;

import com.d103.artformcore.exception.ErrorResponse;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiResponses<T> {
    private boolean success;
    private T data;
    private ErrorResponse error;

    public static <T> ApiResponses<T> success(T data) {
        ApiResponses<T> response = new ApiResponses<>();
        response.success = true;
        response.data = data;
        return response;
    }

    public static <T> ApiResponses<T> error(ErrorResponse errorResponse) {
        ApiResponses<T> response = new ApiResponses<>();
        response.success = false;
        response.error = errorResponse;
        return response;
    }
}
