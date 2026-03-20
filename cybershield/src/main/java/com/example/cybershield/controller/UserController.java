package com.example.cybershield.controller;

import com.example.cybershield.dto.request.ChangePasswordRequest;
import com.example.cybershield.dto.request.UpdateProfileRequest;
import com.example.cybershield.dto.response.UserProfileResponse;
import com.example.cybershield.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Chỉ những ai có ROLE_USER hoặc ROLE_ADMIN mới được xem thông tin
    @GetMapping("/{id}/profile")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserProfile(id));
    }

    // Tương tự, cần đăng nhập để cập nhật avatar
    @PutMapping("/{id}/profile")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @PathVariable UUID id,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(id, request));
    }

    // Đổi mật khẩu
    @PutMapping("/{id}/password")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<String> changePassword(
            @PathVariable UUID id,
            @RequestBody ChangePasswordRequest request) {
        userService.changePassword(id, request);
        return ResponseEntity.ok("Đổi mật khẩu thành công!");
    }
}