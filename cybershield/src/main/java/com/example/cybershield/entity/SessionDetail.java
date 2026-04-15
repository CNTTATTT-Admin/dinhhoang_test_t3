package com.example.cybershield.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(name = "session_details")
@Data
public class SessionDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "session_id")
    private TrainingSession session;

    @ManyToOne
    @JoinColumn(name = "step_id")
    private ScenarioStep step;

    private String userAction; // REPORT, CLICK_LINK, INPUT
    private float responseTime;
    private boolean isCorrect;

    /** Khóa tới VirtualInboxEmail.id khi quyết định thuộc inbox (nullable cho mode khác). */
    @Column(name = "item_id")
    private Long itemId;
}