package com.example.cybershield.dto.response;

import com.example.cybershield.entity.TrainingSession;

import java.time.LocalDateTime;
import java.util.UUID;

public record TrainingSessionResponse(
        UUID id,
        UUID userId,
        UUID scenarioId,
        LocalDateTime startedAt,
        LocalDateTime endedAt,
        int scoreGained,
        String status,
        int earnedExp,
        int newTotalExp,
        boolean rankChanged
) {
    public static TrainingSessionResponse fromEntity(TrainingSession entity) {
        int totalExp = entity.getUser() != null ? entity.getUser().getTotalExp() : 0;
        return fromEntity(entity, 0, totalExp, false);
    }

    public static TrainingSessionResponse fromEntity(
            TrainingSession entity,
            int earnedExp,
            int newTotalExp,
            boolean rankChanged
    ) {
        return new TrainingSessionResponse(
                entity.getId(),
                entity.getUser() != null ? entity.getUser().getId() : null,
                entity.getScenario() != null ? entity.getScenario().getId() : null,
                entity.getStartedAt(),
                entity.getEndedAt(),
                entity.getScoreGained(),
                entity.getStatus(),
                earnedExp,
                newTotalExp,
                rankChanged
        );
    }
}
