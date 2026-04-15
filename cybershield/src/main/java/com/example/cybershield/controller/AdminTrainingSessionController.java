package com.example.cybershield.controller;

import com.example.cybershield.dto.request.TrainingSessionRequest;
import com.example.cybershield.dto.response.TrainingSessionResponse;
import com.example.cybershield.service.TrainingSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/training-sessions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTrainingSessionController {

    private final TrainingSessionService trainingSessionService;

    @GetMapping
    public ResponseEntity<List<TrainingSessionResponse>> getAllTrainingSessions() {
        return ResponseEntity.ok(trainingSessionService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingSessionResponse> getTrainingSessionById(@PathVariable UUID id) {
        return ResponseEntity.ok(trainingSessionService.getById(id));
    }

    @PostMapping
    public ResponseEntity<TrainingSessionResponse> createTrainingSession(
            @Valid @RequestBody TrainingSessionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trainingSessionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainingSessionResponse> updateTrainingSession(
            @PathVariable UUID id,
            @Valid @RequestBody TrainingSessionRequest request
    ) {
        return ResponseEntity.ok(trainingSessionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTrainingSession(@PathVariable UUID id) {
        trainingSessionService.delete(id);
        return ResponseEntity.ok("Đã xóa Training Session thành công!");
    }
}
