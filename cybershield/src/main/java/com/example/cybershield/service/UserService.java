package com.example.cybershield.service;

import com.example.cybershield.entity.User;
import com.example.cybershield.repository.UserRepository;

import com.example.cybershield.dto.request.UpdateProfileRequest;
import com.example.cybershield.dto.request.ChangePasswordRequest;
import com.example.cybershield.dto.response.UserProfileResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // 1. Xem thông tin cá nhân & Chỉ số rủi ro (Profile)
    public UserProfileResponse getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getAvatarUrl(),
                user.getLevel(),
                user.getTotalExp(),
                user.getTrapClicks(),
                user.getCorrectReports(),
                user.getAvgResponseTime()
        );
    }

    // 2. Cập nhật thông tin cơ bản (Ví dụ: Đổi Avatar)
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        user.setAvatarUrl(request.avatarUrl());
        userRepository.save(user);

        // Trả về profile mới nhất sau khi cập nhật
        return getUserProfile(userId);
    }

    // 3. Đổi mật khẩu
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        // Kiểm tra mật khẩu cũ có khớp không (Tạm thời so sánh trực tiếp)
        if (!user.getPasswordHash().equals(request.oldPassword())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác!");
        }

        // Cập nhật mật khẩu mới
        user.setPasswordHash(request.newPassword());
        userRepository.save(user);
    }
}