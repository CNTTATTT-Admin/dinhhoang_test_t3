package com.example.cybershield.dto.response;

import com.example.cybershield.entity.LandingPage;
import java.util.UUID;

public record LandingPageResponse(
        UUID id,
        UUID stepId,
        String templateName,
        String fakeUrl,
        String requiredFields
) {
    // Hàm mapper chuyển từ Entity sang DTO
    public static LandingPageResponse fromEntity(LandingPage entity) {
        return new LandingPageResponse(
                entity.getId(),
                entity.getStep() != null ? entity.getStep().getId() : null,
                entity.getTemplateName(),
                entity.getFakeUrl(),
                entity.getRequiredFields()
        );
    }
}