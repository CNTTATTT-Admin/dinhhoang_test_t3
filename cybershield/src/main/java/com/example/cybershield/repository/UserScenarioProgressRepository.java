package com.example.cybershield.repository;

import com.example.cybershield.entity.UserScenarioProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserScenarioProgressRepository extends JpaRepository<UserScenarioProgress, UUID> {
    Optional<UserScenarioProgress> findByUserIdAndScenarioId(UUID userId, UUID scenarioId);
    List<UserScenarioProgress> findByUserId(UUID userId);
}

