package com.example.cybershield.controller;

import com.example.cybershield.dto.request.BadgeRequest;
import com.example.cybershield.dto.response.BadgeResponse;
import com.example.cybershield.service.BadgeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/badges")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBadgeController {

    private final BadgeService badgeService;

    @GetMapping
    public ResponseEntity<List<BadgeResponse>> getAllBadges() {
        return ResponseEntity.ok(badgeService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BadgeResponse> getBadgeById(@PathVariable Integer id) {
        return ResponseEntity.ok(badgeService.getById(id));
    }

    @PostMapping
    public ResponseEntity<BadgeResponse> createBadge(@Valid @RequestBody BadgeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(badgeService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BadgeResponse> updateBadge(
            @PathVariable Integer id,
            @Valid @RequestBody BadgeRequest request
    ) {
        return ResponseEntity.ok(badgeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBadge(@PathVariable Integer id) {
        badgeService.delete(id);
        return ResponseEntity.ok("Đã xóa Badge thành công!");
    }
}
