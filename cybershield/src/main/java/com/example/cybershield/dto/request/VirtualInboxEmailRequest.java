package com.example.cybershield.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Payload tạo/cập nhật email inbox ảo (admin hoặc seed).
 */
public record VirtualInboxEmailRequest(
        @NotBlank String senderEmail,
        String senderName,
        @NotBlank String subject,
        @NotBlank String body,
        String linkUrl,
        String linkLabel,
        @NotNull Boolean isPhishing,
        List<String> redFlags
) {}
