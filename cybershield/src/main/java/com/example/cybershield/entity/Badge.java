package com.example.cybershield.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "badges")
@Data
public class Badge {
    @Id
    private int id;
    private String name;
    private String iconUrl;
    private int requiredExp;
}
