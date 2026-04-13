package com.example.cybershield.service;

import com.example.cybershield.dto.request.ScenarioRequest;
import com.example.cybershield.dto.response.ScenarioResponse;
import com.example.cybershield.entity.Scenario;
import com.example.cybershield.entity.User;
import com.example.cybershield.entity.UserScenarioProgress;
import com.example.cybershield.repository.ScenarioRepository;
import com.example.cybershield.repository.UserRepository;
import com.example.cybershield.repository.UserScenarioProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScenarioService {

    private final ScenarioRepository scenarioRepository;
    private final UserRepository userRepository;
    private final UserScenarioProgressRepository progressRepository;

    public List<ScenarioResponse> getAll(Authentication authentication) {
        List<Scenario> orderedScenarios = scenarioRepository.findAll().stream()
                .sorted(Comparator.comparing(Scenario::getTitle, String.CASE_INSENSITIVE_ORDER))
                .toList();

        User user = resolveAuthenticatedUser(authentication);
        Set<UUID> completedScenarioIds = new HashSet<>();
        if (user != null) {
            List<UserScenarioProgress> progresses = progressRepository.findByUserId(user.getId());
            for (UserScenarioProgress p : progresses) {
                if (p.isScenarioCompleted() && p.getScenario() != null && p.getScenario().getId() != null) {
                    completedScenarioIds.add(p.getScenario().getId());
                }
            }
        }

        return mapWithLockState(orderedScenarios, completedScenarioIds);
    }

    public ScenarioResponse getById(UUID id) {
        Scenario scenario = scenarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Scenario!"));
        return ScenarioResponse.fromEntity(scenario);
    }

    public ScenarioResponse create(ScenarioRequest request) {
        Scenario scenario = new Scenario();
        updateEntityFromRequest(scenario, request);
        return ScenarioResponse.fromEntity(scenarioRepository.save(scenario));
    }

    public ScenarioResponse update(UUID id, ScenarioRequest request) {
        Scenario scenario = scenarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Scenario!"));

        updateEntityFromRequest(scenario, request);
        return ScenarioResponse.fromEntity(scenarioRepository.save(scenario));
    }

    public void delete(UUID id) {
        if (!scenarioRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Scenario để xóa!");
        }
        scenarioRepository.deleteById(id);
    }

    private void updateEntityFromRequest(Scenario scenario, ScenarioRequest request) {
        scenario.setTitle(request.title());
        scenario.setCategory(request.category());
        scenario.setDifficulty(request.difficulty());
        scenario.setThumbnailUrl(request.thumbnailUrl());
        scenario.setDescription(request.description());
        scenario.setRewardExp(request.rewardExp() == null ? 300 : Math.max(0, request.rewardExp()));
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

    private List<ScenarioResponse> mapWithLockState(
            List<Scenario> orderedScenarios,
            Set<UUID> completedScenarioIds
    ) {
        boolean previousCompleted = false;
        List<ScenarioResponse> responses = new java.util.ArrayList<>();
        for (int i = 0; i < orderedScenarios.size(); i++) {
            Scenario scenario = orderedScenarios.get(i);
            boolean unlocked = i == 0 || previousCompleted;
            boolean isCompleted = completedScenarioIds.contains(scenario.getId());
            responses.add(ScenarioResponse.fromEntity(scenario, !unlocked, isCompleted));
            previousCompleted = isCompleted;
        }
        return responses;
    }
}
