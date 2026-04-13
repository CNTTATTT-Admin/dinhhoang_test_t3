package com.example.cybershield.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record GameplaySubmitRequest(
        @NotNull(message = "ID kịch bản không được để trống")
        UUID scenarioId,

        LocalDateTime endedAt,

        @NotNull(message = "Điểm không được để trống")
        Integer scoreGained,

        @NotBlank(message = "Trạng thái không được để trống")
        String status
) {
}

