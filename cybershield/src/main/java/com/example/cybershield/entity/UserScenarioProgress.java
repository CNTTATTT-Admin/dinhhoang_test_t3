package com.example.cybershield.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(
        name = "user_scenario_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "scenario_id"})
)
@Data
public class UserScenarioProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "scenario_id", nullable = false)
    private Scenario scenario;

    private int highestStepReached = 0;

    private boolean isScenarioCompleted = false;

    private int bestScore = 0;
}

