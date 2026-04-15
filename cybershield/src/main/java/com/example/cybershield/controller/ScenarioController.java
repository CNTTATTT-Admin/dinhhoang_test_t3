package com.example.cybershield.controller;

import com.example.cybershield.dto.response.ScenarioResponse;
import com.example.cybershield.service.ScenarioService;
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
@RequestMapping("/api/scenarios")
@RequiredArgsConstructor
public class ScenarioController {

    private final ScenarioService scenarioService;

    @GetMapping
    public ResponseEntity<List<ScenarioResponse>> getAllScenarios(Authentication authentication) {
        return ResponseEntity.ok(scenarioService.getAll(authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScenarioResponse> getScenarioById(@PathVariable UUID id) {
        return ResponseEntity.ok(scenarioService.getById(id));
    }
}

