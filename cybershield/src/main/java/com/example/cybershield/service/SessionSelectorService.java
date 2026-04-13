package com.example.cybershield.service;

import com.example.cybershield.dto.response.SessionSelectorResponse;
import com.example.cybershield.entity.ScenarioStep;
import com.example.cybershield.entity.User;
import com.example.cybershield.entity.UserScenarioProgress;
import com.example.cybershield.repository.ScenarioStepRepository;
import com.example.cybershield.repository.UserRepository;
import com.example.cybershield.repository.UserScenarioProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionSelectorService {

    private final ScenarioStepRepository scenarioStepRepository;
    private final UserRepository userRepository;
    private final UserScenarioProgressRepository progressRepository;

    public List<SessionSelectorResponse> getSessionsByScenario(UUID scenarioId, Authentication authentication) {
        List<ScenarioStep> steps = scenarioStepRepository.findByScenarioIdOrderByStepOrderAsc(scenarioId);
        User user = resolveAuthenticatedUser(authentication);
        int highestStepReached = resolveHighestStepReached(user, scenarioId);
        return mapOrderedSessions(steps, scenarioId, highestStepReached);
    }

    private User resolveAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String username = null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails details) {
            username = details.getUsername();
        } else if (principal instanceof String p && !"anonymousUser".equalsIgnoreCase(p)) {
            username = p;
        }
        if (username == null || username.isBlank()) {
            return null;
        }
        return userRepository.findByUsername(username).orElse(null);
    }

    private List<SessionSelectorResponse> mapOrderedSessions(
            List<ScenarioStep> steps,
            UUID scenarioId,
            int highestStepReached
    ) {
        List<SessionSelectorResponse> results = new java.util.ArrayList<>();

        for (ScenarioStep step : steps) {
            int stepOrder = Math.max(1, step.getStepOrder());
            boolean isCompleted = stepOrder <= highestStepReached;
            boolean isLocked = stepOrder > (highestStepReached + 1);
            results.add(mapToSelector(step, scenarioId, isCompleted, isLocked));
        }
        return results;
    }

    private int resolveHighestStepReached(User user, UUID scenarioId) {
        if (user == null) return 0;
        UserScenarioProgress progress = progressRepository
                .findByUserIdAndScenarioId(user.getId(), scenarioId)
                .orElse(null);
        if (progress == null) return 0;
        return Math.max(0, progress.getHighestStepReached());
    }

    private SessionSelectorResponse mapToSelector(
            ScenarioStep step,
            UUID scenarioId,
            boolean isCompleted,
            boolean isLocked
    ) {
        int threatLevel = switch (step.getStepType() == null ? "" : step.getStepType().toUpperCase()) {
            case "MAIL" -> 1;
            case "WEB_PAGE" -> 2;
            case "OTP" -> 3;
            case "ZALO" -> 2;
            default -> 1;
        };

        String lessonTitle = "Bài " + step.getStepOrder() + ": " + buildLessonTitle(step);
        String objective = (step.getAiFeedback() == null || step.getAiFeedback().isBlank())
                ? "Học cách soi kỹ địa chỉ người gửi, nội dung và liên kết trước khi quyết định."
                : step.getAiFeedback();

        return new SessionSelectorResponse(
                step.getId(),
                scenarioId,
                step.getStepOrder(),
                lessonTitle,
                Math.min(5, Math.max(1, threatLevel)),
                objective,
                isCompleted,
                isLocked
        );
    }

    private String buildLessonTitle(ScenarioStep step) {
        String type = step.getStepType() == null ? "" : step.getStepType().toUpperCase();
        return switch (type) {
            case "MAIL" -> "Nhận diện Email giả mạo đại trà";
            case "WEB_PAGE" -> "Kiểm tra Landing Page đáng ngờ";
            case "OTP" -> "Phòng thủ yêu cầu OTP bất thường";
            case "ZALO" -> "Xác minh tin nhắn mạo danh";
            default -> "Tình huống mô phỏng an toàn thông tin";
        };
    }

}

