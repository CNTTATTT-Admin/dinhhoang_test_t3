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
        boolean isLocked
) {
    public static ScenarioResponse fromEntity(Scenario entity) {
        return fromEntity(entity, false);
    }

    public static ScenarioResponse fromEntity(Scenario entity, boolean isLocked) {
        return new ScenarioResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getCategory(),
                entity.getDifficulty(),
                entity.getThumbnailUrl(),
                entity.getDescription(),
                entity.getRewardExp() == null ? 300 : entity.getRewardExp(),
                isLocked
        );
    }
}
