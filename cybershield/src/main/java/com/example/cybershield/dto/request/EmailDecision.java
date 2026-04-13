package com.example.cybershield.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EmailDecision(
        @NotNull(message = "emailId không được để trống")
        Long emailId,

        @NotNull(message = "isPhishing không được để trống")
        Boolean isPhishing,

        @NotBlank(message = "userAction không được để trống")
        String userAction
) {
}

