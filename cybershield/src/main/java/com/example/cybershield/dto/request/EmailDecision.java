package com.example.cybershield.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Quyết định trên từng email. {@code payload} / {@code expectedPayload} dùng cho MAIL_OTP (OTP nhập / OTP đúng do FE sinh).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EmailDecision {

    @NotNull(message = "emailId không được để trống")
    private Long emailId;

    @NotNull(message = "isPhishing không được để trống")
    private Boolean isPhishing;

    @NotBlank(message = "userAction không được để trống")
    private String userAction;

    /** Mã OTP người chơi nhập (MAIL_OTP / trap trình duyệt). */
    private String payload;

    /** Mã OTP đúng do frontend sinh — không lưu trong DB. */
    private String expectedPayload;
}
