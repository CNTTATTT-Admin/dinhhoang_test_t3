package com.example.cybershield.dto.response;

import com.example.cybershield.entity.Badge;

public record BadgeResponse(
        Integer id,
        String name,
        String iconUrl,
        Integer requiredExp
) {
    public static BadgeResponse fromEntity(Badge entity) {
        return new BadgeResponse(
                entity.getId(),
                entity.getName(),
                entity.getIconUrl(),
                entity.getRequiredExp()
        );
    }
}
