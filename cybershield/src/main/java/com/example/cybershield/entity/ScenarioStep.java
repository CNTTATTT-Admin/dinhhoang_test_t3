package com.example.cybershield.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(name = "scenario_steps")
@Data
public class ScenarioStep {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "scenario_id")
    private Scenario scenario;

    private int stepOrder;
    private String stepType; // MAIL, ZALO, WEB_PAGE, OTP

    @Column(columnDefinition = "TEXT")
    private String content; // JSON string chứa HTML/Tin nhắn

    private String triggerFailure; // CLICK_LINK, INPUT
    private String triggerSuccess; // REPORT, DELETE

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    @OneToOne(mappedBy = "step", cascade = CascadeType.ALL)
    private LandingPage landingPage;
}
