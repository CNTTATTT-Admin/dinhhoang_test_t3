package com.example.cybershield.dto.response;

import com.example.cybershield.entity.ScenarioStep;
import java.util.UUID;

public record ScenarioStepResponse(
        UUID id,
        UUID scenarioId,
        int stepOrder,
        String stepType,
        String content,
        String triggerFailure,
        String triggerSuccess,
        String aiFeedback,
        UUID landingPageId // Trả về luôn ID của trang Landing Page (nếu có)
) {
    public static ScenarioStepResponse fromEntity(ScenarioStep entity) {
        return new ScenarioStepResponse(
                entity.getId(),
                entity.getScenario() != null ? entity.getScenario().getId() : null,
                entity.getStepOrder(),
                entity.getStepType(),
                entity.getContent(),
                entity.getTriggerFailure(),
                entity.getTriggerSuccess(),
                entity.getAiFeedback(),
                entity.getLandingPage() != null ? entity.getLandingPage().getId() : null
        );
    }
}