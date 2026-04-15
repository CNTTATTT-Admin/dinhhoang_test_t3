package com.example.cybershield.controller;

import com.example.cybershield.dto.request.ScenarioRequest;
import com.example.cybershield.dto.response.ScenarioResponse;
import com.example.cybershield.service.ScenarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/scenarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminScenarioController {

    private final ScenarioService scenarioService;

    @GetMapping
    public ResponseEntity<List<ScenarioResponse>> getAllScenarios() {
        return ResponseEntity.ok(scenarioService.getAll(null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScenarioResponse> getScenarioById(@PathVariable UUID id) {
        return ResponseEntity.ok(scenarioService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ScenarioResponse> createScenario(@Valid @RequestBody ScenarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scenarioService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScenarioResponse> updateScenario(
            @PathVariable UUID id,
            @Valid @RequestBody ScenarioRequest request
    ) {
        return ResponseEntity.ok(scenarioService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteScenario(@PathVariable UUID id) {
        scenarioService.delete(id);
        return ResponseEntity.ok("Đã xóa Scenario thành công!");
    }
}
