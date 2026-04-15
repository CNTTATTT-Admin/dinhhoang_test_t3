package com.example.cybershield.controller;

import com.example.cybershield.dto.request.SessionDetailRequest;
import com.example.cybershield.dto.response.SessionDetailResponse;
import com.example.cybershield.service.SessionDetailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/session-details")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSessionDetailController {

    private final SessionDetailService sessionDetailService;

    @GetMapping
    public ResponseEntity<List<SessionDetailResponse>> getAllSessionDetails() {
        return ResponseEntity.ok(sessionDetailService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionDetailResponse> getSessionDetailById(@PathVariable UUID id) {
        return ResponseEntity.ok(sessionDetailService.getById(id));
    }

    @PostMapping
    public ResponseEntity<SessionDetailResponse> createSessionDetail(
            @Valid @RequestBody SessionDetailRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionDetailService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessionDetailResponse> updateSessionDetail(
            @PathVariable UUID id,
            @Valid @RequestBody SessionDetailRequest request
    ) {
        return ResponseEntity.ok(sessionDetailService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSessionDetail(@PathVariable UUID id) {
        sessionDetailService.delete(id);
        return ResponseEntity.ok("Đã xóa Session Detail thành công!");
    }
}
