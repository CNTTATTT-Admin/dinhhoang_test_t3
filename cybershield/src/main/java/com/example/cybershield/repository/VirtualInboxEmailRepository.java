package com.example.cybershield.repository;

import com.example.cybershield.entity.VirtualInboxEmail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VirtualInboxEmailRepository extends JpaRepository<VirtualInboxEmail, Long> {

    List<VirtualInboxEmail> findByScenarioStep_IdOrderBySortOrderAsc(UUID scenarioStepId);

    long countByScenarioStep_Id(UUID scenarioStepId);
}
