package com.example.cybershield.service;

import com.example.cybershield.entity.User;
import com.example.cybershield.entity.SessionDetail;
import com.example.cybershield.repository.UserRepository;
import com.example.cybershield.repository.SessionDetailRepository;
import com.example.cybershield.repository.DataLeakRepository;
import com.example.cybershield.repository.TrainingSessionRepository;

import com.example.cybershield.dto.request.UpdateProfileRequest;
import com.example.cybershield.dto.request.ChangePasswordRequest;
import com.example.cybershield.dto.response.UserAnalyticsResponse;
import com.example.cybershield.dto.response.UserProfileResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final SessionDetailRepository sessionDetailRepository;
    private final DataLeakRepository dataLeakRepository;
    private final TrainingSessionRepository trainingSessionRepository;

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

    public UserAnalyticsResponse getUserAnalytics(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        List<SessionDetail> details = sessionDetailRepository.findBySessionUserId(user.getId());

        long phishingHandledCorrect = 0;
        long phishingTotal = 0;
        long safeReportedWrong = 0;
        long safeTotal = 0;
        List<Float> responseTimes = new ArrayList<>();

        for (SessionDetail detail : details) {
            boolean isReport = "REPORT".equalsIgnoreCase(detail.getUserAction());
            boolean isCorrect = detail.isCorrect();

            // Phishing event:
            // - report đúng (REPORT + correct)
            // - hoặc verify sai (VERIFIED + !correct)
            boolean isPhishingEvent = (isReport && isCorrect) || (!isReport && !isCorrect);
            if (isPhishingEvent) {
                phishingTotal++;
                if (isReport && isCorrect) {
                    phishingHandledCorrect++;
                }
            } else {
                safeTotal++;
                if (isReport && !isCorrect) {
                    safeReportedWrong++;
                }
            }

            if (detail.getResponseTime() > 0) {
                responseTimes.add(detail.getResponseTime());
            }
        }

        long userReportCount = Math.max(0, user.getCorrectReports());
        long userTrapCount = Math.max(0, user.getTrapClicks());
        double fallbackDetectionRate = (userReportCount + userTrapCount) == 0
                ? 50d
                : (userReportCount * 100d) / (userReportCount + userTrapCount);
        double fallbackFalsePositiveRate = (userReportCount + userTrapCount) == 0
                ? 50d
                : (userTrapCount * 100d) / (userReportCount + userTrapCount);

        double rawDetectionRate = phishingTotal == 0
                ? fallbackDetectionRate
                : (phishingHandledCorrect * 100d) / phishingTotal;
        double rawFalsePositiveRate = safeTotal == 0
                ? fallbackFalsePositiveRate
                : (safeReportedWrong * 100d) / safeTotal;
        double detectionRate = smoothRate(rawDetectionRate, phishingTotal, 12, 50d);
        double falsePositiveRate = smoothRate(rawFalsePositiveRate, safeTotal, 12, 50d);
        double medianResponseTime = responseTimes.isEmpty()
                ? Math.max(0d, user.getAvgResponseTime())
                : calculateMedian(responseTimes);

        long leakEvents = dataLeakRepository.countByUserId(user.getId());
        long totalCriticalEvents = phishingTotal;
        double rawLeakPreventionRate = totalCriticalEvents <= 0
                ? 50d
                : Math.max(0d, 1d - (leakEvents * 1d / totalCriticalEvents)) * 100d;
        double leakPreventionRate = smoothRate(rawLeakPreventionRate, totalCriticalEvents, 10, 50d);

        long totalSessions = trainingSessionRepository.countByUserId(user.getId());
        long leakedSessions = dataLeakRepository.countDistinctSessionIdByUserId(user.getId());
        double rawCleanSessionRate = totalSessions == 0
                ? 50d
                : Math.max(0d, ((totalSessions - leakedSessions) * 100d) / totalSessions);
        double cleanSessionRate = smoothRate(rawCleanSessionRate, totalSessions, 6, 50d);

        return new UserAnalyticsResponse(
                round2(detectionRate),
                round2(falsePositiveRate),
                round2(medianResponseTime),
                round2(leakPreventionRate),
                round2(cleanSessionRate),
                phishingTotal,
                safeTotal,
                totalSessions,
                leakEvents
        );
    }

    private double calculateMedian(List<Float> values) {
        if (values == null || values.isEmpty()) return 0d;
        Collections.sort(values);
        int n = values.size();
        if (n % 2 == 1) {
            return values.get(n / 2);
        }
        return (values.get((n / 2) - 1) + values.get(n / 2)) / 2d;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private double smoothRate(double rawRate, long sampleSize, long minSampleSize, double neutralRate) {
        if (minSampleSize <= 0) {
            return clamp01Rate(rawRate);
        }
        double confidence = Math.min(1d, Math.max(0d, sampleSize * 1d / minSampleSize));
        double smoothed = (rawRate * confidence) + (neutralRate * (1d - confidence));
        return clamp01Rate(smoothed);
    }

    private double clamp01Rate(double value) {
        return Math.max(0d, Math.min(100d, value));
    }
}