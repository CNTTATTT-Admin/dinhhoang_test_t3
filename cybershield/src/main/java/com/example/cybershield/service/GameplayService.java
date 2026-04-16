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
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GameplayService {

    private static final String ACTION_VERIFIED = "VERIFIED";
    private static final String ACTION_QUARANTINE = "QUARANTINE";
    private static final int SCORE_CORRECT = 120;
    private static final int SCORE_PENALTY = 120;

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
        if ("WEB_PAGE".equals(stepType) || "MAIL_WEB".equals(stepType)) {
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

    /** Không gửi otpCode xuống client (legacy seed); MAIL_OTP không còn mã cố định trong DB. */
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
        if ("WEB_PAGE".equals(type) || "MAIL_WEB".equals(type) || "OTP".equals(type) || "ZALO".equals(type)) {
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
        String stepType = step.getStepType() == null ? "" : step.getStepType().toUpperCase(Locale.ROOT);
        List<VirtualInboxEmail> entities = virtualInboxEmailRepository.findByScenarioStep_IdOrderBySortOrderAsc(stepId);
        if ("MIXED_INBOX".equals(stepType)) {
            List<VirtualInboxEmail> shuffled = new ArrayList<>(entities);
            Collections.shuffle(shuffled, ThreadLocalRandom.current());
            List<VirtualInboxEmailResponse> out = new ArrayList<>(shuffled.size());
            int ord = 1;
            for (VirtualInboxEmail e : shuffled) {
                out.add(VirtualInboxEmailResponse.fromEntity(e, ord++));
            }
            return out;
        }
        List<VirtualInboxEmailResponse> list = entities.stream()
                .map(VirtualInboxEmailResponse::fromEntity)
                .toList();
        if (!"MAIL_OTP".equals(stepType)) {
            return list;
        }
        // Ma OTP do frontend sinh / hien thi tren PhoneOtpWidget — khong chen ma co dinh tu DB.
        return list;
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
        session.setScoreGained(0);
        session.setStatus("IN_PROGRESS");
        // tutorialMode=0 (hoặc null) = campaign học tập → không tính EXP/stats
        // tutorialMode=1 = chế độ chơi thật (Solo/competitive) → tính EXP/stats
        Integer tm = scenario.getTutorialMode();
        boolean isTutorialCampaign = (tm == null || tm == 0);
        session.setTutorialMode(isTutorialCampaign);
        trainingSessionRepository.save(session);

        List<EmailDecision> emailDecisions = request.emailDecisions() == null ? List.of() : request.emailDecisions();
        List<GameplayDecision> gameplayDecisions = request.gameplayDecisions() == null ? List.of() : request.gameplayDecisions();
        int falsePositive = 0;
        int falseNegative = 0;
        int serverAdjustedScore = 0;
        List<String> feedbackMessages = new ArrayList<>();

        List<ScenarioStep> scenarioSteps = scenarioStepRepository
                .findByScenarioIdOrderByStepOrderAsc(scenario.getId());
        String stepType = currentStep.getStepType() == null ? "MAIL" : currentStep.getStepType().toUpperCase(Locale.ROOT);
        boolean isMailOtp = "MAIL_OTP".equals(stepType);
        boolean isMailOnly = "MAIL".equals(stepType) || "MAIL_STANDARD".equals(stepType) || "MAIL_FILE".equals(stepType);
        boolean mailLike = isMailOnly || isMailOtp;
        boolean useEmailDecisions = !emailDecisions.isEmpty();

        int decisionCount;
        if (isMailOtp) {
            decisionCount = emailDecisions.size() + 1;
        } else if (useEmailDecisions) {
            decisionCount = emailDecisions.size();
        } else {
            decisionCount = gameplayDecisions.size();
        }
        float avgDecisionTime = decisionCount == 0
                ? 0f
                : Math.max(0f, request.timeTakenSeconds()) / decisionCount;

        if (useEmailDecisions) {
            Set<Long> validEmailIds = virtualInboxEmailRepository.findByScenarioStep_IdOrderBySortOrderAsc(stepId)
                    .stream()
                    .map(VirtualInboxEmail::getId)
                    .collect(Collectors.toSet());
            boolean enforceInboxIds = !validEmailIds.isEmpty();

            for (EmailDecision decision : emailDecisions) {
                if (enforceInboxIds && !validEmailIds.contains(decision.getEmailId())) {
                    throw new RuntimeException("emailId không khớp với hàng đợi của bài học.");
                }
                VirtualInboxEmail sourceEmail = virtualInboxEmailRepository.findById(decision.getEmailId())
                        .orElse(null);
                if (sourceEmail == null) {
                    throw new RuntimeException("Không tìm thấy email trong hàng đợi để chấm điểm.");
                }
                String action = normalizeAction(decision.getUserAction());
                // Luôn dùng ground truth từ DB; không tin cờ isPhishing do client gửi lên.
                boolean actualPhishing = sourceEmail.isPhishing();
                String emailType = normalizeEmailType(sourceEmail.getEmailType(), stepType);
                boolean markedQuarantine = ACTION_QUARANTINE.equals(action);
                boolean isCorrect = markedQuarantine == actualPhishing;
                boolean enteredProvided = decision.getPayload() != null
                        && !decision.getPayload().isBlank()
                        && decision.getExpectedPayload() != null
                        && !decision.getExpectedPayload().isBlank();
                boolean isVerifiedLegit = ACTION_VERIFIED.equals(action) && !actualPhishing;
                boolean credentialsMatch = enteredProvided
                        && decision.getExpectedPayload().trim().equals(decision.getPayload().trim());
                boolean isMailWebDecision = "MAIL_WEB".equals(emailType);

                if (isMailWebDecision && isVerifiedLegit) {
                    // Flow 3: với mail hợp lệ, chỉ tính đúng khi user/pass nhập vào khớp dữ liệu chuẩn.
                    isCorrect = credentialsMatch;
                }
                serverAdjustedScore += isCorrect ? SCORE_CORRECT : -SCORE_PENALTY;

                if (!actualPhishing && markedQuarantine) {
                    falsePositive++;
                    feedbackMessages.add(buildFeedback(decision.getEmailId(),
                            "False Positive: Bạn đã chặn một email an toàn từ hệ thống."));
                } else if (actualPhishing && !markedQuarantine) {
                    falseNegative++;
                    if (enteredProvided) {
                        feedbackMessages.add(buildFeedback(decision.getEmailId(),
                                "Bạn đã để lộ thông tin tài khoản trên trang web giả mạo."));
                    } else {
                        feedbackMessages.add(buildFeedback(decision.getEmailId(),
                                "False Negative: Bạn đã tin tưởng mail phishing. Đây là lỗi nguy hiểm."));
                    }
                }

                if (isMailWebDecision
                        && isVerifiedLegit
                        && !credentialsMatch) {
                    falsePositive++;
                    feedbackMessages.add(buildFeedback(decision.getEmailId(),
                            "[SAI] Tài khoản hoặc mật khẩu không chính xác. Bạn đã nhập thông tin sai lệch."));
                } else if (isMailWebDecision
                        && isVerifiedLegit
                        && credentialsMatch) {
                    feedbackMessages.add(buildFeedback(decision.getEmailId(),
                            "[CHÍNH XÁC] Đăng nhập thành công hệ thống nội bộ."));
                }

                SessionDetail detail = new SessionDetail();
                detail.setSession(session);
                detail.setStep(currentStep);
                detail.setItemId(decision.getEmailId());
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
                    .filter(d -> "OTP_SUBMIT".equals(d.getDecisionType()))
                    .findFirst();
            if (otpDecision.isEmpty()) {
                throw new RuntimeException("Thiếu quyết định OTP_SUBMIT cho bài MAIL_OTP.");
            }
            GameplayDecision gd = otpDecision.get();
            String entered = gd.getPayload() == null ? "" : gd.getPayload().trim();
            String expectedOtp = gd.getExpectedPayload() == null ? "" : gd.getExpectedPayload().trim();
            if (expectedOtp.isEmpty()) {
                for (int i = emailDecisions.size() - 1; i >= 0; i--) {
                    EmailDecision ed = emailDecisions.get(i);
                    if (ed.getPayload() != null && ed.getExpectedPayload() != null) {
                        entered = ed.getPayload().trim();
                        expectedOtp = ed.getExpectedPayload().trim();
                        break;
                    }
                }
            }
            otpMatch = !expectedOtp.isEmpty() && expectedOtp.equals(entered);
            if (!otpMatch) {
                falseNegative++;
                feedbackMessages.add(
                        "Mã OTP không chính xác. Bạn cần kiểm tra thiết bị nhận tin nhắn cẩn thận hơn."
                );
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

        if (!useEmailDecisions) {
            if (gameplayDecisions.isEmpty()) {
                throw new RuntimeException("Thiếu gameplayDecisions cho bài " + stepType + ".");
            }
            boolean scenarioPhishing = resolvePhishingScenario(currentStep);
            for (GameplayDecision decision : gameplayDecisions) {
                String action = normalizeAction(decision.getUserAction());
                boolean markedQuarantine = ACTION_QUARANTINE.equals(action);
                boolean isCorrect = (scenarioPhishing && markedQuarantine) || (!scenarioPhishing && !markedQuarantine);
                serverAdjustedScore += isCorrect ? SCORE_CORRECT : -SCORE_PENALTY;

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

        session.setScoreGained(serverAdjustedScore);
        // Chỉ pass khi không có cả falseNegative lẫn falsePositive.
        boolean passed = falseNegative == 0 && falsePositive == 0 && session.getScoreGained() >= 0 && otpMatch;
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
        // Chỉ ghi nhận tiến độ khi thắng; thất bại không được tự động coi như đã hoàn thành step hiện tại.
        int reached = passed ? currentStep.getStepOrder() : previousHighestStep;
        progress.setHighestStepReached(Math.max(progress.getHighestStepReached(), reached));
        progress.setBestScore(Math.max(progress.getBestScore(), session.getScoreGained()));

        if (passed && currentStep.getStepOrder() >= scenarioStepCount) {
            progress.setScenarioCompleted(true);
        }

        // Tutorial mode: không tính EXP và không cập nhật thống kê user.
        boolean isTutorial = session.isTutorialMode();
        int expDelta = isTutorial ? 0 : serverAdjustedScore;
        if (!isTutorial) {
            // EXP = điểm phiên (server); mỗi lần submit đều cộng/trừ, không chặn replay. Bỏ qua finalScore client nếu lệch server.
            int newTotalExp = Math.max(0, user.getTotalExp() + expDelta);
            user.setTotalExp(newTotalExp);
            user.setLevel(calculateLevelFromExp(newTotalExp));

            // Cập nhật thống kê tích lũy của user
            int sessionDecisionCount = (useEmailDecisions ? emailDecisions.size() : gameplayDecisions.size())
                    + (isMailOtp ? 1 : 0);
            int correctInSession = sessionDecisionCount - falsePositive - falseNegative;
            int prevTotalDecisions = user.getCorrectReports() + user.getTrapClicks();
            user.setCorrectReports(Math.max(0, user.getCorrectReports() + correctInSession));
            user.setTrapClicks(Math.max(0, user.getTrapClicks() + falsePositive + falseNegative));
            if (avgDecisionTime > 0) {
                float prevAvg = user.getAvgResponseTime();
                int totalCount = prevTotalDecisions + sessionDecisionCount;
                float newAvg = totalCount > 0
                        ? (prevAvg * prevTotalDecisions + avgDecisionTime * sessionDecisionCount) / totalCount
                        : avgDecisionTime;
                user.setAvgResponseTime(newAvg);
            }
            userRepository.save(user);
        }

        int earnedExp = expDelta;

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
                session.getScoreGained(),
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

    private String normalizeEmailType(String emailType, String fallbackStepType) {
        String normalized = emailType == null ? "" : emailType.trim().toUpperCase(Locale.ROOT);
        if (!normalized.isBlank()) {
            if ("MAIL".equals(normalized)) return "MAIL_STANDARD";
            if ("WEB_PAGE".equals(normalized)) return "MAIL_WEB";
            if ("OTP".equals(normalized)) return "MAIL_OTP";
            if ("ZALO".equals(normalized)) return "MAIL_ZALO";
            return normalized;
        }
        String fallback = fallbackStepType == null ? "MAIL_STANDARD" : fallbackStepType.trim().toUpperCase(Locale.ROOT);
        if ("MAIL".equals(fallback)) return "MAIL_STANDARD";
        if ("WEB_PAGE".equals(fallback)) return "MAIL_WEB";
        if ("OTP".equals(fallback)) return "MAIL_OTP";
        if ("ZALO".equals(fallback)) return "MAIL_ZALO";
        if ("MIXED_INBOX".equals(fallback)) return "MAIL_STANDARD";
        return fallback;
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

