package com.example.cybershield.dto.response;

import java.util.UUID;

public record AuthResponse(
        String token,
        UUID id,
        String username,
        String role
) {}