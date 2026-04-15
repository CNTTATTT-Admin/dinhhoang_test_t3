package com.example.cybershield.service;

import com.example.cybershield.dto.request.EmailDecision;
import com.example.cybershield.dto.request.GameplayDecision;
import com.example.cybershield.dto.request.SessionSubmitRequest;
import com.example.cybershield.dto.response.PlayContextResponse;
import com.example.cybershield.dto.response.SessionSubmitResponse;
import com.example.cybershield.dto.response.VirtualInboxEmailResponse;
import com.example.cybershield.entity.LandingPage;
import com.example.cybershield.entity.Scenario;
import com.example.cybershield.entity.ScenarioStep;
import com.example.cybershield.entity.SessionDetail;
import com.example.cybershield.entity.TrainingSession;
import com.example.cybershield.entity.User;
import com.example.cybershield.entity.UserScenarioProgress;
import com.example.cybershield.entity.VirtualInboxEmail;
import com.example.cybershield.repository.LandingPageRepository;
import com.example.cybershield.repository.ScenarioStepRepository;
import com.example.cybershield.repository.SessionDetailRepository;
import com.example.cybershield.repository.TrainingSessionRepository;
import com.example.cybershield.repository.UserRepository;
import com.example.cybershield.repository.UserScenarioProgressRepository;
import com.example.cybershield.repository.VirtualInboxEmailRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private final LandingPageRepository landingPageRepository;
    private final ObjectMapper objectMapper;

    public PlayContextResponse getPlayContext(UUID stepId) {
        ScenarioStep step = scenarioStepRepository.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy session hợp lệ!"));
        String stepType = step.getStepType() == null ? "MAIL" : step.getStepType().toUpperCase(Locale.ROOT);
        boolean phishingScenario = resolvePhishingScenario(step);
        PlayContextResponse.LandingInfo landing = null;
        if ("WEB_PAGE".equals(stepType)) {
            landing = landingPageRepository.findByStep_Id(stepId)
                    .map(this::toLandingInfo)
                    .orElse(null);
        }
        String contentForClient = step.getContent();
        if ("MAIL_OTP".equals(stepType)) {
            contentForClient = stripOtpCodeFromContentForClient(contentForClient);
        }
        return new PlayContextResponse(stepType, contentForClient, phishingScenario, landing);
    }

    /** Không gửi otpCode xuống client — chỉ có trong email đã chèn ở listInboxEmails. */
    private String stripOtpCodeFromContentForClient(String content) {
        if (content == null || content.isBlank()) {
            return content;
        }
        try {
            JsonNode root = objectMapper.readTree(content);
            if (!root.isObject()) {
                return content;
            }
            ObjectNode obj = (ObjectNode) root;
            obj.remove("otpCode");
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return content;
        }
    }

    private String extractOtpCodeFromStepContent(String content) {
        if (content == null || content.isBlank()) {
            return "";
        }
        try {
            JsonNode root = objectMapper.readTree(content);
            if (root.has("otpCode") && root.get("otpCode").isTextual()) {
                return root.get("otpCode").asText().trim();
            }
        } catch (Exception ignored) {
            // ignore
        }
        return "";
    }

    private PlayContextResponse.LandingInfo toLandingInfo(LandingPage lp) {
        return new PlayContextResponse.LandingInfo(
                lp.getTemplateName(),
                lp.getFakeUrl(),
                lp.getRequiredFields()
        );
    }

    /**
     * Mặc định các bài WEB/OTP/ZALO trong seed là kịch bản đáng ngờ (nên báo cáo / không tin).
     * Có thể đánh dấu "legit" trong JSON content nếu cần bài an toàn.
     */
    private boolean resolvePhishingScenario(ScenarioStep step) {
        String type = step.getStepType() == null ? "" : step.getStepType().toUpperCase(Locale.ROOT);
        if ("WEB_PAGE".equals(type) || "OTP".equals(type) || "ZALO".equals(type)) {
            String content = step.getContent();
            if (content != null && content.contains("\"legit\":true")) {
                return false;
            }
            return true;
        }
        return false;
    }

    public List<VirtualInboxEmailResponse> listInboxEmails(UUID stepId) {
        ScenarioStep step = scenarioStepRepository.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy session hợp lệ!"));
        List<VirtualInboxEmailResponse> list = virtualInboxEmailRepository.findByScenarioStep_IdOrderBySortOrderAsc(stepId).stream()
                .map(VirtualInboxEmailResponse::fromEntity)
                .toList();
        String stepType = step.getStepType() == null ? "" : step.getStepType().toUpperCase(Locale.ROOT);
        if (!"MAIL_OTP".equals(stepType)) {
            return list;
        }
        String otp = extractOtpCodeFromStepContent(step.getContent());
        if (otp.isEmpty()) {
            return list;
        }
        String finalOtp = otp;
        return list.stream()
                .map(r -> new VirtualInboxEmailResponse(
                        r.id(),
                        r.sortOrder(),
                        r.slotTag(),
                        r.senderEmail(),
                        r.senderName(),
                        r.subject(),
                        r.body().replace("{{OTP}}", finalOtp).replace("{{OTP_CODE}}", finalOtp),
                        r.linkUrl(),
                        r.linkLabel(),
                        r.isPhishing(),
                        r.redFlags(),
                        r.attachmentJson()
                ))
                .toList();
    }

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
        // Campaign gameplay is treated as tutorial for dashboard analytics (anti-farm metrics).
        session.setTutorialMode(true);
        trainingSessionRepository.save(session);

        List<EmailDecision> emailDecisions = request.emailDecisions() == null ? List.of() : request.emailDecisions();
        List<GameplayDecision> gameplayDecisions = request.gameplayDecisions() == null ? List.of() : request.gameplayDecisions();
        int falsePositive = 0;
        int falseNegative = 0;
        List<String> feedbackMessages = new ArrayList<>();

        List<ScenarioStep> scenarioSteps = scenarioStepRepository
                .findByScenarioIdOrderByStepOrderAsc(scenario.getId());
        String stepType = currentStep.getStepType() == null ? "MAIL" : currentStep.getStepType().toUpperCase(Locale.ROOT);
        boolean isMailOtp = "MAIL_OTP".equals(stepType);
        boolean isMailOnly = "MAIL".equals(stepType);
        boolean mailLike = isMailOnly || isMailOtp;

        int decisionCount;
        if (isMailOtp) {
            decisionCount = emailDecisions.size() + 1;
        } else if (mailLike) {
            decisionCount = emailDecisions.size();
        } else {
            decisionCount = gameplayDecisions.size();
        }
        float avgDecisionTime = decisionCount == 0
                ? 0f
                : Math.max(0f, request.timeTakenSeconds()) / decisionCount;

        if (mailLike) {
            Set<Long> validEmailIds = virtualInboxEmailRepository.findByScenarioStep_IdOrderBySortOrderAsc(stepId)
                    .stream()
                    .map(VirtualInboxEmail::getId)
                    .collect(Collectors.toSet());
            boolean enforceInboxIds = !validEmailIds.isEmpty();

            for (EmailDecision decision : emailDecisions) {
                if (enforceInboxIds && !validEmailIds.contains(decision.emailId())) {
                    throw new RuntimeException("emailId không khớp với hàng đợi của bài học.");
                }
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
                detail.setItemId(decision.emailId());
                detail.setUserAction(markedQuarantine ? "REPORT" : "VERIFIED");
                detail.setResponseTime(avgDecisionTime);
                detail.setCorrect(isCorrect);
                sessionDetailRepository.save(detail);
            }
        }

        boolean otpMatch = true;
        if (isMailOtp) {
            if (gameplayDecisions.isEmpty()) {
                throw new RuntimeException("Thiếu gameplayDecisions (OTP) cho bài MAIL_OTP.");
            }
            Optional<GameplayDecision> otpDecision = gameplayDecisions.stream()
                    .filter(d -> "OTP_SUBMIT".equals(d.decisionType()))
                    .findFirst();
            if (otpDecision.isEmpty()) {
                throw new RuntimeException("Thiếu quyết định OTP_SUBMIT cho bài MAIL_OTP.");
            }
            String expectedOtp = extractOtpCodeFromStepContent(currentStep.getContent());
            String entered = otpDecision.get().payload() == null ? "" : otpDecision.get().payload().trim();
            otpMatch = !expectedOtp.isEmpty() && expectedOtp.equals(entered);
            if (!otpMatch) {
                falseNegative++;
                feedbackMessages.add("Mã OTP không khớp với mã đã gửi trong email. Đối chiếu từng ký tự.");
            }

            SessionDetail otpDetail = new SessionDetail();
            otpDetail.setSession(session);
            otpDetail.setStep(currentStep);
            otpDetail.setItemId(null);
            otpDetail.setUserAction("OTP_SUBMIT");
            otpDetail.setResponseTime(avgDecisionTime);
            otpDetail.setCorrect(otpMatch);
            sessionDetailRepository.save(otpDetail);
        }

        if (!mailLike) {
            if (gameplayDecisions.isEmpty()) {
                throw new RuntimeException("Thiếu gameplayDecisions cho bài " + stepType + ".");
            }
            boolean scenarioPhishing = resolvePhishingScenario(currentStep);
            for (GameplayDecision decision : gameplayDecisions) {
                String action = normalizeAction(decision.userAction());
                boolean markedQuarantine = ACTION_QUARANTINE.equals(action);
                boolean isCorrect = (scenarioPhishing && markedQuarantine) || (!scenarioPhishing && !markedQuarantine);

                if (!scenarioPhishing && markedQuarantine) {
                    falsePositive++;
                    feedbackMessages.add("False Positive: Tình huống này là hợp lệ nhưng bạn đã báo cáo.");
                } else if (scenarioPhishing && !markedQuarantine) {
                    falseNegative++;
                    feedbackMessages.add("False Negative: Bạn đã tin tưởng tình huống đáng ngờ — rất nguy hiểm.");
                }

                SessionDetail detail = new SessionDetail();
                detail.setSession(session);
                detail.setStep(currentStep);
                detail.setItemId(null);
                detail.setUserAction(markedQuarantine ? "REPORT" : "VERIFIED");
                detail.setResponseTime(avgDecisionTime);
                detail.setCorrect(isCorrect);
                sessionDetailRepository.save(detail);
            }
        }

        boolean passed = falseNegative == 0 && session.getScoreGained() >= 0 && otpMatch;
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
            if (isMailOtp) {
                feedbackMessages.add("Bạn đã xử lý đúng email và nhập đúng mã OTP từ hộp thư.");
            } else if (mailLike) {
                feedbackMessages.add("Xử lý chính xác. Tiếp tục duy trì thói quen soi người gửi và URL.");
            } else {
                feedbackMessages.add("Xử lý chính xác. Tiếp tục cảnh giác với yêu cầu bất thường trên mọi kênh.");
            }
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

