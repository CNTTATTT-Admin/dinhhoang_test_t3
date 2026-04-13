package com.example.cybershield.repository;

import com.example.cybershield.entity.SessionDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SessionDetailRepository extends JpaRepository<SessionDetail, UUID> {
    List<SessionDetail> findBySessionUserIdAndStepScenarioId(UUID userId, UUID scenarioId);
    List<SessionDetail> findBySessionUserId(UUID userId);
}
