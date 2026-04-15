package com.example.cybershield.repository;

import com.example.cybershield.entity.DataLeak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DataLeakRepository extends JpaRepository<DataLeak, UUID> {
    long countByUserId(UUID userId);
    long countDistinctSessionIdByUserId(UUID userId);
    long countByUserIdAndSessionTutorialModeFalse(UUID userId);
    long countDistinctSessionIdByUserIdAndSessionTutorialModeFalse(UUID userId);
}
