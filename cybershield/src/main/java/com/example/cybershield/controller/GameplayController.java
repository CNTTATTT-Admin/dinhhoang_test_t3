package com.example.cybershield.controller;

import com.example.cybershield.dto.request.SessionSubmitRequest;
import com.example.cybershield.dto.response.PlayContextResponse;
import com.example.cybershield.dto.response.SessionSubmitResponse;
import com.example.cybershield.dto.response.VirtualInboxEmailResponse;
import com.example.cybershield.service.GameplayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/gameplay")
@RequiredArgsConstructor
public class GameplayController {

    private final GameplayService gameplayService;

    @GetMapping("/steps/{stepId}/inbox-emails")
    public ResponseEntity<List<VirtualInboxEmailResponse>> listInboxEmails(@PathVariable UUID stepId) {
        return ResponseEntity.ok(gameplayService.listInboxEmails(stepId));
    }

    @GetMapping("/steps/{stepId}/play-context")
    public ResponseEntity<PlayContextResponse> getPlayContext(@PathVariable UUID stepId) {
        return ResponseEntity.ok(gameplayService.getPlayContext(stepId));
    }

    @PostMapping("/steps/{stepId}/submit")
    public ResponseEntity<SessionSubmitResponse> submitSession(
            @PathVariable UUID stepId,
            @Valid @RequestBody SessionSubmitRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(gameplayService.submitSession(stepId, authentication, request));
    }
}

