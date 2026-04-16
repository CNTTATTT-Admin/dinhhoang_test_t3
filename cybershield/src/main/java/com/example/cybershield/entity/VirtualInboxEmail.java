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

    /** Bài học (bước scenario) sở hữu hàng đợi mail này. Nullable để tương thích bản cũ. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scenario_step_id")
    private ScenarioStep scenarioStep;

    /** Thứ tự trong hàng đợi (1..n). */
    @Column(nullable = false)
    private int sortOrder = 0;

    /** Gợi ý pha trộn: ví dụ EASY_PHISH, LEGIT, MID_PHISH, BOSS. */
    @Column(length = 32)
    private String slotTag;

    /** Loại câu hỏi ở cấp từng email: MAIL_STANDARD, MAIL_FILE, MAIL_WEB, MAIL_OTP, MAIL_ZALO. */
    @Column(length = 32)
    private String emailType;

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

    /**
     * JSON mô phỏng file tải từ link (tên file, nội dung xem trước, cảnh báo).
     * Nullable — email không có bước mở file thì để trống.
     */
    @Column(name = "attachment_json", columnDefinition = "TEXT")
    private String attachmentJson;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "virtual_inbox_email_red_flags",
            joinColumns = @JoinColumn(name = "email_id")
    )
    @Column(name = "flag_text", length = 1024)
    @OrderColumn(name = "sort_order")
    private List<String> redFlags = new ArrayList<>();
}
