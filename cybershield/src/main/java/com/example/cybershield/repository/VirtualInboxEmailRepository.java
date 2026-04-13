package com.example.cybershield.repository;

import com.example.cybershield.entity.VirtualInboxEmail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VirtualInboxEmailRepository extends JpaRepository<VirtualInboxEmail, Long> {
}
