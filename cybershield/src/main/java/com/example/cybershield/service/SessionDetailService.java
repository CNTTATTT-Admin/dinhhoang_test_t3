package com.example.cybershield.service;

import com.example.cybershield.dto.request.SessionDetailRequest;
import com.example.cybershield.dto.response.SessionDetailResponse;
import com.example.cybershield.entity.SessionDetail;
import com.example.cybershield.entity.ScenarioStep;
import com.example.cybershield.entity.TrainingSession;
import com.example.cybershield.repository.ScenarioStepRepository;
import com.example.cybershield.repository.SessionDetailRepository;
import com.example.cybershield.repository.TrainingSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionDetailService {

    private final SessionDetailRepository sessionDetailRepository;
    private final TrainingSessionRepository trainingSessionRepository;
    private final ScenarioStepRepository scenarioStepRepository;

    public List<SessionDetailResponse> getAll() {
        return sessionDetailRepository.findAll().stream()
                .map(SessionDetailResponse::fromEntity)
                .toList();
    }

    public SessionDetailResponse getById(UUID id) {
        SessionDetail sessionDetail = sessionDetailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Session Detail!"));
        return SessionDetailResponse.fromEntity(sessionDetail);
    }

    public SessionDetailResponse create(SessionDetailRequest request) {
        SessionDetail sessionDetail = new SessionDetail();
        updateEntityFromRequest(sessionDetail, request);
        return SessionDetailResponse.fromEntity(sessionDetailRepository.save(sessionDetail));
    }

    public SessionDetailResponse update(UUID id, SessionDetailRequest request) {
        SessionDetail sessionDetail = sessionDetailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Session Detail!"));

        updateEntityFromRequest(sessionDetail, request);
        return SessionDetailResponse.fromEntity(sessionDetailRepository.save(sessionDetail));
    }

    public void delete(UUID id) {
        if (!sessionDetailRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Session Detail để xóa!");
        }
        sessionDetailRepository.deleteById(id);
    }

    private void updateEntityFromRequest(SessionDetail sessionDetail, SessionDetailRequest request) {
        TrainingSession session = trainingSessionRepository.findById(request.sessionId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Training Session!"));
        ScenarioStep step = scenarioStepRepository.findById(request.stepId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Scenario Step!"));

        sessionDetail.setSession(session);
        sessionDetail.setStep(step);
        sessionDetail.setUserAction(request.userAction());
        sessionDetail.setResponseTime(request.responseTime());
        sessionDetail.setCorrect(request.isCorrect());
    }
}
