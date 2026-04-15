package com.example.cybershield.controller;

import com.example.cybershield.dto.request.ScenarioStepRequest;
import com.example.cybershield.dto.response.ScenarioStepResponse;
import com.example.cybershield.service.ScenarioStepService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/scenario-steps")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminScenarioStepController {

    private final ScenarioStepService stepService;

    @GetMapping
    public ResponseEntity<List<ScenarioStepResponse>> getAllSteps() {
        return ResponseEntity.ok(stepService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScenarioStepResponse> getStepById(@PathVariable UUID id) {
        return ResponseEntity.ok(stepService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ScenarioStepResponse> createStep(@Valid @RequestBody ScenarioStepRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stepService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScenarioStepResponse> updateStep(
            @PathVariable UUID id,
            @Valid @RequestBody ScenarioStepRequest request) {
        return ResponseEntity.ok(stepService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStep(@PathVariable UUID id) {
        stepService.delete(id);
        return ResponseEntity.ok("Đã xóa Scenario Step thành công!");
    }
}