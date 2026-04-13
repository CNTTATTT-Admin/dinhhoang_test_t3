package com.example.cybershield.controller;

import com.example.cybershield.dto.response.SessionSelectorResponse;
import com.example.cybershield.service.SessionSelectorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/scenarios/{scenarioId}/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionSelectorService sessionSelectorService;

    @GetMapping
    public ResponseEntity<List<SessionSelectorResponse>> getSessionsByScenario(
            @PathVariable UUID scenarioId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(sessionSelectorService.getSessionsByScenario(scenarioId, authentication));
    }
}

