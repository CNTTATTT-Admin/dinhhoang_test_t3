package com.example.cybershield.dto.response;

import java.util.List;

public record SessionSubmitResponse(
        int earnedExp,
        int totalExp,
        boolean isPassed,
        List<String> feedbackMessages
) {
}

