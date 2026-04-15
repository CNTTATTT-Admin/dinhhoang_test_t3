package com.example.cybershield.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SessionDetailRequest(
        @NotNull(message = "ID phiên không được để trống")
        UUID sessionId,

        @NotNull(message = "ID bước không được để trống")
        UUID stepId,

        @NotBlank(message = "Hành động người dùng không được để trống")
        String userAction,

        @NotNull(message = "Thời gian phản hồi không được để trống")
        Float responseTime,

        @NotNull(message = "isCorrect không được để trống")
        Boolean isCorrect
) {
}
