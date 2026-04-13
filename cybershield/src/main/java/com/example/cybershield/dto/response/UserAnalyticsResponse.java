package com.example.cybershield.dto.response;

public record UserAnalyticsResponse(
        double detectionRate,
        double falsePositiveRate,
        double medianResponseTime,
        double leakPreventionRate,
        double cleanSessionRate,
        long phishingEvents,
        long safeEvents,
        long totalSessions,
        long leakEvents
) {
}
