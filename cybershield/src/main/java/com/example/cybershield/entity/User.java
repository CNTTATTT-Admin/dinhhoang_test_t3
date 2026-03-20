package com.example.cybershield.entity;

import jakarta.persistence.*;
import lombok.Data;

import javax.management.relation.Role;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String username;
    private String avatarUrl;
    private String bio;

    // Chỉ số Gamification
    private int totalExp = 0;
    private int level = 1;

    // Chỉ số Risk Profile (Phục vụ Dashboard)
    private int trapClicks = 0;     // Số lần bấm link bẫy
    private int correctReports = 0; // Số lần báo cáo đúng
    private double avgResponseTime; // Thời gian phản ứng trung bình
}
