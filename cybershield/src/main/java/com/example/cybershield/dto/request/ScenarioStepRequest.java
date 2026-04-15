package com.example.cybershield.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ScenarioStepRequest(
        UUID scenarioId, // ID của kịch bản gốc

        @NotNull(message = "Thứ tự bước không được để trống")
        Integer stepOrder,

        @NotBlank(message = "Loại bước không được để trống")
        String stepType,

        String content,
        String triggerFailure,
        String triggerSuccess,
        String aiFeedback
) {}