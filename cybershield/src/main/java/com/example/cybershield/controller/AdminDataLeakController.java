package com.example.cybershield.controller;

import com.example.cybershield.dto.request.DataLeakRequest;
import com.example.cybershield.dto.response.DataLeakResponse;
import com.example.cybershield.service.DataLeakService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/data-leaks")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDataLeakController {

    private final DataLeakService dataLeakService;

    @GetMapping
    public ResponseEntity<List<DataLeakResponse>> getAllDataLeaks() {
        return ResponseEntity.ok(dataLeakService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DataLeakResponse> getDataLeakById(@PathVariable UUID id) {
        return ResponseEntity.ok(dataLeakService.getById(id));
    }

    @PostMapping
    public ResponseEntity<DataLeakResponse> createDataLeak(@Valid @RequestBody DataLeakRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(dataLeakService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DataLeakResponse> updateDataLeak(
            @PathVariable UUID id,
            @Valid @RequestBody DataLeakRequest request
    ) {
        return ResponseEntity.ok(dataLeakService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDataLeak(@PathVariable UUID id) {
        dataLeakService.delete(id);
        return ResponseEntity.ok("Đã xóa Data Leak thành công!");
    }
}
