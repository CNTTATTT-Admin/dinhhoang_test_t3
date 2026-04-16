package com.example.cybershield.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Payload CRUD cho VirtualInboxEmail (admin).
 *
 * Lưu ý: request này bao gồm thêm các field phục vụ MAIL_FILE / shuffle MIXED_INBOX,
 * như `attachmentJson` và `slotTag`.
 */
public record AdminVirtualInboxEmailRequest(
        String emailType,
        String slotTag,
        @NotBlank String senderEmail,
        String senderName,
        @NotBlank String subject,
        @NotBlank String body,
        String linkUrl,
        String linkLabel,
        @NotNull Boolean isPhishing,
        List<String> redFlags,
        String attachmentJson,
        Integer sortOrder
) {
}

