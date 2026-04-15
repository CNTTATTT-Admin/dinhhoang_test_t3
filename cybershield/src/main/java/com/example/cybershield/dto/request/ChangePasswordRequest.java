package com.example.cybershield.dto.request;

public record ChangePasswordRequest(
        String oldPassword,
        String newPassword
) {}