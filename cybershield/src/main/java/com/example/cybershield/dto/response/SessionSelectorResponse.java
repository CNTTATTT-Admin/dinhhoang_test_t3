package com.example.cybershield.dto.response;

import java.util.UUID;

/**
 * DTO cho màn hình chọn nhiệm vụ trong 1 chiến dịch.
 */
public record SessionSelectorResponse(
        UUID sessionId,
        UUID scenarioId,
        int stepOrder,
        String lessonTitle,
        int threatLevel,
        String objective,
        boolean isCompleted,
        boolean isLocked
) {}

