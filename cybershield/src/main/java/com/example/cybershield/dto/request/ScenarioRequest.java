package com.example.cybershield.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ScenarioRequest(
        @NotBlank(message = "Tiêu đề kịch bản không được để trống")
        String title,

        @NotBlank(message = "Thể loại kịch bản không được để trống")
        String category,

        @NotBlank(message = "Mức độ kịch bản không được để trống")
        String difficulty,

        String thumbnailUrl,

        String description,

        Integer rewardExp,

        Integer tutorialMode
) {
}
