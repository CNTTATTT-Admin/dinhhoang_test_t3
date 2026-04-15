package com.example.cybershield.service;

import com.example.cybershield.dto.request.BadgeRequest;
import com.example.cybershield.dto.response.BadgeResponse;
import com.example.cybershield.entity.Badge;
import com.example.cybershield.repository.BadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;

    public List<BadgeResponse> getAll() {
        return badgeRepository.findAll().stream()
                .map(BadgeResponse::fromEntity)
                .toList();
    }

    public BadgeResponse getById(Integer id) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Badge!"));
        return BadgeResponse.fromEntity(badge);
    }

    public BadgeResponse create(BadgeRequest request) {
        Badge badge = new Badge();
        badge.setId(request.id());
        updateEntityFromRequest(badge, request);
        return BadgeResponse.fromEntity(badgeRepository.save(badge));
    }

    public BadgeResponse update(Integer id, BadgeRequest request) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Badge!"));

        updateEntityFromRequest(badge, request);
        return BadgeResponse.fromEntity(badgeRepository.save(badge));
    }

    public void delete(Integer id) {
        if (!badgeRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Badge để xóa!");
        }
        badgeRepository.deleteById(id);
    }

    private void updateEntityFromRequest(Badge badge, BadgeRequest request) {
        badge.setName(request.name());
        badge.setIconUrl(request.iconUrl());
        badge.setRequiredExp(request.requiredExp());
    }
}
