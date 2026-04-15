package com.example.cybershield.controller;

import com.example.cybershield.dto.request.LandingPageRequest;
import com.example.cybershield.dto.response.LandingPageResponse;
import com.example.cybershield.service.LandingPageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/landing-pages")
@RequiredArgsConstructor
// 👇 Dòng này chặn tất cả, chỉ tài khoản có role ADMIN mới được gọi các API bên dưới
@PreAuthorize("hasRole('ADMIN')")
public class AdminLandingPageController {

    private final LandingPageService landingPageService;

    @GetMapping
    public ResponseEntity<List<LandingPageResponse>> getAllLandingPages() {
        return ResponseEntity.ok(landingPageService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LandingPageResponse> getLandingPageById(@PathVariable UUID id) {
        return ResponseEntity.ok(landingPageService.getById(id));
    }

    @PostMapping
    public ResponseEntity<LandingPageResponse> createLandingPage(@Valid @RequestBody LandingPageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(landingPageService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LandingPageResponse> updateLandingPage(
            @PathVariable UUID id,
            @Valid @RequestBody LandingPageRequest request) {
        return ResponseEntity.ok(landingPageService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLandingPage(@PathVariable UUID id) {
        landingPageService.delete(id);
        return ResponseEntity.ok("Đã xóa Landing Page thành công!");
    }
}