package com.example.cybershield.dto.response;

import com.example.cybershield.entity.VirtualInboxEmail;

import java.util.List;

public record VirtualInboxEmailResponse(
        Long id,
        int sortOrder,
        String slotTag,
        String emailType,
        String senderEmail,
        String senderName,
        String subject,
        String body,
        String linkUrl,
        String linkLabel,
        boolean isPhishing,
        List<String> redFlags,
        String attachmentJson
) {
    public static VirtualInboxEmailResponse fromEntity(VirtualInboxEmail entity) {
        return fromEntity(entity, entity.getSortOrder());
    }

    /** sortOrder hiển thị (vd. sau shuffle MIXED_INBOX); id và nội dung giữ theo entity. */
    public static VirtualInboxEmailResponse fromEntity(VirtualInboxEmail entity, int displaySortOrder) {
        return new VirtualInboxEmailResponse(
                entity.getId(),
                displaySortOrder,
                entity.getSlotTag(),
                entity.getEmailType(),
                entity.getSenderEmail(),
                entity.getSenderName(),
                entity.getSubject(),
                entity.getBody(),
                entity.getLinkUrl(),
                entity.getLinkLabel(),
                entity.isPhishing(),
                entity.getRedFlags() != null ? List.copyOf(entity.getRedFlags()) : List.of(),
                entity.getAttachmentJson()
        );
    }
}
