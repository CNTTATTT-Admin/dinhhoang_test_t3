package com.example.cybershield.service;

import com.example.cybershield.dto.request.ScenarioStepRequest;
import com.example.cybershield.dto.response.ScenarioStepResponse;
import com.example.cybershield.entity.ScenarioStep;
import com.example.cybershield.repository.ScenarioStepRepository;
// import com.example.cybershield.repository.ScenarioRepository; // Bỏ comment khi có Scenario
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScenarioStepService {

    private final ScenarioStepRepository stepRepository;
    // private final ScenarioRepository scenarioRepository; // Bỏ comment khi có

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
        ScenarioStep step = new ScenarioStep();
        updateEntityFromRequest(step, request);
        return ScenarioStepResponse.fromEntity(stepRepository.save(step));
    }

    public ScenarioStepResponse update(UUID id, ScenarioStepRequest request) {
        ScenarioStep step = stepRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Scenario Step!"));

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
        step.setStepOrder(request.stepOrder());
        step.setStepType(request.stepType());
        step.setContent(request.content());
        step.setTriggerFailure(request.triggerFailure());
        step.setTriggerSuccess(request.triggerSuccess());
        step.setAiFeedback(request.aiFeedback());

        // TODO: Tìm và set Scenario từ request.scenarioId()
        // if (request.scenarioId() != null) {
        //     Scenario scenario = scenarioRepository.findById(request.scenarioId())
        //             .orElseThrow(() -> new RuntimeException("Không tìm thấy Scenario!"));
        //     step.setScenario(scenario);
        // }
    }
}