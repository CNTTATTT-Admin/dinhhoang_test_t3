package com.example.cybershield.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserRoleRequest(
        @NotBlank(message = "role không được để trống")
        String role
) {
}

