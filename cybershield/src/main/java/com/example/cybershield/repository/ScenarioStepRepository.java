package com.example.cybershield.repository;

import com.example.cybershield.entity.ScenarioStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScenarioStepRepository extends JpaRepository<ScenarioStep, UUID> {
    List<ScenarioStep> findByScenarioIdOrderByStepOrderAsc(UUID scenarioId);
    int countByScenarioId(UUID scenarioId);
}