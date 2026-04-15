package com.example.cybershield.repository;

import com.example.cybershield.entity.LandingPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LandingPageRepository extends JpaRepository<LandingPage, UUID> {

    Optional<LandingPage> findByStep_Id(UUID stepId);
}