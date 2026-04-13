package com.example.cybershield.service;

import com.example.cybershield.dto.request.TrainingSessionRequest;
import com.example.cybershield.dto.response.TrainingSessionResponse;
import com.example.cybershield.entity.Scenario;
import com.example.cybershield.entity.TrainingSession;
import com.example.cybershield.entity.User;
import com.example.cybershield.entity.UserScenarioProgress;
import com.example.cybershield.repository.ScenarioRepository;
import com.example.cybershield.repository.ScenarioStepRepository;
import com.example.cybershield.repository.TrainingSessionRepository;
import com.example.cybershield.repository.UserRepository;
import com.example.cybershield.repository.UserScenarioProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrainingSessionService {

    private final TrainingSessionRepository trainingSessionRepository;
    private final UserRepository userRepository;
    private final ScenarioRepository scenarioRepository;
    private final ScenarioStepRepository scenarioStepRepository;
    private final UserScenarioProgressRepository progressRepository;

    public List<TrainingSessionResponse> getAll() {
        return trainingSessionRepository.findAll().stream()
                .map(TrainingSessionResponse::fromEntity)
                .toList();
    }

    public TrainingSessionResponse getById(UUID id) {
        TrainingSession trainingSession = trainingSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Training Session!"));
        return TrainingSessionResponse.fromEntity(trainingSession);
    }

    @Transactional
    public TrainingSessionResponse create(TrainingSessionRequest request) {
        TrainingSession trainingSession = new TrainingSession();
        updateEntityFromRequest(trainingSession, request);
        TrainingSession saved = trainingSessionRepository.save(trainingSession);
        return applyProgressAndReward(saved);
    }

    @Transactional
    public TrainingSessionResponse update(UUID id, TrainingSessionRequest request) {
        TrainingSession trainingSession = trainingSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Training Session!"));

        updateEntityFromRequest(trainingSession, request);
        TrainingSession saved = trainingSessionRepository.save(trainingSession);
        return applyProgressAndReward(saved);
    }

    public void delete(UUID id) {
        if (!trainingSessionRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Training Session để xóa!");
        }
        trainingSessionRepository.deleteById(id);
    }

    private void updateEntityFromRequest(TrainingSession trainingSession, TrainingSessionRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        Scenario scenario = scenarioRepository.findById(request.scenarioId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Scenario!"));

        trainingSession.setUser(user);
        trainingSession.setScenario(scenario);
        trainingSession.setEndedAt(request.endedAt());
        trainingSession.setScoreGained(request.scoreGained());
        trainingSession.setStatus(request.status());
    }

    @Transactional
    public TrainingSessionResponse saveAndProcessProgress(TrainingSession session) {
        TrainingSession saved = trainingSessionRepository.save(session);
        return applyProgressAndReward(saved);
    }

    @Transactional
    protected TrainingSessionResponse applyProgressAndReward(TrainingSession session) {
        User user = session.getUser();
        Scenario scenario = session.getScenario();
        if (user == null || scenario == null) {
            return TrainingSessionResponse.fromEntity(session);
        }

        int earnedExp = 0;
        int previousLevel = user.getLevel();
        int scenarioStepCount = scenarioStepRepository.countByScenarioId(scenario.getId());
        int newHighestStep = "COMPLETED".equalsIgnoreCase(session.getStatus()) ? scenarioStepCount : 0;

        UserScenarioProgress progress = progressRepository
                .findByUserIdAndScenarioId(user.getId(), scenario.getId())
                .orElseGet(() -> {
                    UserScenarioProgress p = new UserScenarioProgress();
                    p.setUser(user);
                    p.setScenario(scenario);
                    return p;
                });

        boolean wasCompletedBefore = progress.isScenarioCompleted();
        progress.setHighestStepReached(Math.max(progress.getHighestStepReached(), newHighestStep));
        progress.setBestScore(Math.max(progress.getBestScore(), session.getScoreGained()));

        if ("COMPLETED".equalsIgnoreCase(session.getStatus())) {
            progress.setScenarioCompleted(true);
            long completedCount = trainingSessionRepository.countByUserIdAndScenarioIdAndStatus(
                    user.getId(),
                    scenario.getId(),
                    "COMPLETED"
            );

            // Anti-farming: chỉ cộng EXP khi hoàn thành lần đầu của scenario.
            if (completedCount == 1 && !wasCompletedBefore) {
                int scenarioRewardExp = scenario.getRewardExp() == null ? 300 : scenario.getRewardExp();
                earnedExp = Math.max(0, scenarioRewardExp);
                user.setTotalExp(user.getTotalExp() + earnedExp);
                user.setLevel(calculateLevelFromExp(user.getTotalExp()));
                userRepository.save(user);
            }
        }

        progressRepository.save(progress);
        int newTotalExp = user.getTotalExp();
        boolean rankChanged = user.getLevel() > previousLevel;
        return TrainingSessionResponse.fromEntity(session, earnedExp, newTotalExp, rankChanged);
    }

    private int calculateLevelFromExp(int totalExp) {
        int normalizedExp = Math.max(0, totalExp);
        return Math.min(100, (normalizedExp / 750) + 1);
    }
}
