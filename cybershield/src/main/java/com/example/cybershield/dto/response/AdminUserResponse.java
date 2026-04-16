package com.example.cybershield.dto.response;

import com.example.cybershield.entity.User;

import java.util.UUID;

public record AdminUserResponse(
        UUID id,
        String username,
        String avatarUrl,
        int level,
        int totalExp,
        String role
) {
    public static AdminUserResponse fromEntity(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getUsername(),
                user.getAvatarUrl(),
                user.getLevel(),
                user.getTotalExp(),
                user.getRole()
        );
    }
}

