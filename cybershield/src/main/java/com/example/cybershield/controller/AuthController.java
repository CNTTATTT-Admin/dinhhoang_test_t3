package com.example.cybershield.controller;

import com.example.cybershield.dto.request.LoginRequest;
import com.example.cybershield.dto.request.RegisterRequest;
import com.example.cybershield.dto.response.AuthResponse;
import com.example.cybershield.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String bearerToken) {
        // Cắt bỏ chữ "Bearer " ở đầu để lấy đúng chuỗi JWT
        String token = bearerToken.startsWith("Bearer ") ? bearerToken.substring(7) : bearerToken;
        authService.logout(token);
        return ResponseEntity.ok("Đăng xuất thành công!");
    }
}