package com.example.cybershield.dto.response;

import com.example.cybershield.entity.VirtualInboxEmail;

import java.util.List;

public record VirtualInboxEmailResponse(
        Long id,
        String senderEmail,
        String senderName,
        String subject,
        String body,
        String linkUrl,
        String linkLabel,
        boolean isPhishing,
        List<String> redFlags
) {
    public static VirtualInboxEmailResponse fromEntity(VirtualInboxEmail entity) {
        return new VirtualInboxEmailResponse(
                entity.getId(),
                entity.getSenderEmail(),
                entity.getSenderName(),
                entity.getSubject(),
                entity.getBody(),
                entity.getLinkUrl(),
                entity.getLinkLabel(),
                entity.isPhishing(),
                entity.getRedFlags() != null ? List.copyOf(entity.getRedFlags()) : List.of()
        );
    }
}
