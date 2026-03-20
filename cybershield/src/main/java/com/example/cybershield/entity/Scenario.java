package com.example.cybershield.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "scenarios")
@Data
public class Scenario {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;
    private String category; // Phishing, Smishing, SocialEng
    private String difficulty; // Easy, Medium, Hard

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "scenario", cascade = CascadeType.ALL)
    @OrderBy("stepOrder ASC")
    private List<ScenarioStep> steps;
}
