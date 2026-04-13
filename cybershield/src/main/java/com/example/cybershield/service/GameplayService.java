package com.example.cybershield.service;

import com.example.cybershield.dto.request.EmailDecision;
import com.example.cybershield.dto.request.SessionSubmitRequest;
import com.example.cybershield.dto.response.SessionSubmitResponse;
import com.example.cybershield.entity.Scenario;
import com.example.cybershield.entity.ScenarioStep;
import com.example.cybershield.entity.SessionDetail;
import com.example.cybershield.entity.TrainingSession;
import com.example.cybershield.entity.User;
import com.example.cybershield.entity.UserScenarioProgress;
import com.example.cybershield.entity.VirtualInboxEmail;
import com.example.cybershield.repository.ScenarioStepRepository;
import com.example.cybershield.repository.SessionDetailRepository;
import com.example.cybershield.repository.TrainingSessionRepository;
import com.example.cybershield.repository.UserRepository;
import com.example.cybershield.repository.UserScenarioProgressRepository;
import com.example.cybershield.repository.VirtualInboxEmailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GameplayService {

    private static final String ACTION_VERIFIED = "VERIFIED";
    private static final String ACTION_QUARANTINE = "QUARANTINE";

    private final UserRepository userRepository;
    private final TrainingSessionRepository trainingSessionRepository;
    private final SessionDetailRepository sessionDetailRepository;
    private final ScenarioStepRepository scenarioStepRepository;
    private final UserScenarioProgressRepository progressRepository;
    private final VirtualInboxEmailRepository virtualInboxEmailRepository;

    @Transactional
    public SessionSubmitResponse submitSession(
            UUID stepId,
            Authentication authentication,
            SessionSubmitRequest request
    ) {
        User user = resolveAuthenticatedUser(authentication);
        ScenarioStep currentStep = scenarioStepRepository.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy session hợp lệ!"));
        Scenario scenario = currentStep.getScenario();
        if (scenario == null) {
            throw new RuntimeException("Session hiện tại chưa gắn với kịch bản.");
        }

        TrainingSession session = new TrainingSession();
        session.setUser(user);
        session.setScenario(scenario);
        session.setStartedAt(LocalDateTime.now().minusSeconds(Math.max(1, request.timeTakenSeconds())));

        session.setEndedAt(LocalDateTime.now());
        session.setScoreGained(request.finalScore());
        session.setStatus("IN_PROGRESS");
        trainingSessionRepository.save(session);

        List<EmailDecision> decisions = request.emailDecisions() == null ? List.of() : request.emailDecisions();
        int falsePositive = 0;
        int falseNegative = 0;
        List<String> feedbackMessages = new ArrayList<>();

        List<ScenarioStep> scenarioSteps = scenarioStepRepository
                .findByScenarioIdOrderByStepOrderAsc(scenario.getId());
        float avgDecisionTime = decisions.isEmpty()
                ? 0f
                : Math.max(0f, request.timeTakenSeconds()) / decisions.size();

        for (EmailDecision decision : decisions) {
            String action = normalizeAction(decision.userAction());
            boolean actualPhishing = Boolean.TRUE.equals(decision.isPhishing());
            boolean markedQuarantine = ACTION_QUARANTINE.equals(action);
            boolean isCorrect = (actualPhishing && markedQuarantine) || (!actualPhishing && !markedQuarantine);

            if (!actualPhishing && markedQuarantine) {
                falsePositive++;
                feedbackMessages.add(buildFeedback(decision.emailId(),
                        "False Positive: Đây là mail an toàn nhưng bạn đã quarantine."));
            } else if (actualPhishing && !markedQuarantine) {
                falseNegative++;
                feedbackMessages.add(buildFeedback(decision.emailId(),
                        "False Negative: Bạn đã tin tưởng mail phishing. Đây là lỗi nguy hiểm."));
            }

            SessionDetail detail = new SessionDetail();
            detail.setSession(session);
            detail.setStep(currentStep);
            detail.setUserAction(markedQuarantine ? "REPORT" : "VERIFIED");
            detail.setResponseTime(avgDecisionTime);
            detail.setCorrect(isCorrect);
            sessionDetailRepository.save(detail);
        }

        boolean passed = falseNegative == 0 && session.getScoreGained() >= 0;
        session.setStatus(passed ? "COMPLETED" : "FAILED");
        trainingSessionRepository.save(session);

        int scenarioStepCount = scenarioStepRepository.countByScenarioId(scenario.getId());
        UserScenarioProgress progress = progressRepository
                .findByUserIdAndScenarioId(user.getId(), scenario.getId())
                .orElseGet(() -> {
                    UserScenarioProgress p = new UserScenarioProgress();
                    p.setUser(user);
                    p.setScenario(scenario);
                    return p;
                });

        int previousHighestStep = Math.max(0, progress.getHighestStepReached());
        int reached = passed ? currentStep.getStepOrder() : Math.max(1, previousHighestStep);
        progress.setHighestStepReached(Math.max(progress.getHighestStepReached(), reached));
        progress.setBestScore(Math.max(progress.getBestScore(), session.getScoreGained()));

        int earnedExp = 0;
        if (passed && currentStep.getStepOrder() > previousHighestStep) {
            int totalRewardExp = scenario.getRewardExp() == null ? 300 : Math.max(0, scenario.getRewardExp());
            int stepCount = Math.max(1, scenarioStepCount);
            int baseStepExp = totalRewardExp / stepCount;
            int remainder = totalRewardExp % stepCount;
            // Dồn phần dư vào step cuối để đảm bảo tổng EXP nhận đủ rewardExp của scenario.
            int stepRewardExp = baseStepExp + (currentStep.getStepOrder() >= stepCount ? remainder : 0);
            earnedExp += Math.max(0, stepRewardExp);
        }

        boolean completedCurrentSession = passed && currentStep.getStepOrder() >= scenarioStepCount;
        if (completedCurrentSession) {
            boolean completedBefore = progress.isScenarioCompleted();
            progress.setScenarioCompleted(true);
            if (completedBefore) {
                // Replay step cuối sau khi đã clear campaign trước đó không được nhận thêm EXP.
                earnedExp = 0;
            }
        }

        if (earnedExp > 0) {
            user.setTotalExp(user.getTotalExp() + earnedExp);
            user.setLevel(calculateLevelFromExp(user.getTotalExp()));
            userRepository.save(user);
        }

        progressRepository.save(progress);
        if (feedbackMessages.isEmpty() && passed) {
            feedbackMessages.add("Xử lý chính xác. Tiếp tục duy trì thói quen soi người gửi và URL.");
        }

        return new SessionSubmitResponse(
                earnedExp,
                user.getTotalExp(),
                passed,
                feedbackMessages
        );
    }

    private String normalizeAction(String action) {
        if (action == null) return ACTION_VERIFIED;
        String normalized = action.trim().toUpperCase(Locale.ROOT);
        if (normalized.equals("REPORT")) return ACTION_QUARANTINE;
        return normalized;
    }

    private String buildFeedback(Long emailId, String fallback) {
        if (emailId == null) return fallback;
        VirtualInboxEmail email = virtualInboxEmailRepository.findById(emailId).orElse(null);
        if (email == null) return fallback;
        return "Mail \"" + email.getSubject() + "\": " + fallback;
    }

    private int calculateLevelFromExp(int totalExp) {
        int normalizedExp = Math.max(0, totalExp);
        return Math.min(100, (normalizedExp / 750) + 1);
    }

    private User resolveAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Bạn cần đăng nhập để gửi kết quả chơi.");
        }
        Object principal = authentication.getPrincipal();
        String username;
        if (principal instanceof UserDetails details) {
            username = details.getUsername();
        } else if (principal instanceof String text && !"anonymousUser".equalsIgnoreCase(text)) {
            username = text;
        } else {
            throw new RuntimeException("Không xác định được người dùng đăng nhập.");
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
    }
}

