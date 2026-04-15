package com.example.cybershield.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SessionSubmitRequest(
        @NotNull(message = "finalScore không được để trống")
        Integer finalScore,

        @NotNull(message = "timeTakenSeconds không được để trống")
        Integer timeTakenSeconds,

        @Valid
        List<EmailDecision> emailDecisions,

        @Valid
        List<GameplayDecision> gameplayDecisions
) {
}

