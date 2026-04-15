package com.example.cybershield.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GameplayDecision {

    @NotBlank(message = "decisionType không được để trống")
    private String decisionType;

    @NotBlank(message = "userAction không được để trống")
    private String userAction;

    @NotNull(message = "isPhishing không được để trống")
    private Boolean isPhishing;

    private String payload;

    /** Mã OTP đúng (MAIL_OTP) — frontend gửi, không đọc từ content DB. */
    private String expectedPayload;
}
