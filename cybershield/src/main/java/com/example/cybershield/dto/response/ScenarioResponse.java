package com.example.cybershield.dto.response;

import com.example.cybershield.entity.Scenario;

import java.util.UUID;

public record ScenarioResponse(
        UUID id,
        String title,
        String category,
        String difficulty,
        String thumbnailUrl,
        String description,
        int rewardExp,
        int tutorialMode,
        boolean isLocked,
        boolean isCompleted
) {
    public static ScenarioResponse fromEntity(Scenario entity) {
        return fromEntity(entity, false, false);
    }

    public static ScenarioResponse fromEntity(Scenario entity, boolean isLocked) {
        return fromEntity(entity, isLocked, false);
    }

    public static ScenarioResponse fromEntity(Scenario entity, boolean isLocked, boolean isCompleted) {
        return new ScenarioResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getCategory(),
                entity.getDifficulty(),
                entity.getThumbnailUrl(),
                entity.getDescription(),
                entity.getRewardExp() == null ? 300 : entity.getRewardExp(),
                entity.getTutorialMode() == null ? 0 : entity.getTutorialMode(),
                isLocked,
                isCompleted
        );
    }
}
