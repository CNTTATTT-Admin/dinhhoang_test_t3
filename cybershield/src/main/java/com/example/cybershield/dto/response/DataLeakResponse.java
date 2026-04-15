package com.example.cybershield.dto.response;

import com.example.cybershield.entity.DataLeak;

import java.time.LocalDateTime;
import java.util.UUID;

public record DataLeakResponse(
        UUID id,
        UUID userId,
        UUID sessionId,
        String dataType,
        String leakedValue,
        LocalDateTime leakedAt
) {
    public static DataLeakResponse fromEntity(DataLeak entity) {
        return new DataLeakResponse(
                entity.getId(),
                entity.getUser() != null ? entity.getUser().getId() : null,
                entity.getSession() != null ? entity.getSession().getId() : null,
                entity.getDataType(),
                entity.getLeakedValue(),
                entity.getLeakedAt()
        );
    }
}
