package com.example.cybershield.dto.response;

import com.example.cybershield.entity.SessionDetail;

import java.util.UUID;

public record SessionDetailResponse(
        UUID id,
        UUID sessionId,
        UUID stepId,
        String userAction,
        float responseTime,
        boolean isCorrect
) {
    public static SessionDetailResponse fromEntity(SessionDetail entity) {
        return new SessionDetailResponse(
                entity.getId(),
                entity.getSession() != null ? entity.getSession().getId() : null,
                entity.getStep() != null ? entity.getStep().getId() : null,
                entity.getUserAction(),
                entity.getResponseTime(),
                entity.isCorrect()
        );
    }
}
