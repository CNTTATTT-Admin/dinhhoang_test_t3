package com.example.cybershield.service;

import com.example.cybershield.dto.request.ScenarioStepRequest;
import com.example.cybershield.dto.response.ScenarioStepResponse;
import com.example.cybershield.entity.ScenarioStep;
import com.example.cybershield.entity.Scenario;
import com.example.cybershield.repository.ScenarioRepository;
import com.example.cybershield.repository.ScenarioStepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScenarioStepService {

    private final ScenarioStepRepository stepRepository;
    private final ScenarioRepository scenarioRepository;

    public List<ScenarioStepResponse> getAll() {
        return stepRepository.findAll().stream()
                .map(ScenarioStepResponse::fromEntity)
                .toList();
    }

    public ScenarioStepResponse getById(UUID id) {
        ScenarioStep step = stepRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Scenario Step!"));
        return ScenarioStepResponse.fromEntity(step);
    }

    public ScenarioStepResponse create(ScenarioStepRequest request) {
        validateScenarioIdAndUniqueness(request, null);
        ScenarioStep step = new ScenarioStep();
        updateEntityFromRequest(step, request);
        return ScenarioStepResponse.fromEntity(stepRepository.save(step));
    }

    public ScenarioStepResponse update(UUID id, ScenarioStepRequest request) {
        ScenarioStep step = stepRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Scenario Step!"));

        validateScenarioIdAndUniqueness(request, id);
        updateEntityFromRequest(step, request);
        return ScenarioStepResponse.fromEntity(stepRepository.save(step));
    }

    public void delete(UUID id) {
        if (!stepRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Scenario Step để xóa!");
        }
        stepRepository.deleteById(id);
    }

    private void updateEntityFromRequest(ScenarioStep step, ScenarioStepRequest request) {
        if (request.scenarioId() == null) {
            throw new IllegalArgumentException("scenarioId không được để trống");
        }

        Scenario scenario = scenarioRepository.findById(request.scenarioId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Scenario!"));

        step.setScenario(scenario);
        step.setStepOrder(request.stepOrder());
        step.setStepType(request.stepType());
        step.setContent(request.content());
        step.setTriggerFailure(request.triggerFailure());
        step.setTriggerSuccess(request.triggerSuccess());
        step.setAiFeedback(request.aiFeedback());
    }

    private void validateScenarioIdAndUniqueness(ScenarioStepRequest request, UUID currentIdOrNull) {
        if (request.scenarioId() == null) {
            throw new IllegalArgumentException("scenarioId không được để trống");
        }
        if (request.stepOrder() == null) {
            throw new IllegalArgumentException("stepOrder không được để trống");
        }

        boolean exists;
        if (currentIdOrNull == null) {
            exists = stepRepository.existsByScenarioIdAndStepOrder(request.scenarioId(), request.stepOrder());
        } else {
            exists = stepRepository.existsByScenarioIdAndStepOrderAndIdNot(
                    request.scenarioId(),
                    request.stepOrder(),
                    currentIdOrNull
            );
        }

        if (exists) {
            throw new IllegalArgumentException("stepOrder đã tồn tại trong cùng Scenario");
        }
    }
}