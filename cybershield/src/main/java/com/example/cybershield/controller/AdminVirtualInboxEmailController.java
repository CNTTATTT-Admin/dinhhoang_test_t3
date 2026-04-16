package com.example.cybershield.controller;

import com.example.cybershield.dto.request.AdminVirtualInboxEmailRequest;
import com.example.cybershield.dto.response.VirtualInboxEmailResponse;
import com.example.cybershield.service.AdminVirtualInboxEmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/inbox-emails")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminVirtualInboxEmailController {

    private final AdminVirtualInboxEmailService service;

    @GetMapping
    public ResponseEntity<List<VirtualInboxEmailResponse>> listByScenarioStep(
            @RequestParam UUID stepId
    ) {
        return ResponseEntity.ok(service.getByScenarioStepId(stepId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VirtualInboxEmailResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<VirtualInboxEmailResponse> create(
            @RequestParam UUID stepId,
            @Valid @RequestBody AdminVirtualInboxEmailRequest request
    ) {
        return ResponseEntity.ok(service.create(stepId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VirtualInboxEmailResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AdminVirtualInboxEmailRequest request
    ) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok("Đã xóa VirtualInboxEmail thành công!");
    }
}

