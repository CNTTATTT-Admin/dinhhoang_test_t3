package com.example.cybershield.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * Email mô phỏng cho chế độ "Survival Virtual Inbox" (kiểm duyệt phishing).
 */
@Entity
@Table(name = "virtual_inbox_emails")
@Data
public class VirtualInboxEmail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String senderEmail;

    private String senderName;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    /** URL hiển thị trong nội dung (link ẩn / nút hành động giả). */
    @Column(columnDefinition = "TEXT")
    private String linkUrl;

    private String linkLabel;

    @Column(name = "is_phishing", nullable = false)
    private boolean phishing;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "virtual_inbox_email_red_flags",
            joinColumns = @JoinColumn(name = "email_id")
    )
    @Column(name = "flag_text", length = 1024)
    @OrderColumn(name = "sort_order")
    private List<String> redFlags = new ArrayList<>();
}
