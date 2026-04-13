package com.example.cybershield.config;

import com.example.cybershield.entity.*;
import com.example.cybershield.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ScenarioRepository scenarioRepository;
    private final ScenarioStepRepository scenarioStepRepository;
    private final LandingPageRepository landingPageRepository;
    private final TrainingSessionRepository trainingSessionRepository;
    private final SessionDetailRepository sessionDetailRepository;
    private final DataLeakRepository dataLeakRepository;
    private final BadgeRepository badgeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        User admin = ensureAdminUser();
        User player = ensurePlayerUser();

        List<Scenario> scenarios = ensureScenarios();
        ensureScenarioStepsAndLandingPages(scenarios);
        ensureTrainingProgress(player, scenarios);
        ensureBadges();

        System.out.println("✅ Seed Data hoàn tất. Admin: " + admin.getUsername() + ", Player: " + player.getUsername());
    }

    private void ensureBadges() {
        if (badgeRepository.count() > 0) return;

        List<Badge> badges = new ArrayList<>();
        badges.add(buildBadge(1, "Sắt - Tân Binh", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775207808/Rank1_S%E1%BA%AFt_l9tft7.png", 0));
        badges.add(buildBadge(2, "Đồng - Thám Tử Số", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775207808/Rank2_%C4%90%E1%BB%93ng_obqlkf.png", 500));
        badges.add(buildBadge(3, "Bạc - Chuyên Viên", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775207808/Rank3_B%E1%BA%A1c_yiylke.png", 1500));
        badges.add(buildBadge(4, "Bạch Kim - Tinh Anh", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775207809/Rank5_B%E1%BA%A1chKim_m52r0q.png", 6000));
        badges.add(buildBadge(5, "Lục Bảo - Chuyên Gia", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775207808/Rank6_L%E1%BB%A5cB%E1%BA%A3o_sytkat.png", 10000));
        badges.add(buildBadge(6, "Kim Cương - Huyền Thoại", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775208171/Rank7_KimC%C6%B0%C6%A1ng_kuore7.png", 20000));
        badges.add(buildBadge(7, "Cao Thủ - Bức Tường Lửa", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775207809/Rank8_CaoTh%E1%BB%A7_bwchpp.png", 40000));
        badges.add(buildBadge(8, "Thách Đấu - Cyber Overlord", "https://res.cloudinary.com/drdim9z1v/image/upload/v1775208176/Rank9_Th%C3%A1ch%C4%90%E1%BA%A5u_i2svwp.png", 75000));

        badgeRepository.saveAll(badges);
        System.out.println("✅ Khởi tạo thành công dữ liệu Hệ thống Huy hiệu (Ranks)!");
    }

    private Badge buildBadge(int id, String name, String iconUrl, int requiredExp) {
        Badge badge = new Badge();
        badge.setId(id);
        badge.setName(name);
        badge.setIconUrl(iconUrl);
        badge.setRequiredExp(requiredExp);
        return badge;
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

    private List<Scenario> ensureScenarios() {
        if (scenarioRepository.count() > 0) {
            return scenarioRepository.findAll();
        }

        List<Scenario> scenarios = new ArrayList<>();
        scenarios.add(createScenario(
                "Chiến dịch 1: Sơ hở từ hòm thư",
                "Mass Phishing",
                "Easy",
                "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
                "Nhận diện chiến dịch phishing đại trà qua lỗi chính tả, domain lạ và CTA khẩn cấp.",
                300
        ));
        scenarios.add(createScenario(
                "Chiến dịch 2: Cuộc gọi từ \"Ngân hàng\"",
                "Brand Spoofing",
                "Medium",
                "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80",
                "Xử lý tình huống mạo danh thương hiệu ngân hàng, kết hợp email + landing giả.",
                450
        ));
        scenarios.add(createScenario(
                "Chiến dịch 3: Tài liệu mật phòng HR",
                "Spear Phishing",
                "Medium",
                "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
                "Phân tích thư nhắm mục tiêu cá nhân hóa, đính kèm tài liệu độc hại.",
                500
        ));
        scenarios.add(createScenario(
                "Chiến dịch 4: Chỉ thị khẩn cấp từ CEO",
                "Whaling/BEC",
                "Hard",
                "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
                "Ngăn chặn tấn công BEC cấp quản trị với yêu cầu chuyển tiền/tiết lộ dữ liệu.",
                700
        ));
        scenarios.add(createScenario(
                "Chiến dịch 5: Chuỗi cung ứng bị tấn công",
                "Advanced Evasion",
                "Hard",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
                "Mô phỏng chuỗi tấn công nhiều tầng, né tránh phát hiện bằng domain gần giống và kỹ thuật social engineering.",
                850
        ));

        return scenarioRepository.saveAll(scenarios);
    }

    private Scenario createScenario(
            String title,
            String category,
            String difficulty,
            String thumbnailUrl,
            String description,
            int rewardExp
    ) {
        Scenario scenario = new Scenario();
        scenario.setTitle(title);
        scenario.setCategory(category);
        scenario.setDifficulty(difficulty);
        scenario.setThumbnailUrl(thumbnailUrl);
        scenario.setDescription(description);
        scenario.setRewardExp(rewardExp);
        return scenario;
    }

    private void ensureScenarioStepsAndLandingPages(List<Scenario> scenarios) {
        if (scenarioStepRepository.count() > 0) return;
        if (scenarios.isEmpty()) return;

        // Scenario 1: Sơ hở từ hòm thư (Mass Phishing)
        if (scenarios.size() >= 1) {
            Scenario s1 = scenarios.get(0);
            ScenarioStep s1Step1 = saveStep(
                    s1, 1, "MAIL",
                    "{\"title\":\"Nhận diện Email giả mạo đại trà\",\"threatLevel\":1,\"from\":\"promo@m1crosoft-support.com\",\"subject\":\"Nhận quà 999.000đ trong 5 phút\"}",
                    "CLICK_LINK", "REPORT",
                    "Bài 1 (Threat 1): Nhận diện email đại trà với dấu hiệu giục bấm link gấp."
            );
            ScenarioStep s1Step2 = saveStep(
                    s1, 2, "WEB_PAGE",
                    "{\"title\":\"Kiểm tra Link ẩn dưới nút bấm\",\"threatLevel\":2,\"buttonText\":\"Xác nhận tài khoản ngay\",\"hoverHint\":\"URL thật khác domain chính thức\"}",
                    "INPUT", "REPORT",
                    "Bài 2 (Threat 2): Hover kiểm tra URL đích trước khi thao tác."
            );
            landingPageRepository.save(buildLanding(s1Step2, s1.getTitle()));
        }

        // Scenario 2: Cuộc gọi từ Ngân hàng (Brand Spoofing)
        if (scenarios.size() >= 2) {
            Scenario s2 = scenarios.get(1);
            ScenarioStep s2Step1 = saveStep(
                    s2, 1, "MAIL",
                    "{\"title\":\"Cảnh giác với Email cảnh báo khóa tài khoản\",\"threatLevel\":2,\"from\":\"security@v1etcombank-alert.com\",\"subject\":\"Tài khoản sẽ bị khóa sau 10 phút\"}",
                    "CLICK_LINK", "REPORT",
                    "Bài 1 (Threat 2): Email mạo danh thương hiệu ngân hàng nhằm tạo hoảng loạn."
            );
            ScenarioStep s2Step2 = saveStep(
                    s2, 2, "WEB_PAGE",
                    "{\"title\":\"Phân tích Landing Page giả mạo ngân hàng\",\"threatLevel\":3,\"fakeBrand\":\"VCB Secure Login\",\"hint\":\"Sai chứng chỉ + domain lệch\"}",
                    "INPUT", "REPORT",
                    "Bài 2 (Threat 3): So khớp giao diện và domain thật/giả trước khi đăng nhập."
            );
            ScenarioStep s2Step3 = saveStep(
                    s2, 3, "OTP",
                    "{\"title\":\"Phòng thủ yêu cầu cung cấp mã OTP\",\"threatLevel\":3,\"message\":\"Nhập OTP để hủy giao dịch lạ\"}",
                    "INPUT", "REPORT",
                    "Bài 3 (Threat 3): Tuyệt đối không chia sẻ OTP qua bất kỳ kênh nào."
            );
            landingPageRepository.save(buildLanding(s2Step2, s2.getTitle()));
        }

        // Scenario 3: Tài liệu mật phòng HR (Spear Phishing)
        if (scenarios.size() >= 3) {
            Scenario s3 = scenarios.get(2);
            saveStep(
                    s3, 1, "MAIL",
                    "{\"title\":\"Thư thông báo tăng lương bất thường\",\"threatLevel\":3,\"from\":\"hr-benefits@company-payroll.net\",\"subject\":\"Điều chỉnh lương bí mật Q2\"}",
                    "CLICK_LINK", "REPORT",
                    "Bài 1 (Threat 3): Nội dung cá nhân hóa cao nhưng có yêu cầu mở tài liệu đáng ngờ."
            );
            saveStep(
                    s3, 2, "MAIL",
                    "{\"title\":\"Soi kỹ email nội bộ bị fake (Typosquatting)\",\"threatLevel\":4,\"from\":\"ceo@cornpany.com\",\"subject\":\"Tài liệu nhân sự tuyệt mật\"}",
                    "CLICK_LINK", "REPORT",
                    "Bài 2 (Threat 4): Typosquatting tinh vi ở domain nội bộ (company vs cornpany)."
            );
        }

        // Scenario 4: Chỉ thị khẩn cấp từ CEO (BEC/Whaling)
        if (scenarios.size() >= 4) {
            Scenario s4 = scenarios.get(3);
            saveStep(
                    s4, 1, "MAIL",
                    "{\"title\":\"Áp lực thời gian từ cấp trên\",\"threatLevel\":4,\"from\":\"ceo.office@corp-management.co\",\"subject\":\"Xử lý khẩn trong 15 phút\"}",
                    "CLICK_LINK", "REPORT",
                    "Bài 1 (Threat 4): Kẻ tấn công dùng authority + urgency để ép bỏ qua quy trình."
            );
            saveStep(
                    s4, 2, "OTP",
                    "{\"title\":\"Yêu cầu chuyển khoản bỏ qua quy trình\",\"threatLevel\":5,\"message\":\"Chuyển khoản ngay, gửi mã xác thực cho tôi\"}",
                    "INPUT", "REPORT",
                    "Bài 2 (Threat 5): BEC/Whaling yêu cầu hành động tài chính không qua kênh xác minh chuẩn."
            );
        }

        // Scenario 5: Chuỗi cung ứng bị tấn công (giữ riêng dữ liệu để không trùng chiến dịch khác)
        if (scenarios.size() >= 5) {
            Scenario s5 = scenarios.get(4);
            ScenarioStep s5Step1 = saveStep(
                    s5, 1, "MAIL",
                    "{\"title\":\"Thông báo cập nhật hệ thống từ nhà cung cấp\",\"threatLevel\":4,\"from\":\"vendor-update@trusted-supplier.support\",\"subject\":\"Patch bắt buộc hôm nay\"}",
                    "CLICK_LINK", "REPORT",
                    "Bài 1: Chuỗi cung ứng thường giả mạo vendor để phát tán liên kết độc."
            );
            ScenarioStep s5Step2 = saveStep(
                    s5, 2, "WEB_PAGE",
                    "{\"title\":\"Cổng tải file giả mạo\",\"threatLevel\":5,\"hint\":\"Trang tải file yêu cầu login lại bằng tài khoản nội bộ\"}",
                    "INPUT", "REPORT",
                    "Bài 2: Không đăng nhập lại trên cổng tải file không thuộc hệ thống chuẩn."
            );
            ScenarioStep s5Step3 = saveStep(
                    s5, 3, "ZALO",
                    "{\"title\":\"Tin nhắn follow-up xác nhận OTP\",\"threatLevel\":5,\"sender\":\"IT Helpdesk Clone\"}",
                    "INPUT", "REPORT",
                    "Bài 3: Kết hợp đa kênh để ép người dùng tiết lộ OTP/token."
            );
            landingPageRepository.save(buildLanding(s5Step2, s5.getTitle()));
        }
    }

    private ScenarioStep saveStep(
            Scenario scenario,
            int stepOrder,
            String stepType,
            String content,
            String triggerFailure,
            String triggerSuccess,
            String feedback
    ) {
        return scenarioStepRepository.save(buildStep(
                scenario,
                stepOrder,
                stepType,
                content,
                triggerFailure,
                triggerSuccess,
                feedback
        ));
    }

    private ScenarioStep buildStep(
            Scenario scenario,
            int stepOrder,
            String stepType,
            String content,
            String triggerFailure,
            String triggerSuccess,
            String feedback
    ) {
        ScenarioStep step = new ScenarioStep();
        step.setScenario(scenario);
        step.setStepOrder(stepOrder);
        step.setStepType(stepType);
        step.setContent(content);
        step.setTriggerFailure(triggerFailure);
        step.setTriggerSuccess(triggerSuccess);
        step.setAiFeedback(feedback);
        return step;
    }

    private LandingPage buildLanding(ScenarioStep step, String scenarioTitle) {
        LandingPage landing = new LandingPage();
        landing.setStep(step);
        landing.setTemplateName("PhishingTemplate-" + step.getStepOrder());
        landing.setFakeUrl("https://secure-" + scenarioTitle.toLowerCase().replace(" ", "-") + ".verify-login.net");
        landing.setRequiredFields("[\"username\",\"password\",\"otp\"]");
        return landing;
    }

    private void ensureTrainingProgress(User player, List<Scenario> scenarios) {
        if (trainingSessionRepository.count() > 0) return;

        for (int i = 0; i < scenarios.size(); i++) {
            Scenario scenario = scenarios.get(i);
            TrainingSession session = new TrainingSession();
            session.setUser(player);
            session.setScenario(scenario);
            session.setStartedAt(LocalDateTime.now().minusDays(5L - i));
            session.setEndedAt(LocalDateTime.now().minusDays(5L - i).plusMinutes(12));
            session.setScoreGained(200 + i * 75);
            session.setStatus(i < 3 ? "COMPLETED" : "FAILED");
            trainingSessionRepository.save(session);

            List<ScenarioStep> steps = scenarioStepRepository.findByScenarioIdOrderByStepOrderAsc(scenario.getId());
            for (ScenarioStep step : steps) {
                SessionDetail detail = new SessionDetail();
                detail.setSession(session);
                detail.setStep(step);
                boolean correct = i < 3 || step.getStepOrder() < 3;
                detail.setCorrect(correct);
                detail.setUserAction(correct ? "REPORT" : "CLICK_LINK");
                detail.setResponseTime(0.9f + step.getStepOrder() * 0.2f);
                sessionDetailRepository.save(detail);
            }

            if (i >= 3) {
                DataLeak leak = new DataLeak();
                leak.setUser(player);
                leak.setSession(session);
                leak.setDataType("OTP");
                leak.setLeakedValue("******");
                leak.setLeakedAt(LocalDateTime.now().minusDays(4L - i));
                dataLeakRepository.save(leak);
            }
        }
    }
}