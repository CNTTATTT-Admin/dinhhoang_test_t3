package com.example.cybershield.dto.response;

import java.util.List;

public record SessionSubmitResponse(
        int earnedExp,
        int totalExp,
        int serverScore,
        boolean isPassed,
        List<String> feedbackMessages
) {
}

