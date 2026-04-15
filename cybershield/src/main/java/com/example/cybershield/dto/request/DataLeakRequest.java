package com.example.cybershield.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record DataLeakRequest(
        @NotNull(message = "ID người dùng không được để trống")
        UUID userId,

        @NotNull(message = "ID phiên không được để trống")
        UUID sessionId,

        @NotBlank(message = "Loại dữ liệu không được để trống")
        String dataType,

        @NotBlank(message = "Giá trị bị rò rỉ không được để trống")
        String leakedValue
) {
}
