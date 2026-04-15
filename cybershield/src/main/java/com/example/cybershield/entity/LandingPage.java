package com.example.cybershield.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(name = "landing_pages")
@Data
public class LandingPage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "step_id")
    private ScenarioStep step;

    private String templateName; // Microsoft_Login, VCB_Login
    private String fakeUrl;      // URL hiện trên thanh địa chỉ giả

    @Column(columnDefinition = "TEXT")
    private String requiredFields; // JSON: ["username", "password", "otp"]
}
