package com.example.cybershield.dto.response;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String username,
        String avatarUrl,
        int level,
        int totalExp,
        int trapClicks,
        int correctReports,
        float avgResponseTime
) {}