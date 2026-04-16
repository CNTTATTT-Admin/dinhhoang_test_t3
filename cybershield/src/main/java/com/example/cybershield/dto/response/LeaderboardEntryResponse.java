package com.example.cybershield.dto.response;

import java.util.UUID;

public record LeaderboardEntryResponse(
        UUID id,
        String username,
        int level,
        int totalExp
) {
}

