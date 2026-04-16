package com.example.cybershield.service;

import com.example.cybershield.dto.request.AdminVirtualInboxEmailRequest;
import com.example.cybershield.dto.response.VirtualInboxEmailResponse;
import com.example.cybershield.entity.ScenarioStep;
import com.example.cybershield.entity.VirtualInboxEmail;
import com.example.cybershield.repository.ScenarioStepRepository;
import com.example.cybershield.repository.VirtualInboxEmailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminVirtualInboxEmailService {

    private final VirtualInboxEmailRepository virtualInboxEmailRepository;
    private final ScenarioStepRepository scenarioStepRepository;

    public List<VirtualInboxEmailResponse> getByScenarioStepId(UUID stepId) {
        return virtualInboxEmailRepository.findByScenarioStep_IdOrderBySortOrderAsc(stepId)
                .stream()
                .map(VirtualInboxEmailResponse::fromEntity)
                .toList();
    }

    public VirtualInboxEmailResponse getById(Long id) {
        VirtualInboxEmail email = virtualInboxEmailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy VirtualInboxEmail!"));
        return VirtualInboxEmailResponse.fromEntity(email);
    }

    public VirtualInboxEmailResponse create(UUID stepId, AdminVirtualInboxEmailRequest request) {
        ScenarioStep step = scenarioStepRepository.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ScenarioStep!"));

        int sortOrder = request.sortOrder() != null
                ? request.sortOrder()
                : (int) virtualInboxEmailRepository.countByScenarioStep_Id(stepId) + 1;

        VirtualInboxEmail email = new VirtualInboxEmail();
        email.setScenarioStep(step);
        email.setSortOrder(sortOrder);
        email.setSlotTag(request.slotTag());
        email.setEmailType(request.emailType());
        email.setSenderEmail(request.senderEmail());
        email.setSenderName(request.senderName());
        email.setSubject(request.subject());
        email.setBody(request.body());
        email.setLinkUrl(request.linkUrl());
        email.setLinkLabel(request.linkLabel());
        email.setPhishing(Boolean.TRUE.equals(request.isPhishing()));
        email.setRedFlags(request.redFlags() != null ? request.redFlags() : Collections.emptyList());
        email.setAttachmentJson(request.attachmentJson());

        virtualInboxEmailRepository.save(email);
        return VirtualInboxEmailResponse.fromEntity(email);
    }

    public VirtualInboxEmailResponse update(Long id, AdminVirtualInboxEmailRequest request) {
        VirtualInboxEmail email = virtualInboxEmailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy VirtualInboxEmail!"));

        if (request.sortOrder() != null) {
            email.setSortOrder(request.sortOrder());
        }

        // Không cho thay đổi ScenarioStep qua request (để tránh phá luồng/phan quy),
        // vì stepId được dùng để list theo ngữ cảnh.
        email.setSlotTag(request.slotTag());
        email.setEmailType(request.emailType());
        email.setSenderEmail(request.senderEmail());
        email.setSenderName(request.senderName());
        email.setSubject(request.subject());
        email.setBody(request.body());
        email.setLinkUrl(request.linkUrl());
        email.setLinkLabel(request.linkLabel());
        email.setPhishing(Boolean.TRUE.equals(request.isPhishing()));
        email.setRedFlags(request.redFlags() != null ? request.redFlags() : Collections.emptyList());
        email.setAttachmentJson(request.attachmentJson());

        virtualInboxEmailRepository.save(email);
        return VirtualInboxEmailResponse.fromEntity(email);
    }

    public void delete(Long id) {
        if (!virtualInboxEmailRepository.existsById(id)) {
            throw new RuntimeException("VirtualInboxEmail không tồn tại!");
        }
        virtualInboxEmailRepository.deleteById(id);
    }
}

