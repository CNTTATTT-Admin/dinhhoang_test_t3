package com.example.cybershield.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "data_leaks")
@Data
public class DataLeak {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "session_id")
    private TrainingSession session;

    private String dataType; // PASSWORD, OTP, INFO
    private String leakedValue; // Giá trị đã bị che (Masked)
    private LocalDateTime leakedAt = LocalDateTime.now();
}
