package com.example.cybershield.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GameplayDecision(
        @NotBlank(message = "decisionType không được để trống")
        String decisionType,

        @NotBlank(message = "userAction không được để trống")
        String userAction,

        @NotNull(message = "isPhishing không được để trống")
        Boolean isPhishing,

        String payload
) {
}
