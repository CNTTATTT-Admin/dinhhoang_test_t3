package com.example.cybershield.dto.response;

/**
 * Metadata cho màn chơi theo từng bước (MAIL / WEB_PAGE / OTP / ZALO).
 */
public record PlayContextResponse(
        String stepType,
        String content,
        boolean phishingScenario,
        LandingInfo landing
) {
    public record LandingInfo(
            String templateName,
            String fakeUrl,
            String requiredFields
    ) {}
}
