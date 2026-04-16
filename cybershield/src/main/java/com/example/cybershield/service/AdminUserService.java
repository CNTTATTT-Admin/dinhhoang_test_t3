package com.example.cybershield.service;

import com.example.cybershield.dto.request.UpdateUserRoleRequest;
import com.example.cybershield.dto.response.AdminUserResponse;
import com.example.cybershield.entity.User;
import com.example.cybershield.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    public List<AdminUserResponse> getAll() {
        return userRepository.findAll().stream()
                .map(AdminUserResponse::fromEntity)
                .toList();
    }

    public AdminUserResponse getById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        return AdminUserResponse.fromEntity(user);
    }

    public AdminUserResponse updateRole(UUID id, UpdateUserRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        String normalized = normalizeRole(request.role());
        user.setRole(normalized);
        userRepository.save(user);

        return AdminUserResponse.fromEntity(user);
    }

    private String normalizeRole(String role) {
        if (role == null) {
            throw new IllegalArgumentException("role không hợp lệ");
        }

        String trimmed = role.trim().toUpperCase();
        return switch (trimmed) {
            case "ADMIN", "ROLE_ADMIN" -> "ROLE_ADMIN";
            case "USER", "ROLE_USER" -> "ROLE_USER";
            default -> throw new IllegalArgumentException("role không hợp lệ: " + role);
        };
    }
}

