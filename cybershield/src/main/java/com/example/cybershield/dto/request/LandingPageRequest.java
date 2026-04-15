package com.example.cybershield.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record LandingPageRequest(
        UUID stepId, // ID của ScenarioStep gắn với trang Landing Page này

        @NotBlank(message = "Tên template không được để trống")
        String templateName,

        @NotBlank(message = "URL giả mạo không được để trống")
        String fakeUrl,

        String requiredFields
) {}