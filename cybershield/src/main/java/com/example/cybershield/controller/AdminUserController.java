package com.example.cybershield.controller;

import com.example.cybershield.dto.request.UpdateUserRoleRequest;
import com.example.cybershield.dto.response.AdminUserResponse;
import com.example.cybershield.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(adminUserService.getById(id));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<AdminUserResponse> updateUserRole(
            @PathVariable UUID id,
            @RequestBody UpdateUserRoleRequest request
    ) {
        return ResponseEntity.ok(adminUserService.updateRole(id, request));
    }
}

