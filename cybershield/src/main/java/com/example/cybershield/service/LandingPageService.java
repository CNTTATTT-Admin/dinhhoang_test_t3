package com.example.cybershield.service;

import com.example.cybershield.dto.request.LandingPageRequest;
import com.example.cybershield.dto.response.LandingPageResponse;
import com.example.cybershield.entity.LandingPage;
import com.example.cybershield.repository.LandingPageRepository;
// Import ScenarioStepRepository của bạn vào đây (nếu đã tạo)
// import com.example.cybershield.repository.ScenarioStepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LandingPageService {

    private final LandingPageRepository landingPageRepository;
    // Bỏ comment dòng dưới khi bạn đã có ScenarioStepRepository
    // private final ScenarioStepRepository stepRepository;

    public List<LandingPageResponse> getAll() {
        return landingPageRepository.findAll().stream()
                .map(LandingPageResponse::fromEntity)
                .toList();
    }

    public LandingPageResponse getById(UUID id) {
        LandingPage landingPage = landingPageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Landing Page!"));
        return LandingPageResponse.fromEntity(landingPage);
    }

    public LandingPageResponse create(LandingPageRequest request) {
        LandingPage landingPage = new LandingPage();
        updateEntityFromRequest(landingPage, request);
        return LandingPageResponse.fromEntity(landingPageRepository.save(landingPage));
    }

    public LandingPageResponse update(UUID id, LandingPageRequest request) {
        LandingPage landingPage = landingPageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Landing Page!"));

        updateEntityFromRequest(landingPage, request);
        return LandingPageResponse.fromEntity(landingPageRepository.save(landingPage));
    }

    public void delete(UUID id) {
        if (!landingPageRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Landing Page để xóa!");
        }
        landingPageRepository.deleteById(id);
    }

    private void updateEntityFromRequest(LandingPage landingPage, LandingPageRequest request) {
        landingPage.setTemplateName(request.templateName());
        landingPage.setFakeUrl(request.fakeUrl());
        landingPage.setRequiredFields(request.requiredFields());

        // TODO: Tìm và set ScenarioStep từ request.stepId()
        // if (request.stepId() != null) {
        //     ScenarioStep step = stepRepository.findById(request.stepId())
        //             .orElseThrow(() -> new RuntimeException("Không tìm thấy Step!"));
        //     landingPage.setStep(step);
        // }
    }
}