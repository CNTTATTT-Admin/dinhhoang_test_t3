package com.example.cybershield.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BadgeRequest(
        @NotNull(message = "ID Badge không được để trống")
        Integer id,

        @NotBlank(message = "Tên Badge không được để trống")
        String name,

        @NotBlank(message = "URL icon không được để trống")
        String iconUrl,

        @NotNull(message = "Số EXP yêu cầu không được để trống")
        Integer requiredExp
) {
}
