package com.example.cybershield.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "training_sessions")
@Data
public class TrainingSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "scenario_id")
    private Scenario scenario;

    private LocalDateTime startedAt = LocalDateTime.now();
    private LocalDateTime endedAt;

    private int scoreGained;
    private String status; // COMPLETED, FAILED, LEAKED
    private boolean tutorialMode;
}

