package com.example.cybershield.repository;

import com.example.cybershield.entity.TrainingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TrainingSessionRepository extends JpaRepository<TrainingSession, UUID> {
    long countByUserIdAndScenarioIdAndStatus(UUID userId, UUID scenarioId, String status);
}
