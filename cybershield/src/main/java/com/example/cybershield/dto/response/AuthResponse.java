package com.example.cybershield.dto.response;

public record AuthResponse(
        String token,
        String username,
        String role
) {}