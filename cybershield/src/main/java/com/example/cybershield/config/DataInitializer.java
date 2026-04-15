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
import java.util.concurrent.ThreadLocalRandom;

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
        scenarios.add(createScenario("Chiến dịch 1: Nhập môn Phishing", "MAIL_STANDARD", "Easy", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80", "Chiến dịch nhập môn giúp nhận diện phishing qua người gửi, nội dung và dấu hiệu thao túng tâm lý.", 500));
        scenarios.add(createScenario("Chiến dịch 2: Hiểm họa đính kèm", "MAIL_FILE", "Medium", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80", "Mô phỏng các rủi ro tệp đính kèm trong email công sở với mức độ giả lập cao.", 700));
        scenarios.add(createScenario("Chiến dịch 3: Website giả mạo", "MAIL_WEB", "Hard", "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80", "Mô phỏng bộ trap website giả mạo để rèn kỹ năng soi URL và đối chiếu ngữ cảnh dịch vụ.", 1000));
        scenarios.add(createScenario("Chiến dịch 4: Chiếm đoạt OTP", "MAIL_OTP", "Hard", "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80", "Mô phỏng các kịch bản social engineering nhằm đánh cắp mã OTP qua email và trang xác minh giả.", 1200));
        scenarios.add(createScenario("Chiến dịch 5: Đặc vụ điều tra số", "MAIL_ZALO", "Hard", "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80", "Đối chiếu mâu thuẫn giữa Email, Zalo và quy trình SOP nội bộ để ra quyết định chính xác.", 1500));
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

        upsertStep(scenarios.get(0), 1, "MAIL_STANDARD", "{\"scenarioType\":\"MAIL_STANDARD\",\"title\":\"Bài tập 1: Soi địa chỉ người gửi\",\"threatLevel\":1}", "REPORT", "VERIFIED", "Tập trung kiểm tra domain người gửi và các dấu hiệu typosquatting.");
        upsertStep(scenarios.get(0), 2, "MAIL_STANDARD", "{\"scenarioType\":\"MAIL_STANDARD\",\"title\":\"Bài tập 2: Phân biệt thông báo và mail rác\",\"threatLevel\":1}", "REPORT", "VERIFIED", "Đánh giá ngữ cảnh công sở để phân biệt thông báo thật và spam quảng cáo.");
        upsertStep(scenarios.get(0), 3, "MAIL_STANDARD", "{\"scenarioType\":\"MAIL_STANDARD\",\"title\":\"Bài tập 3: Nhận diện thao túng tâm lý\",\"threatLevel\":2}", "REPORT", "VERIFIED", "Nhận biết các email dùng hù dọa hoặc hối thúc để dẫn dụ người dùng.");
        upsertStep(scenarios.get(1), 1, "MAIL_FILE", "{\"scenarioType\":\"MAIL_FILE\",\"title\":\"Bài tập 1: Bản chất của đuôi tệp\",\"threatLevel\":2}", "CLICK_LINK", "REPORT", "Tập trung soi định dạng tệp nguy hiểm và đuôi kép đánh lừa người dùng.");
        upsertStep(scenarios.get(1), 2, "MAIL_FILE", "{\"scenarioType\":\"MAIL_FILE\",\"title\":\"Bài tập 2: Tin vào cảnh báo hệ thống\",\"threatLevel\":3}", "CLICK_LINK", "REPORT", "Đánh giá mức độ nguy hiểm dựa trên cảnh báo quét tệp đính kèm.");
        upsertStep(scenarios.get(1), 3, "MAIL_FILE", "{\"scenarioType\":\"MAIL_FILE\",\"title\":\"Bài tập 3: Ngữ cảnh và tệp đính kèm\",\"threatLevel\":3}", "CLICK_LINK", "REPORT", "Kết hợp ngữ cảnh công việc và bản chất tệp để đưa ra quyết định an toàn.");
        upsertStep(
                scenarios.get(2),
                1,
                "MAIL_WEB",
                buildMailWebContent(
                        "Bài tập 1: Sự sai lệch ký tự (Typosquatting)",
                        3,
                        "["
                                + "{\"sortOrder\":1,\"webType\":\"GOOGLE\",\"title\":\"Đăng nhập Google Drive\",\"displayUrl\":\"https://accounts.google.com\",\"actualUrl\":\"https://accounts.google.com\"},"
                                + "{\"sortOrder\":2,\"webType\":\"FACEBOOK\",\"title\":\"Đăng nhập Facebook\",\"displayUrl\":\"https://facebook.com\",\"actualUrl\":\"https://faceboook.com\"},"
                                + "{\"sortOrder\":3,\"webType\":\"MICROSOFT\",\"title\":\"Microsoft 365 Security\",\"displayUrl\":\"https://login.microsoftonline.com\",\"actualUrl\":\"https://login.microsoftonline.com\"},"
                                + "{\"sortOrder\":4,\"webType\":\"GITHUB\",\"title\":\"GitHub Security Check\",\"displayUrl\":\"https://github.com/login\",\"actualUrl\":\"https://githulb.com/login\"},"
                                + "{\"sortOrder\":5,\"webType\":\"GOOGLE\",\"title\":\"Google Workspace Verification\",\"displayUrl\":\"https://accounts.google.com\",\"actualUrl\":\"https://googIe.com/auth\"}"
                                + "]"
                ),
                "INPUT",
                "REPORT",
                "Bài tập tập trung vào lỗi sai ký tự nhỏ trong tên miền."
        );
        upsertStep(
                scenarios.get(2),
                2,
                "MAIL_WEB",
                buildMailWebContent(
                        "Bài tập 2: Tên miền phụ và đuôi mở rộng lạ",
                        4,
                        "["
                                + "{\"sortOrder\":1,\"webType\":\"MICROSOFT\",\"title\":\"Microsoft Support Portal\",\"displayUrl\":\"https://microsoft.com\",\"actualUrl\":\"https://microsoft.support-portal.net\"},"
                                + "{\"sortOrder\":2,\"webType\":\"GOOGLE\",\"title\":\"Gmail Security\",\"displayUrl\":\"https://myaccount.google.com\",\"actualUrl\":\"https://myaccount.google.com\"},"
                                + "{\"sortOrder\":3,\"webType\":\"FACEBOOK\",\"title\":\"Facebook Business Login\",\"displayUrl\":\"https://facebook.com/business\",\"actualUrl\":\"https://facebook.login-portal.net\"},"
                                + "{\"sortOrder\":4,\"webType\":\"FINANCE\",\"title\":\"Vietcombank E-Banking\",\"displayUrl\":\"https://vietcombank.com.vn\",\"actualUrl\":\"https://vietcombank.account-secure.xyz\"},"
                                + "{\"sortOrder\":5,\"webType\":\"GITHUB\",\"title\":\"GitHub Account Security\",\"displayUrl\":\"https://github.com/settings/security\",\"actualUrl\":\"https://github.com/settings/security\"}"
                                + "]"
                ),
                "INPUT",
                "REPORT",
                "Bài tập giúp nhận diện domain chính ở cuối URL và các đuôi bất thường."
        );
        upsertStep(
                scenarios.get(2),
                3,
                "MAIL_WEB",
                buildMailWebContent(
                        "Bài tập 3: Đối chiếu ngữ cảnh dịch vụ và trang đích",
                        5,
                        "["
                                + "{\"sortOrder\":1,\"webType\":\"GOOGLE\",\"title\":\"Google Drive Storage Alert\",\"displayUrl\":\"https://accounts.google.com\",\"actualUrl\":\"https://secure-login-storage.top\"},"
                                + "{\"sortOrder\":2,\"webType\":\"FINANCE\",\"title\":\"Vietcombank eBanking\",\"displayUrl\":\"https://ebanking.vietcombank.com.vn\",\"actualUrl\":\"https://ebanking.vietcombank.com.vn\"},"
                                + "{\"sortOrder\":3,\"webType\":\"FACEBOOK\",\"title\":\"Facebook Policy Security\",\"displayUrl\":\"https://facebook.com\",\"actualUrl\":\"https://fb-policy-security.org\"},"
                                + "{\"sortOrder\":4,\"webType\":\"MICROSOFT\",\"title\":\"Microsoft Teams Verification\",\"displayUrl\":\"https://teams.microsoft.com\",\"actualUrl\":\"https://mircosoft-teams.biz\"},"
                                + "{\"sortOrder\":5,\"webType\":\"GITHUB\",\"title\":\"GitHub Authentication\",\"displayUrl\":\"https://github.com/login\",\"actualUrl\":\"https://github.com/login\"}"
                                + "]"
                ),
                "INPUT",
                "REPORT",
                "Bài tập buộc người học đối chiếu giao diện hiển thị với domain thật trên thanh địa chỉ."
        );
        upsertStep(scenarios.get(3), 1, "MAIL_OTP", "{\"scenarioType\":\"MAIL_OTP\",\"title\":\"Bài tập 1: Mượn danh IT Support\",\"message\":\"Phân biệt OTP thật và yêu cầu cung cấp OTP giả mạo từ IT.\",\"threatLevel\":4}", "INPUT", "REPORT", "IT thật không bao giờ yêu cầu nhân viên đọc OTP qua email hoặc điện thoại.");
        upsertStep(scenarios.get(3), 2, "MAIL_OTP", "{\"scenarioType\":\"MAIL_OTP\",\"title\":\"Bài tập 2: Áp lực từ cấp trên\",\"message\":\"Nhận diện hành vi mạo danh sếp để ép cung cấp OTP.\",\"threatLevel\":5}", "INPUT", "REPORT", "Kẻ gian thường lợi dụng uy quyền của cấp trên để buộc nhân viên tiết lộ OTP.");
        upsertStep(scenarios.get(3), 3, "MAIL_OTP", "{\"scenarioType\":\"MAIL_OTP\",\"title\":\"Bài tập 3: Tài khoản bị xâm nhập\",\"message\":\"Đối phó email hù dọa để chiếm đoạt OTP.\",\"threatLevel\":5}", "INPUT", "REPORT", "Không nhập OTP vào link lạ dù email cảnh báo mất tiền hoặc mất tài khoản.");
        upsertStep(
                scenarios.get(4), 1, "ZALO",
                buildFlow5Content(
                        "Bài tập 1: Mệnh lệnh của Ban Giám đốc", 5,
                        "["
                                + "{\"sortOrder\":1,\"caseId\":\"CASE_1\",\"zaloVerifyRequired\":true,\"zaloAutoReply\":\"Dạ em đã kiểm tra và xác nhận theo đúng quy trình.\",\"messages\":[{\"sender\":\"Sếp Quang\",\"text\":\"Anh đã gửi báo cáo PDF, em xác nhận trên Zalo giúp anh.\"}]},"
                                + "{\"sortOrder\":2,\"caseId\":\"CASE_2\",\"zaloVerifyRequired\":false,\"zaloAutoReply\":\"Đã nhận thông tin.\",\"messages\":[{\"sender\":\"Sếp Quang\",\"text\":\"Em chạy file .exe ngay cho anh để kịp họp nhé.\"}]},"
                                + "{\"sortOrder\":3,\"caseId\":\"CASE_3\",\"zaloVerifyRequired\":false,\"zaloAutoReply\":\"Đã nhận.\",\"messages\":[{\"sender\":\"Sếp Quang\",\"text\":\"...\"}]},"
                                + "{\"sortOrder\":4,\"caseId\":\"CASE_4\",\"zaloVerifyRequired\":true,\"zaloAutoReply\":\"Em đã đối chiếu đầy đủ và xác nhận hợp lệ.\",\"messages\":[{\"sender\":\"Sếp Quang\",\"text\":\"Anh đang ngoài đường nên dùng tạm Gmail, em xác nhận giúp anh.\"}]},"
                                + "{\"sortOrder\":5,\"caseId\":\"CASE_5\",\"zaloVerifyRequired\":true,\"zaloAutoReply\":\"Em đã nhận yêu cầu và đang xác minh theo SOP.\",\"messages\":[{\"sender\":\"Sếp Quang\",\"text\":\"Anh cần chuyển khoản gấp, em xử lý ngay trên Zalo.\"}]}"
                                + "]"
                ),
                "INPUT", "REPORT",
                "Đối chiếu mệnh lệnh cấp trên với SOP thay vì làm theo cảm tính."
        );
        upsertStep(
                scenarios.get(4), 2, "ZALO",
                buildFlow5Content(
                        "Bài tập 2: Đặc quyền của IT Support", 5,
                        "["
                                + "{\"sortOrder\":1,\"caseId\":\"CASE_6\",\"zaloVerifyRequired\":false,\"zaloAutoReply\":\"Đã nhận.\",\"messages\":[{\"sender\":\"IT Đức\",\"text\":\"Đọc anh mã OTP để anh fix lỗi hệ thống ngay.\"}]},"
                                + "{\"sortOrder\":2,\"caseId\":\"CASE_7\",\"zaloVerifyRequired\":true,\"zaloAutoReply\":\"Em đã nhận link nội bộ và xác nhận an toàn.\",\"messages\":[{\"sender\":\"IT Đức\",\"text\":\"Anh gửi link update nội bộ, em xác nhận đã nhận.\"}]},"
                                + "{\"sortOrder\":3,\"caseId\":\"CASE_8\",\"zaloVerifyRequired\":false,\"zaloAutoReply\":\"Đã nhận.\",\"messages\":[{\"sender\":\"IT Đức\",\"text\":\"Link update mới, em mở nhanh giúp anh.\"}]},"
                                + "{\"sortOrder\":4,\"caseId\":\"CASE_9\",\"zaloVerifyRequired\":false,\"zaloAutoReply\":\"Đã rõ.\",\"messages\":[{\"sender\":\"IT Đức\",\"text\":\"Gửi mật khẩu máy em qua Zalo để anh cài app từ xa.\"}]},"
                                + "{\"sortOrder\":5,\"caseId\":\"CASE_10\",\"zaloVerifyRequired\":true,\"zaloAutoReply\":\"Em đã đọc tài liệu và xác nhận theo hướng dẫn.\",\"messages\":[{\"sender\":\"IT Đức\",\"text\":\"Anh gửi tài liệu PDF hướng dẫn mới, em xác nhận giúp anh.\"}]}"
                                + "]"
                ),
                "INPUT", "REPORT",
                "IT có quyền kỹ thuật nhưng không có quyền yêu cầu OTP hay mật khẩu cá nhân."
        );
        upsertStep(
                scenarios.get(4), 3, "ZALO",
                buildFlow5Content(
                        "Bài tập 3: Kế toán & Nhân sự", 5,
                        "["
                                + "{\"sortOrder\":1,\"caseId\":\"CASE_11\",\"zaloVerifyRequired\":true,\"zaloAutoReply\":\"Em đã kiểm tra hóa đơn và xác nhận hợp lệ.\",\"messages\":[{\"sender\":\"Kế toán Lan\",\"text\":\"Chị gửi ảnh hóa đơn qua Zalo, em xác nhận giúp chị.\"}]},"
                                + "{\"sortOrder\":2,\"caseId\":\"CASE_12\",\"zaloVerifyRequired\":false,\"zaloAutoReply\":\"Đã nhận.\",\"messages\":[{\"sender\":\"Kế toán Lan\",\"text\":\"Em vào link này đăng nhập ngân hàng để xem lương nhé.\"}]},"
                                + "{\"sortOrder\":3,\"caseId\":\"CASE_13\",\"zaloVerifyRequired\":false,\"zaloAutoReply\":\"Đã nhận.\",\"messages\":[{\"sender\":\"HR Linh\",\"text\":\"Chị gửi file zip danh sách nhân sự, em mở nhanh giúp chị.\"}]},"
                                + "{\"sortOrder\":4,\"caseId\":\"CASE_14\",\"zaloVerifyRequired\":true,\"zaloAutoReply\":\"Em đã mở file đúng mật khẩu và xác nhận hoàn tất.\",\"messages\":[{\"sender\":\"HR Linh\",\"text\":\"Mật khẩu file zip là mã nhân viên của em, em xác nhận đã nhận giúp chị.\"}]},"
                                + "{\"sortOrder\":5,\"caseId\":\"CASE_15\",\"zaloVerifyRequired\":false,\"zaloAutoReply\":\"Đã rõ.\",\"messages\":[{\"sender\":\"Kế toán Lan\",\"text\":\"Chị không biết vụ đổi tài khoản nhận tiền nào cả, em báo cáo giúp chị.\"}]}"
                                + "]"
                ),
                "INPUT", "REPORT",
                "Dữ liệu tài chính và nhân sự luôn phải đối chiếu chéo trước khi thao tác."
        );
    }

    private String buildFlow5Content(String title, int threatLevel, String caseMapJson) {
        String rulesJson = "["
                + "\"Sếp Quang: Chỉ gửi file qua Email công ty (.docx, .pdf). Không yêu cầu chuyển tiền qua Zalo.\","
                + "\"Sếp Quang: Mọi chỉ đạo thay đổi lịch họp phải có tin nhắn Zalo xác nhận.\","
                + "\"IT Đức: Cấp mật khẩu mới qua Email. Không bao giờ hỏi mã OTP trên Zalo.\","
                + "\"IT Đức: Link update phần mềm phải là domain cybershield.internal.\","
                + "\"HR Linh: Thông báo tuyển dụng gửi qua Zalo. Không yêu cầu click link lạ để xem lương.\","
                + "\"HR Linh: File danh sách nhân viên luôn có mật khẩu bảo vệ là mã nhân viên.\","
                + "\"Kế toán Lan: Yêu cầu hóa đơn phải gửi ảnh qua Zalo để đối chiếu.\","
                + "\"Kế toán Lan: Không bao giờ gửi link bắt đăng nhập ngân hàng qua Email.\","
                + "\"Sales Nam: Hợp đồng khách hàng gửi qua Email. Không bao giờ yêu cầu khách gửi OTP cho Sales.\","
                + "\"Sales Nam: Chỉ nhận thông tin khách hàng từ hệ thống CRM nội bộ.\""
                + "]";
        String sectionsJson = "["
                + "{"
                + "\"employee\":\"Sếp Quang\","
                + "\"email\":\"sep.quang@cybershield.biz\","
                + "\"rules\":["
                + "\"Chỉ gửi file qua Email công ty (định dạng .docx, .pdf).\","
                + "\"Mọi thay đổi lịch họp phải có tin nhắn Zalo xác nhận.\""
                + "]"
                + "},"
                + "{"
                + "\"employee\":\"IT Đức\","
                + "\"email\":\"it.support@cybershield.biz\","
                + "\"rules\":["
                + "\"Cấp mật khẩu mới qua Email. Không bao giờ hỏi OTP trên Zalo.\","
                + "\"Link cập nhật phần mềm phải thuộc domain cybershield.internal.\""
                + "]"
                + "}"
                + "]";
        return "{"
                + "\"scenarioType\":\"MAIL_ZALO\","
                + "\"title\":\"" + escapeJson(title) + "\","
                + "\"sender\":\"Điều phối nội bộ\","
                + "\"messages\":[{\"sender\":\"Điều phối nội bộ\",\"text\":\"Đối chiếu thông tin Email, Zalo và DOC trước khi xác nhận.\"}],"
                + "\"zaloVerifyRequired\":false,"
                + "\"zaloAutoReply\":\"Dạ em đã xác nhận theo quy trình nội bộ.\","
                + "\"caseMap\":" + caseMapJson + ","
                + "\"policyRules\":" + rulesJson + ","
                + "\"policySections\":" + sectionsJson + ","
                + "\"threatLevel\":" + threatLevel
                + "}";
    }

    private String buildMailWebContent(String title, int threatLevel, String emailTrapsJson) {
        return "{"
                + "\"scenarioType\":\"MAIL_WEB\","
                + "\"title\":\"" + escapeJson(title) + "\","
                + "\"traps\":{"
                + "\"browser\":{"
                + "\"enabled\":true,"
                + "\"webType\":\"MICROSOFT\","
                + "\"title\":\"Xác thực bảo mật tài khoản\","
                + "\"displayUrl\":\"https://login.microsoftonline.com\","
                + "\"actualUrl\":\"https://login.microsoftonline.com\","
                + "\"formType\":\"CREDENTIAL\","
                + "\"emailTraps\":" + emailTrapsJson
                + "}"
                + "},"
                + "\"threatLevel\":" + threatLevel + ","
                + "\"webTypePlaybook\":["
                + "{\"webType\":\"FACEBOOK\",\"displayUrl\":\"https://facebook.com/login\"},"
                + "{\"webType\":\"GOOGLE\",\"displayUrl\":\"https://accounts.google.com/signin\"},"
                + "{\"webType\":\"MICROSOFT\",\"displayUrl\":\"https://login.microsoftonline.com\"},"
                + "{\"webType\":\"GITHUB\",\"displayUrl\":\"https://github.com/login\"},"
                + "{\"webType\":\"FINANCE\",\"displayUrl\":\"https://ebanking.vietcombank.com.vn\"}"
                + "]"
                + "}";
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
        if (content.contains("\"scenarioType\":\"MAIL_STANDARD\"")) {
            if (step.getStepOrder() == 1) {
                addVirtualInboxEmail(
                        emails, step, 1, "LEGIT", false,
                        "security@microsoft.com", "Microsoft Security",
                        "Mã xác minh bảo mật của bạn",
                        "Xin chào, mã xác minh danh tính của bạn là 123456. Vui lòng không chia sẻ mã này với bất kỳ ai.",
                        null, null, null, List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 2, "PHISH", true,
                        "security@microsoft-support.co", "Microsoft Support",
                        "[CẢNH BÁO] Tài khoản bị khóa",
                        "Tài khoản Microssoft của bạn đã bị đăng nhập trái phép. Hãy click để mở khóa ngay!!!",
                        null, null, null,
                        List.of("Domain đuôi .co không phải domain chính thức của Microsoft", "Sai chính tả 'Microssoft'", "Văn phong hối thúc, tạo áp lực")
                );
                addVirtualInboxEmail(
                        emails, step, 3, "LEGIT", false,
                        "no-reply@facebookmail.com", "Facebook",
                        "Bạn có 1 thông báo mới",
                        "Một người bạn vừa nhắc đến bạn trong một bình luận. Bạn có thể mở ứng dụng để xem thêm chi tiết.",
                        null, null, null, List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 4, "PHISH", true,
                        "admin@faceb00k-office.net", "Facebook Office",
                        "Xác nhận tài khoản",
                        "Vui lòng click vào link dưới đây để xác nhận bạn vẫn đang sử dụng tài khoản này.",
                        null, null, null,
                        List.of("Tên miền faceb00k dùng số 0 thay chữ o", "Domain office.net không thuộc hạ tầng Facebook chính thức")
                );
                addVirtualInboxEmail(
                        emails, step, 5, "PHISH", true,
                        "verify@google-security-verify.top", "Google Security",
                        "Cảnh báo an ninh",
                        "Google phát hiện hành động bất thường. Vui lòng kiểm tra lại thiết bị của bạn.",
                        null, null, null,
                        List.of("Domain phụ dài và bất thường", "Đuôi .top có rủi ro cao trong các chiến dịch phishing")
                );
                return emails;
            }

            if (step.getStepOrder() == 2) {
                addVirtualInboxEmail(
                        emails, step, 1, "PHISH", true,
                        "quatang88@gmail.com", "Tri ân khách hàng",
                        "CHÚC MỪNG! Bạn đã trúng iPhone 15 Pro Max",
                        "Bạn là người may mắn nhất trong ngày! Hãy điền thông tin để nhận quà tặng tri ân ngay hôm nay.",
                        null, null, null,
                        List.of("Dùng email cá nhân miễn phí để gửi thông báo trúng thưởng", "Giật tít câu view, không có thông tin xác thực chương trình")
                );
                addVirtualInboxEmail(
                        emails, step, 2, "LEGIT", false,
                        "cskh@evnhanoi.com.vn", "EVN Hà Nội",
                        "Thông báo tiền điện tháng 03/2026",
                        "Kính gửi quý khách, hóa đơn tiền điện kỳ 1 tháng 03 của bạn đã được phát hành. Vui lòng kiểm tra thông tin trên cổng khách hàng.",
                        null, null, null, List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 3, "PHISH", true,
                        "hotro@duocpham3ngay.xyz", "Giảm cân thần tốc",
                        "Giảm 5kg trong 3 ngày không cần tập luyện",
                        "Bí quyết từ chuyên gia hàng đầu, mua ngay nhận ưu đãi 50% chỉ trong hôm nay.",
                        null, null, null,
                        List.of("Domain .xyz thiếu độ tin cậy", "Nội dung quảng cáo phóng đại, mang tính spam")
                );
                addVirtualInboxEmail(
                        emails, step, 4, "LEGIT", false,
                        "duong.nguyen@cybershield.biz", "Đồng nghiệp (Dương)",
                        "Lịch họp tuần - Thứ 2 hàng tuần",
                        "Chào mọi người, nhắc lại lịch họp sáng mai lúc 9:00 tại phòng họp lớn nhé.",
                        null, null, null, List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 5, "PHISH", true,
                        "sale@shopeee.xyz", "Shopee VN",
                        "Tặng Voucher 10 Triệu đồng mừng sinh nhật",
                        "Số lượng có hạn, click ngay để lưu mã vào ví Shopee của bạn!",
                        null, null, null,
                        List.of("Tên miền shopeee sai chính tả thương hiệu", "Đuôi .xyz không phải domain chính thức của Shopee")
                );
                return emails;
            }

            addVirtualInboxEmail(
                    emails, step, 1, "PHISH", true,
                    "sys-admin@security-check.co", "Hệ thống Bảo mật",
                    "[CẢNH BÁO] Tài khoản sẽ bị XÓA sau 2 giờ nữa",
                    "Tài khoản của bạn vi phạm chính sách cộng đồng. Nếu không xác minh trong 2 giờ, dữ liệu sẽ bị xóa vĩnh viễn!",
                    null, null, null,
                    List.of("Ngôn từ đe dọa, tạo hoảng loạn", "Domain security-check.co không rõ nguồn gốc")
            );
            addVirtualInboxEmail(
                    emails, step, 2, "LEGIT", false,
                    "no-reply@accounts.google.com", "Google",
                    "Cập nhật Điều khoản dịch vụ của Google",
                    "Chúng tôi đang cập nhật Điều khoản dịch vụ để làm rõ hơn các quyền lợi của bạn. Vui lòng tham khảo khi thuận tiện.",
                    null, null, null, List.of()
            );
            addVirtualInboxEmail(
                    emails, step, 3, "PHISH", true,
                    "phong-to-cao@canhsat-hinhsu.net", "Cục Cảnh sát",
                    "Lệnh bắt giữ và triệu tập hình sự",
                    "Bạn có liên quan đến một vụ án rửa tiền. Xem chi tiết lệnh bắt giữ tại tệp tin đính kèm phía dưới.",
                    null, null, null,
                    List.of("Nội dung hù dọa nghiêm trọng", "Domain .net không phản ánh cơ quan công quyền chính thức")
            );
            addVirtualInboxEmail(
                    emails, step, 4, "PHISH", true,
                    "apple-id-check@cloud-verify.org", "Apple Support",
                    "Phát hiện đăng nhập lạ tại Moscow, Nga",
                    "Nếu không phải bạn, hãy click vào đây để ĐÓNG BĂNG tài khoản ngay lập tức nhằm bảo vệ tài sản.",
                    null, null, null,
                    List.of("Domain cloud-verify.org không phải domain chính thức của Apple", "Giọng văn hối thúc và gây sợ hãi")
            );
            addVirtualInboxEmail(
                    emails, step, 5, "LEGIT", false,
                    "support@member-gift.vn", "Chăm sóc khách hàng",
                    "Chúc mừng sinh nhật! Tặng bạn mã giảm giá 5%",
                    "Chúc bạn một tuổi mới đầy niềm vui. Đây là món quà nhỏ dành riêng cho bạn, cảm ơn bạn đã đồng hành cùng chúng tôi.",
                    null, null, null, List.of()
            );
            return emails;
        }

        if (content.contains("\"scenarioType\":\"MAIL_FILE\"")) {
            if (step.getStepOrder() == 1) {
                addVirtualInboxEmail(
                        emails, step, 1, "LEGIT", false,
                        "quang.nguyen@cybershield.biz", "Sếp Quang",
                        "Kế hoạch kinh doanh quý II - bản chính thức",
                        "Chào em,\n\nAnh gửi em tệp Ke_hoach_kinh_doanh_Q2.pdf để chuẩn bị cho buổi họp chiến lược chiều nay lúc 14:00.\nNhờ em đọc kỹ mục doanh thu dự kiến và phản hồi lại các điểm cần bổ sung.\n\nTrân trọng,\nNguyễn Quang\nGiám đốc Kinh doanh",
                        null, null,
                        buildAttachmentJson(
                                "Ke_hoach_kinh_doanh_Q2.pdf",
                                "PDF",
                                "Tài liệu kế hoạch",
                                "Kế hoạch kinh doanh quý II/2026 gồm mục tiêu doanh thu theo từng ngành hàng, ngân sách marketing theo tháng, KPI cho đội Sales và lộ trình triển khai theo từng mốc tuần.",
                                List.of()
                        ),
                        List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 2, "PHISH", true,
                        "phu-cap@ketoan-noibo.work", "Phòng Kế toán",
                        "[Khẩn] Danh sách phụ cấp tháng 4 cần kiểm tra ngay",
                        "Kính gửi anh/chị,\n\nMọi người chạy file đính kèm để xem bảng phụ cấp cá nhân tháng 4 và phản hồi trong vòng 30 phút.\nAi không mở file sẽ bị ghi nhận chậm xác nhận dữ liệu lương.\n\nPhòng Kế toán (tạm quyền)",
                        null, null,
                        buildAttachmentJson(
                                "Phu_cap_thang_4.exe",
                                "Executable",
                                "Danh sách phụ cấp",
                                "Tệp hiển thị giao diện giống bảng lương nội bộ, yêu cầu người dùng bấm 'Cho phép quyền quản trị' để xem chi tiết phụ cấp từng cá nhân.",
                                List.of("Hệ thống phát hiện tệp tin này chứa mã thực thi nguy hiểm (.exe) giả dạng tài liệu")
                        ),
                        List.of("Đuôi tệp .exe không phù hợp với tài liệu phụ cấp", "Giọng văn hối thúc, đe dọa xử lý nếu không mở tệp")
                );
                addVirtualInboxEmail(
                        emails, step, 3, "LEGIT", false,
                        "linh.hr@cybershield.biz", "HR Linh",
                        "Cập nhật chính sách phúc lợi năm 2026",
                        "Chào anh/chị,\n\nPhòng Nhân sự gửi tệp Chinh_sach_phuc_loi_2026.docx để mọi người tham khảo chính sách bảo hiểm và phụ cấp áp dụng từ tháng 6/2026.\nNếu có thắc mắc, vui lòng phản hồi trước thứ Sáu tuần này.\n\nTrân trọng,\nLinh\nPhòng Nhân sự",
                        null, null,
                        buildAttachmentJson(
                                "Chinh_sach_phuc_loi_2026.docx",
                                "DOCX",
                                "Chính sách phúc lợi",
                                "Tài liệu mô tả mức đóng bảo hiểm mới, quyền lợi khám sức khỏe định kỳ, phụ cấp công tác và quy trình đề nghị hỗ trợ chi phí đào tạo.",
                                List.of()
                        ),
                        List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 4, "PHISH", true,
                        "it-support@device-fix-alert.net", "IT Support",
                        "[Gấp] Bản vá lag màn hình cho toàn công ty",
                        "Chào bạn,\n\nAnh gửi bản vá Fix_Lag_May_Tinh.scr. Em cài ngay để máy chạy mượt hơn trước 11:00.\nNếu không cài kịp sẽ bị giới hạn truy cập mạng nội bộ tạm thời.\n\nIT Support Team",
                        null, null,
                        buildAttachmentJson(
                                "Fix_Lag_May_Tinh.scr",
                                "Screen Saver Executable",
                                "Bản vá lag màn hình",
                                "Tệp tự nhận là công cụ tối ưu hiệu năng, yêu cầu tắt Windows Defender trước khi chạy và cấp quyền ghi vào thư mục hệ thống.",
                                List.of("Hệ thống phát hiện tệp .scr có hành vi giống trojan, có thể chiếm quyền điều khiển thiết bị")
                        ),
                        List.of("Định dạng .scr không phải bản vá chuẩn của IT nội bộ", "Email dọa hạn chế truy cập nếu không cài ngay")
                );
                addVirtualInboxEmail(
                        emails, step, 5, "PHISH", true,
                        "nam.tran.personal@freemail.me", "Bạn cũ",
                        "Ảnh kỷ niệm lớp mình nè",
                        "Ê ông,\n\nGửi ông ảnh hôm nọ đi nhậu này, xem hài cực.\nTải file đính kèm mở liền đi cho nóng!\n\nNam",
                        null, null,
                        buildAttachmentJson(
                                "Anh_Ky_Niem_Lop.png.exe",
                                "Executable (double extension)",
                                "Ảnh kỷ niệm lớp",
                                "Tệp hiển thị biểu tượng hình ảnh, nhưng khi mở sẽ chạy chương trình nền và yêu cầu kết nối mạng để 'tải ảnh chất lượng cao'.",
                                List.of("Cảnh báo: Tệp sử dụng kỹ thuật đuôi kép (.png.exe) nhằm đánh lừa người dùng")
                        ),
                        List.of("Đuôi kép ngụy trang tệp thực thi", "Văn phong cá nhân, thiếu ngữ cảnh công việc")
                );
                return emails;
            }

            if (step.getStepOrder() == 2) {
                addVirtualInboxEmail(
                        emails, step, 1, "LEGIT", false,
                        "procurement@vina-tech.vn", "Đối tác Vina-Tech",
                        "Hợp đồng dịch vụ đã cập nhật - Vina-Tech",
                        "Kính gửi Phòng Mua sắm,\n\nChúng tôi gửi lại bản Hop_dong_Vina-Tech.pdf đã bổ sung phụ lục tiến độ theo yêu cầu buổi họp ngày hôm qua.\nNhờ Quý công ty xem lại điều khoản thanh toán và phản hồi trước ngày 12/04.\n\nTrân trọng,\nPhòng Pháp chế\nCông ty Vina-Tech",
                        null, null,
                        buildAttachmentJson(
                                "Hop_dong_Vina-Tech.pdf",
                                "PDF",
                                "Hợp đồng dịch vụ",
                                "Hợp đồng cung cấp dịch vụ bảo trì hệ thống gồm 12 điều khoản, phụ lục chi phí, lịch nghiệm thu từng giai đoạn và thông tin đại diện ký kết của hai bên.",
                                List.of()
                        ),
                        List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 2, "PHISH", true,
                        "thue-dientu@thongbao-quyettoan.gov-support.org", "Chi cục Thuế",
                        "[Cảnh báo ngay!!!] Hồ sơ quyết toán chưa hợp lệ",
                        "Kính gửi doanh nghiệp,\n\nĐơn vị đang chậm nộp hồ sơ quyết toán. Vui lòng mở file Thong_bao_quyet_toan.zip để xem chi tiết và xử lý trong hôm nay.\nNếu chậm trễ, hệ thống sẽ tự động chuyển trạng thái vi phạm.\n\nBộ phận hỗ trợ quyết toán",
                        null, null,
                        buildAttachmentJson(
                                "Thong_bao_quyet_toan.zip",
                                "ZIP Archive",
                                "Thông báo quyết toán",
                                "Tệp nén chứa tài liệu 'Huong_dan_quyet_toan_2026.docm' và yêu cầu nhập mật khẩu được gửi ở email tiếp theo để mở nội dung.",
                                List.of("Cảnh báo: Tệp tin nén có mật khẩu không thể quét virus, có thể chứa phần mềm tống tiền")
                        ),
                        List.of("Domain gửi không thuộc cổng thuế chính thức", "Nội dung hối thúc và đe dọa trạng thái vi phạm")
                );
                addVirtualInboxEmail(
                        emails, step, 3, "LEGIT", false,
                        "no-reply@tpbank.com.vn", "TPBank",
                        "Sao kê giao dịch thẻ tín dụng tháng 03/2026",
                        "Kính gửi Quý khách,\n\nNgân hàng gửi sao kê thẻ tín dụng kỳ tháng 03/2026 để Quý khách tiện đối chiếu.\nNếu cần hỗ trợ, vui lòng liên hệ tổng đài 1900 xxxx.\n\nTrân trọng,\nTrung tâm Dịch vụ khách hàng TPBank",
                        null, null,
                        buildAttachmentJson(
                                "Sao_ke_tin_dung.pdf",
                                "PDF",
                                "Sao kê tín dụng",
                                "Bảng sao kê liệt kê chi tiết từng giao dịch, ngày hạch toán, số tiền thanh toán tối thiểu và hạn thanh toán kỳ tiếp theo.",
                                List.of()
                        ),
                        List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 4, "PHISH", true,
                        "secret-doc@board-confidential.io", "Tài liệu mật",
                        "Danh sách đen nhân sự cần xử lý nội bộ",
                        "Chào anh/chị,\n\nBan điều hành yêu cầu xem ngay tài liệu mật trong file Danh_sach_den_nhan_vien.docm.\nTài liệu này chỉ lưu hành trong nội bộ và cần phản hồi gấp trong 20 phút.\n\nVăn phòng điều phối",
                        null, null,
                        buildAttachmentJson(
                                "Danh_sach_den_nhan_vien.docm",
                                "Word Macro-Enabled Document",
                                "Danh sách đen nhân viên",
                                "Tệp Word yêu cầu bật Macro để hiển thị toàn bộ nội dung, đồng thời hiển thị hướng dẫn 'Enable Editing' và 'Enable Content'.",
                                List.of("Phát hiện Macro đáng ngờ có thể tự động chạy lệnh command prompt")
                        ),
                        List.of("Tên file nhạy cảm nhằm kích thích tò mò", "Yêu cầu bật Macro để đọc nội dung")
                );
                addVirtualInboxEmail(
                        emails, step, 5, "PHISH", true,
                        "voucher@travel-gift-center.biz", "Trung tâm Voucher du lịch",
                        "Vé máy bay miễn phí cho thành viên thân thiết",
                        "Xin chúc mừng,\n\nBạn nhận được vé máy bay miễn phí trong chương trình tri ân khách hàng.\nVui lòng mở tệp Ve_May_Bay_Mien_Phi.html để xác nhận thông tin trước 23:59 hôm nay.\n\nBộ phận CSKH",
                        null, null,
                        buildAttachmentJson(
                                "Ve_May_Bay_Mien_Phi.html",
                                "HTML",
                                "Vé máy bay miễn phí",
                                "Trang HTML chứa form nhập họ tên, số điện thoại, email và tự động tải script từ máy chủ bên ngoài để xử lý 'xác minh người nhận thưởng'.",
                                List.of("Cảnh báo: Tệp HTML chứa mã script có khả năng đánh cắp thông tin trình duyệt")
                        ),
                        List.of("Ưu đãi quá hấp dẫn, thiếu nguồn xác thực", "Thời hạn gấp bất thường để ép mở tệp")
                );
                return emails;
            }

            addVirtualInboxEmail(
                    emails, step, 1, "LEGIT", false,
                    "duong.nguyen@cybershield.biz", "Đồng nghiệp (Dương)",
                    "Slide thuyết trình cho cuộc họp 9h sáng",
                    "Chào cả team,\n\nMình gửi trước file Slide_thuyet_trinh.pptx để mọi người rà soát nội dung trước cuộc họp sáng nay.\nNếu có chỉnh sửa, vui lòng comment trực tiếp trước 8:45.\n\nCảm ơn,\nDương",
                    null, null,
                    buildAttachmentJson(
                            "Slide_thuyet_trinh.pptx",
                            "PPTX",
                            "Slide thuyết trình",
                            "Bộ slide gồm 18 trang về kết quả sprint tuần, các chỉ số hoàn thành KPI và kế hoạch hành động cho tuần tiếp theo.",
                            List.of()
                    ),
                    List.of()
            );
            addVirtualInboxEmail(
                    emails, step, 2, "PHISH", true,
                    "nhan-su-update@cybershield-hr-alert.com", "Phòng Nhân Sự",
                    "[Khẩn] Bảng lương toàn công ty tháng này",
                    "Kính gửi anh/chị,\n\nĐể phục vụ kiểm tra nội bộ, Phòng Nhân sự gửi file Bang_luong_toan_cong_ty.exe.\nVui lòng mở tệp ngay và xác nhận đã nhận trước giờ nghỉ trưa.\n\nPhòng Nhân sự",
                    null, null,
                    buildAttachmentJson(
                            "Bang_luong_toan_cong_ty.exe",
                            "Executable",
                            "Bảng lương toàn công ty",
                            "Tệp chạy trình cài đặt nền, hiển thị cửa sổ giả dạng bảng lương Excel và yêu cầu cấp quyền Administrator để 'giải mã dữ liệu'.",
                            List.of("Hệ thống phát hiện tệp tin này chứa mã thực thi nguy hiểm (.exe) giả dạng tài liệu")
                    ),
                    List.of("HR không bao giờ gửi bảng lương dưới dạng file .exe", "Domain gửi không phải tên miền nội bộ")
            );
            addVirtualInboxEmail(
                    emails, step, 3, "PHISH", true,
                    "tracking@dhl-shipment-urgent.net", "DHL Express",
                    "Đơn hàng thất lạc cần xác nhận",
                    "Kính gửi khách hàng,\n\nHệ thống vận chuyển ghi nhận kiện hàng của bạn bị giữ tại kho trung chuyển.\nVui lòng mở Don_hang_that_lac.js để xác thực lại thông tin nhận hàng trong 2 giờ.\n\nDHL Support",
                    null, null,
                    buildAttachmentJson(
                            "Don_hang_that_lac.js",
                            "JavaScript",
                            "Đơn hàng thất lạc",
                            "Tệp script tự động chạy lệnh xóa dữ liệu tạm và tải thêm module từ máy chủ không xác định để 'kiểm tra trạng thái đơn hàng'.",
                            List.of("Cảnh báo: Tệp JavaScript có thể thực thi lệnh hệ thống và gây mất dữ liệu")
                    ),
                    List.of("Đơn vị vận chuyển hiếm khi gửi file .js cho khách hàng", "Nội dung tạo áp lực thời gian bất thường")
            );
            addVirtualInboxEmail(
                    emails, step, 4, "LEGIT", false,
                    "auto-confirm@amazon.com", "Amazon",
                    "Invoice cho đơn hàng #456",
                    "Hello,\n\nAttached is your billing invoice for order #456 placed on Amazon.\nPlease keep this invoice for accounting and warranty purposes.\n\nThank you,\nAmazon Billing Team",
                    null, null,
                    buildAttachmentJson(
                            "Invoice_Order_456.pdf",
                            "PDF",
                            "Amazon Invoice",
                            "Hóa đơn thể hiện mã đơn hàng, danh sách sản phẩm, thuế VAT, địa chỉ giao hàng và phương thức thanh toán đã xác nhận.",
                            List.of()
                    ),
                    List.of()
            );
            addVirtualInboxEmail(
                    emails, step, 5, "PHISH", true,
                    "security@techcombank-update-security.org", "Ngân hàng Tech",
                    "Cập nhật chữ ký số bắt buộc trong hôm nay",
                    "Kính gửi Quý khách,\n\nĐể tránh gián đoạn giao dịch, vui lòng chạy tệp Cap_nhat_chu_ky_so.vbs để hoàn tất cập nhật chứng thư số trước 17:00.\nNếu không thực hiện, tài khoản có thể bị tạm khóa chức năng chuyển khoản.\n\nBộ phận Bảo mật giao dịch",
                    null, null,
                    buildAttachmentJson(
                            "Cap_nhat_chu_ky_so.vbs",
                            "VBScript",
                            "Cập nhật chữ ký số",
                            "Tệp VBScript chạy nền, chỉnh sửa registry và tạo tác vụ tự khởi động cùng Windows dưới tên dịch vụ ngân hàng giả mạo.",
                            List.of("Cảnh báo: File VBScript thường bị lạm dụng để chiếm quyền điều khiển máy tính")
                    ),
                    List.of("Ngân hàng không gửi script .vbs qua email cho khách hàng", "Nội dung đe dọa khóa tài khoản để ép người dùng mở tệp")
            );
            return emails;
        }

        if (content.contains("\"scenarioType\":\"MAIL_OTP\"")) {
            String otp1 = randomSixDigitOtp();
            String otp2 = randomSixDigitOtp();
            String otp3 = randomSixDigitOtp();
            String otp4 = randomSixDigitOtp();
            String otp5 = randomSixDigitOtp();

            if (step.getStepOrder() == 1) {
                addVirtualInboxEmail(
                        emails, step, 1, "LEGIT", false,
                        "no-reply@accounts.google.com", "Google Security",
                        "Mã xác thực đăng nhập Google của bạn",
                        "Kính gửi quý khách,\n\nMã OTP đăng nhập Google của bạn là: " + otp1 + ". Mã này có hiệu lực trong 5 phút.\nTuyệt đối không cung cấp mã này cho bất kỳ ai, kể cả nhân viên hỗ trợ.\n\nTrân trọng,\nGoogle Account Security",
                        null, null, null, List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 2, "PHISH", true,
                        "it-support@cybershield-helpdesk.net", "IT Support",
                        "[Khẩn] Bảo trì hệ thống email nội bộ",
                        "Chào em,\n\nHệ thống đang bảo trì, em nhập mã OTP vào link bên dưới để tránh bị khóa mail tạm thời.\nAnh cần em xử lý ngay trong 10 phút để hệ thống đồng bộ.\n\nIT Đức\nPhòng Kỹ thuật",
                        "https://it-mail-maintenance.verify-now.net/otp", "Xác nhận ngay", null,
                        List.of("IT nội bộ không bao giờ yêu cầu nhập OTP qua link ngoài", "Tên miền hỗ trợ không thuộc hệ thống công ty")
                );
                addVirtualInboxEmail(
                        emails, step, 3, "LEGIT", false,
                        "account-security@microsoft.com", "Microsoft Account Team",
                        "Mã OTP đặt lại mật khẩu Microsoft",
                        "Kính gửi quý khách,\n\nYêu cầu đặt lại mật khẩu đã được ghi nhận. Mã OTP xác minh của bạn là: " + otp2 + ".\nTuyệt đối không cung cấp mã này cho bất kỳ ai, kể cả nhân viên hỗ trợ.\n\nTrân trọng,\nMicrosoft Security",
                        null, null, null, List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 4, "PHISH", true,
                        "kythuat@it-identity-check.org", "Phòng Kỹ thuật",
                        "Xác nhận danh tính tài khoản nhân viên",
                        "Kính gửi anh/chị,\n\nVui lòng gửi lại mã OTP vừa nhận trên điện thoại để phòng kỹ thuật xác nhận danh tính và mở quyền truy cập hệ thống.\nNếu phản hồi chậm, tài khoản sẽ bị treo tạm thời.\n\nTrân trọng,\nBộ phận kỹ thuật hệ thống",
                        "https://it-identity-check.org/verify-otp", "Gửi OTP xác minh", null,
                        List.of("Yêu cầu gửi ngược OTP cho người khác là hành vi lừa đảo", "Ngôn từ dọa khóa tài khoản để ép phản hồi")
                );
                addVirtualInboxEmail(
                        emails, step, 5, "PHISH", true,
                        "it-alert@global-access-security.biz", "IT Khẩn cấp",
                        "[Cảnh báo] Phát hiện truy cập lạ từ nước ngoài",
                        "Anh đang chặn truy cập lạ từ nước ngoài cho em. Đọc ngay mã OTP vừa gửi về điện thoại để anh xử lý ngay, nếu không dữ liệu có thể bị lộ.\n\nIT Đức - Trực ca bảo mật",
                        "https://global-access-security.biz/block-foreign-login", "Hủy truy cập lạ", null,
                        List.of("IT thật không bao giờ xin OTP qua email/chat", "Tên miền .biz không thuộc hạ tầng IT nội bộ")
                );
                return emails;
            }

            if (step.getStepOrder() == 2) {
                addVirtualInboxEmail(
                        emails, step, 1, "PHISH", true,
                        "sep.quang-office@exec-urgent-mail.net", "Sếp Quang",
                        "Anh cần quyền truy cập file báo cáo gấp",
                        "Em ơi,\n\nAnh đang cần vào file báo cáo ngay nhưng quên pass. Em nhập OTP vào link dưới đây để anh lấy quyền truy cập ký hồ sơ cho kịp.\nXử lý ngay giúp anh.\n\nQuang",
                        "https://exec-urgent-mail.net/report-access", "Xác nhận ngay", null,
                        List.of("Mạo danh cấp trên để ép nhập OTP", "Domain không thuộc email doanh nghiệp chính thức")
                );
                addVirtualInboxEmail(
                        emails, step, 2, "LEGIT", false,
                        "billing@evn.com.vn", "EVN Thanh toán",
                        "Mã OTP thanh toán hóa đơn điện công ty",
                        "Kính gửi quý khách,\n\nMã OTP xác nhận giao dịch thanh toán hóa đơn điện là: " + otp3 + ". Mã có hiệu lực trong 3 phút.\nTuyệt đối không cung cấp mã này cho bất kỳ ai, kể cả nhân viên hỗ trợ.\n\nTrân trọng,\nTrung tâm thanh toán EVN",
                        null, null, null, List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 3, "PHISH", true,
                        "ceo-office@digital-sign-fast.com", "Giám đốc điều hành",
                        "Xác nhận chữ ký số hợp đồng ngay",
                        "Anh đang ký hợp đồng với đối tác, đọc cho anh mã OTP vừa gửi về máy em để xác nhận chữ ký số.\nViệc này cực gấp, chậm 5 phút là trễ tiến độ ký kết.\n\nGiám đốc",
                        "https://digital-sign-fast.com/confirm-signature", "Hỗ trợ ký ngay", null,
                        List.of("Không có quy trình nào yêu cầu nhân viên đọc OTP thay lãnh đạo", "Áp lực thời gian cao là dấu hiệu social engineering")
                );
                addVirtualInboxEmail(
                        emails, step, 4, "PHISH", true,
                        "benefit-update@hr-portal-security.info", "HR Linh",
                        "Nâng cấp hệ thống bảo hiểm nhân viên",
                        "Kính gửi anh/chị,\n\nCông ty đang nâng cấp hệ thống bảo hiểm. Mỗi nhân viên cần nhập OTP nhận được vào cổng thông tin để hoàn tất xác nhận hồ sơ.\nVui lòng xử lý trong hôm nay.\n\nTrân trọng,\nPhòng Nhân sự",
                        "https://hr-portal-security.info/benefit-verify", "Cập nhật hồ sơ", null,
                        List.of("Tên miền HR giả mạo, không thuộc cybershield.biz", "Yêu cầu nhập OTP vào cổng lạ")
                );
                addVirtualInboxEmail(
                        emails, step, 5, "LEGIT", false,
                        "no-reply@accounts.google.com", "Google Security",
                        "Mã OTP bảo mật tài khoản Google",
                        "Kính gửi quý khách,\n\nMã OTP xác minh của bạn là: " + otp4 + ". Vui lòng sử dụng trong vòng 5 phút.\nTuyệt đối không cung cấp mã này cho bất kỳ ai, kể cả nhân viên hỗ trợ.\n\nTrân trọng,\nGoogle Account Security",
                        null, null, null, List.of()
                );
                return emails;
            }

            addVirtualInboxEmail(
                    emails, step, 1, "PHISH", true,
                    "fraud-alert@payment-secure-warning.net", "Hệ thống Cảnh báo giao dịch",
                    "[Khẩn cấp] Giao dịch 20.000.000 VNĐ vừa phát sinh",
                    "Kính gửi quý khách,\n\nTài khoản của bạn vừa thanh toán 20.000.000 VNĐ tại shop XYZ. Nếu không phải bạn, hãy nhập OTP vào link bên dưới để hủy giao dịch ngay lập tức.\n\nTrân trọng,\nTrung tâm cảnh báo giao dịch",
                    "https://payment-secure-warning.net/cancel-transfer", "Hủy giao dịch", null,
                    List.of("Yêu cầu nhập OTP vào link lạ để hủy giao dịch là thủ đoạn phổ biến", "Nội dung tạo hoảng sợ tài chính")
            );
            addVirtualInboxEmail(
                    emails, step, 2, "LEGIT", false,
                    "account-security@microsoft.com", "Microsoft Security",
                    "Ai đó vừa biết mật khẩu của bạn",
                    "Kính gửi quý khách,\n\nChúng tôi phát hiện mật khẩu tài khoản của bạn có thể đã bị lộ. Hệ thống đã chặn đăng nhập và phát hành mã OTP: " + otp5 + " để xác minh chủ tài khoản.\nTuyệt đối không cung cấp mã này cho bất kỳ ai, kể cả nhân viên hỗ trợ.\n\nTrân trọng,\nMicrosoft Threat Intelligence",
                    null, null, null, List.of()
            );
            addVirtualInboxEmail(
                    emails, step, 3, "PHISH", true,
                    "security-sync@device-guard-alert.org", "Cảnh báo an ninh dữ liệu",
                    "Thiết bị lạ đang đồng bộ dữ liệu của bạn",
                    "Kính gửi quý khách,\n\nHệ thống ghi nhận thiết bị lạ đang đồng bộ dữ liệu cá nhân. Vui lòng nhập OTP ngay để ngắt kết nối và bảo toàn dữ liệu.\n\nTrân trọng,\nTrung tâm bảo mật thiết bị",
                    "https://device-guard-alert.org/disconnect-now", "Ngắt kết nối ngay", null,
                    List.of("Không có quy trình hợp lệ nào yêu cầu nhập OTP trên domain lạ để ngắt thiết bị", "Email gây hoảng loạn để lừa người dùng tự cung cấp OTP")
            );
            addVirtualInboxEmail(
                    emails, step, 4, "PHISH", true,
                    "policy-warning@facebook-urgent-verify.net", "Facebook Policy Team",
                    "Tài khoản sẽ bị xóa sau 15 phút nếu không xác minh",
                    "Kính gửi quý khách,\n\nTài khoản của bạn có dấu hiệu vi phạm chính sách. Vui lòng nhập OTP xác minh ngay để tránh bị xóa nick sau 15 phút.\n\nTrân trọng,\nFacebook Policy Enforcement",
                    "https://facebook-urgent-verify.net/account-review", "Xác minh ngay", null,
                    List.of("Domain không phải facebook.com", "Dùng deadline 15 phút để ép thao tác")
            );
            addVirtualInboxEmail(
                    emails, step, 5, "LEGIT", false,
                    "auth@cybershield.biz", "Hệ thống xác thực 2 lớp",
                    "Mã xác thực định kỳ của hệ thống",
                    "Kính gửi anh/chị,\n\nMã xác thực 2 lớp định kỳ của bạn là: " + randomSixDigitOtp() + ". Mã có hiệu lực trong 5 phút.\nTuyệt đối không cung cấp mã này cho bất kỳ ai, kể cả nhân viên hỗ trợ.\n\nTrân trọng,\nCyberShield Authentication Service",
                    null, null, null, List.of()
            );
            return emails;
        }

        if (content.contains("\"scenarioType\":\"MAIL_WEB\"")) {
            if (step.getStepOrder() == 1) {
                addVirtualInboxEmail(
                        emails, step, 1, "LEGIT", false,
                        "security@accounts.google.com", "Google Drive Security",
                        "Kính gửi quý khách: Xác minh đăng nhập Google Drive",
                        "Kính gửi quý khách,\n\nHệ thống Google Drive ghi nhận một lần đăng nhập mới từ thiết bị đã xác minh. Vui lòng truy cập cổng bảo mật để kiểm tra lịch sử đăng nhập khi cần.\n\nTrân trọng,\nBộ phận bảo mật Google",
                        "#", "Truy cập ngay", null, List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 2, "PHISH", true,
                        "security-team@facebook-alert-center.net", "Facebook Security",
                        "[CẢNH BÁO] Có người đang cố đăng nhập tài khoản của bạn",
                        "Kính gửi quý khách,\n\nHệ thống phát hiện đăng nhập trái phép vào tài khoản Facebook. Quý khách cần xác minh trong 10 phút để tránh bị khóa tài khoản tạm thời.\n\nTrân trọng,\nHệ thống bảo mật Facebook",
                        "#", "Truy cập ngay", null,
                        List.of("Tên miền gửi không thuộc hạ tầng chính thức của Facebook", "Giọng văn hối thúc nhằm gây áp lực xử lý ngay")
                );
                addVirtualInboxEmail(
                        emails, step, 3, "LEGIT", false,
                        "microsoft365-noreply@microsoft.com", "Microsoft Office 365",
                        "Thông báo bảo mật đăng nhập Microsoft 365",
                        "Kính gửi anh/chị,\n\nChúng tôi ghi nhận một yêu cầu xác minh đăng nhập từ địa chỉ IP mới. Quý khách có thể kiểm tra lại tại trung tâm bảo mật nếu cần.\n\nTrân trọng,\nMicrosoft Security Response Team",
                        "#", "Truy cập ngay", null, List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 4, "PHISH", true,
                        "security@github-notice.org", "GitHub Security",
                        "Fork bất thường từ repository của bạn",
                        "Kính gửi lập trình viên,\n\nHệ thống ghi nhận hành động Fork không rõ nguồn gốc từ repository riêng tư. Vui lòng đăng nhập để xác nhận quyền truy cập ngay lập tức.\n\nTrân trọng,\nGitHub Security Bot",
                        "#", "Truy cập ngay", null,
                        List.of("Tên miền gửi không phải github.com", "Nội dung tạo cảm giác khẩn cấp để ép đăng nhập")
                );
                addVirtualInboxEmail(
                        emails, step, 5, "PHISH", true,
                        "workspace-alert@google-workspace-notify.net", "Google Workspace",
                        "Thông báo bất thường từ Google Workspace",
                        "Kính gửi quý khách,\n\nHệ thống phát hiện hoạt động truy cập bất thường vào Workspace. Vui lòng đăng nhập để xác nhận lại phiên làm việc và tránh gián đoạn dịch vụ.\n\nTrân trọng,\nGoogle Workspace Security",
                        "#", "Truy cập ngay", null,
                        List.of("Tên miền gửi không thuộc Google chính thức", "Nội dung chung chung nhưng thúc ép người dùng đăng nhập")
                );
                return emails;
            }

            if (step.getStepOrder() == 2) {
                addVirtualInboxEmail(
                        emails, step, 1, "PHISH", true,
                        "license-update@microsoft-support-portal.net", "Microsoft Support",
                        "Yêu cầu cập nhật bản quyền Office ngay hôm nay",
                        "Kính gửi quý khách,\n\nĐể tránh gián đoạn bộ Office doanh nghiệp, vui lòng đăng nhập cổng hỗ trợ và xác nhận lại thông tin bản quyền trước 17:00.\n\nTrân trọng,\nMicrosoft Support Center",
                        "#", "Truy cập ngay", null,
                        List.of("Tên miền hỗ trợ không phải microsoft.com", "Dùng hạn chót thời gian để tạo áp lực thao tác")
                );
                addVirtualInboxEmail(
                        emails, step, 2, "LEGIT", false,
                        "no-reply@google.com", "Gmail Security",
                        "Thông báo kiểm tra hoạt động tài khoản Gmail",
                        "Kính gửi quý khách,\n\nChúng tôi gửi thông báo định kỳ về lịch sử bảo mật tài khoản. Quý khách có thể truy cập trang quản lý tài khoản để xem chi tiết.\n\nTrân trọng,\nGoogle Account Security",
                        "#", "Truy cập ngay", null, List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 3, "PHISH", true,
                        "business-alert@facebook-login-portal.net", "Facebook Business",
                        "Xác minh quyền quản trị fanpage doanh nghiệp",
                        "Kính gửi quý khách,\n\nHệ thống phát hiện quyền quản trị fanpage có thay đổi bất thường. Vui lòng đăng nhập để xác thực chủ sở hữu trong vòng 30 phút.\n\nTrân trọng,\nFacebook Business Center",
                        "#", "Truy cập ngay", null,
                        List.of("Domain đích dạng login-portal.net dễ gây nhầm lẫn", "Nội dung gây áp lực thời gian 30 phút")
                );
                addVirtualInboxEmail(
                        emails, step, 4, "PHISH", true,
                        "security@vietcombank-notify.cc", "Vietcombank eBanking",
                        "[Khẩn] Số dư tài khoản biến động bất thường",
                        "Kính gửi quý khách,\n\nHệ thống ghi nhận biến động số dư ngoài lịch sử giao dịch thông thường. Vui lòng đăng nhập cổng xác thực để kiểm tra và khóa giao dịch nếu cần.\n\nTrân trọng,\nTrung tâm bảo mật giao dịch",
                        "#", "Truy cập ngay", null,
                        List.of("Tên miền gửi không thuộc vietcombank.com.vn", "Dùng thông báo số dư để đánh vào tâm lý lo sợ mất tiền")
                );
                addVirtualInboxEmail(
                        emails, step, 5, "LEGIT", false,
                        "noreply@github.com", "GitHub Repo Security",
                        "Nhắc nhở rà soát cấu hình bảo mật repository",
                        "Kính gửi anh/chị,\n\nGitHub gửi thông báo định kỳ về cấu hình bảo mật repository. Quý anh/chị vui lòng truy cập trang Security Settings để rà soát khi thuận tiện.\n\nTrân trọng,\nGitHub Platform Team",
                        "#", "Truy cập ngay", null, List.of()
                );
                return emails;
            }

            addVirtualInboxEmail(
                    emails, step, 1, "PHISH", true,
                    "drive-storage@cloud-storage-alert.top", "Google Storage Alert",
                    "Dung lượng Google Drive đã đầy - cần xác minh ngay",
                    "Kính gửi quý khách,\n\nDung lượng Google Drive của quý khách đã vượt ngưỡng an toàn. Vui lòng xác minh tài khoản để tránh tạm dừng đồng bộ dữ liệu.\n\nTrân trọng,\nGoogle Cloud Storage",
                    "#", "Truy cập ngay", null,
                    List.of("Tên miền gửi không liên quan Google chính thức", "Thông báo hối thúc xác minh ngay để tránh gián đoạn")
            );
            addVirtualInboxEmail(
                    emails, step, 2, "LEGIT", false,
                    "notify@vietcombank.com.vn", "Vietcombank eBanking",
                    "Xác nhận đăng nhập thành công từ thiết bị mới",
                    "Kính gửi quý khách,\n\nHệ thống eBanking ghi nhận đăng nhập mới từ thiết bị đã đăng ký. Nếu không phải quý khách, vui lòng liên hệ tổng đài để được hỗ trợ.\n\nTrân trọng,\nNgân hàng Vietcombank",
                    "#", "Truy cập ngay", null, List.of()
            );
            addVirtualInboxEmail(
                    emails, step, 3, "PHISH", true,
                    "policy@facebook-account-verify.org", "Facebook Policy",
                    "Cảnh báo vi phạm chính sách cộng đồng trong 24h",
                    "Kính gửi quý khách,\n\nTài khoản của quý khách có dấu hiệu vi phạm tiêu chuẩn cộng đồng. Vui lòng xác nhận danh tính trong 24 giờ để tránh bị khóa chức năng đăng bài.\n\nTrân trọng,\nFacebook Policy Review",
                    "#", "Truy cập ngay", null,
                    List.of("Tên miền gửi không phải facebook.com", "Nội dung dọa khóa tài khoản trong 24h để ép thao tác")
            );
            addVirtualInboxEmail(
                    emails, step, 4, "PHISH", true,
                    "teams-security@microsoft-collab.biz", "Microsoft Teams Security",
                    "Phiên họp Teams cần xác thực lại tài khoản",
                    "Kính gửi anh/chị,\n\nHệ thống Teams phát hiện phiên họp có rủi ro bảo mật. Anh/chị cần đăng nhập lại để khôi phục quyền truy cập cuộc họp ngay lập tức.\n\nTrân trọng,\nMicrosoft Collaboration Security",
                    "#", "Truy cập ngay", null,
                    List.of("Tên miền gửi không thuộc microsoft.com", "Tên miền thật bị đánh tráo ký tự trong URL đăng nhập")
            );
            addVirtualInboxEmail(
                    emails, step, 5, "LEGIT", false,
                    "noreply@github.com", "GitHub Authentication",
                    "Yêu cầu xác nhận đăng nhập GitHub",
                    "Kính gửi nhà phát triển,\n\nGitHub gửi thông báo xác nhận đăng nhập từ trình duyệt mới. Vui lòng đăng nhập trang chuẩn để kiểm tra lịch sử truy cập khi cần.\n\nTrân trọng,\nGitHub Security Team",
                    "#", "Truy cập ngay", null, List.of()
            );
            return emails;
        }

        if (content.contains("\"scenarioType\":\"MAIL_ZALO\"")) {
            if (step.getStepOrder() == 1) {
                addVirtualInboxEmail(
                        emails, step, 1, "LEGIT", false,
                        "sep.quang@cybershield.biz", "Sếp Quang",
                        "Báo cáo vận hành tuần - Ban Giám đốc",
                        "Chào em,\n\nAnh gửi file báo cáo vận hành tuần này để em rà soát trước cuộc họp chiều. Nhờ em xác nhận đã nhận trên Zalo.\n\nTrân trọng,\nQuang\nBan Giám đốc",
                        null, null,
                        buildAttachmentJson("BaoCao_VanHanh_Tuan.pdf", "PDF", "Báo cáo vận hành", "Báo cáo tổng hợp KPI vận hành tuần, tình trạng SLA, các đầu việc tồn đọng và đề xuất ưu tiên xử lý tuần kế tiếp.", List.of()),
                        List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 2, "PHISH", true,
                        "sep.quang@cybershield.biz", "Sếp Quang",
                        "[GẤP] Chạy file cập nhật ngay trước cuộc họp",
                        "Em mở file đính kèm và chạy ngay giúp anh để cập nhật dashboard cuộc họp. Anh cần số liệu trong 10 phút.\n\nQuang",
                        null, null,
                        buildAttachmentJson("CapNhat_Dashboard.exe", "Executable", "Bản cập nhật dashboard", "Tệp yêu cầu chạy dưới quyền admin để cập nhật số liệu trình chiếu ngay lập tức.", List.of("Hệ thống phát hiện tệp thực thi .exe vi phạm quy trình gửi file của Ban Giám đốc")),
                        List.of("Sếp không gửi file .exe theo SOP", "Yêu cầu đặc cách vượt quy trình vì lý do gấp")
                );
                addVirtualInboxEmail(
                        emails, step, 3, "PHISH", true,
                        "sep.quang.personal@gmail.com", "Sếp Quang",
                        "Tài liệu họp nhanh qua link tạm",
                        "Anh gửi em link tài liệu họp bằng Gmail cá nhân. Em mở và xác nhận giúp anh ngay để kịp trình bày với đối tác.",
                        "https://docs-share-temporary.net/q4", "Mở tài liệu",
                        null,
                        List.of("Sếp dùng email ngoài @cybershield.biz và không có xác nhận Zalo", "Link tài liệu ngoài hệ thống nội bộ")
                );
                addVirtualInboxEmail(
                        emails, step, 4, "LEGIT", false,
                        "sep.quang.personal@gmail.com", "Sếp Quang",
                        "Gửi tạm tài liệu họp bằng Gmail cá nhân",
                        "Anh đang di chuyển nên gửi tạm tài liệu bằng Gmail cá nhân. Em kiểm tra file giúp anh, nội dung vẫn theo template nội bộ.",
                        null, null,
                        buildAttachmentJson("KeHoach_HopKhachHang.docx", "DOCX", "Kế hoạch họp khách hàng", "Tài liệu kế hoạch trình bày gồm agenda cuộc họp, danh sách đầu mục cần trình và phân công người phụ trách từng phần.", List.of()),
                        List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 5, "PHISH", true,
                        "sep.quang@cybershield.biz", "Sếp Quang",
                        "[KHẨN] Chuyển khoản tạm ứng cho đối tác ngay",
                        "Anh cần em chuyển khoản gấp cho đối tác trong 15 phút, xác nhận qua Zalo để anh chốt hồ sơ.",
                        null, null,
                        null,
                        List.of("Yêu cầu tài chính khẩn qua Zalo, không có văn bản ký duyệt", "Vi phạm SOP tài chính bắt buộc")
                );
                return emails;
            }

            if (step.getStepOrder() == 2) {
                addVirtualInboxEmail(
                        emails, step, 1, "PHISH", true,
                        "it.support@cybershield.biz", "IT Đức",
                        "Thông báo lỗi đăng nhập hệ thống nội bộ",
                        "Anh đang xử lý lỗi đăng nhập toàn hệ thống. Em đọc anh mã OTP vừa nhận để anh fix ngay giúp em.",
                        null, null,
                        null,
                        List.of("IT không được phép yêu cầu OTP từ nhân viên")
                );
                addVirtualInboxEmail(
                        emails, step, 2, "LEGIT", false,
                        "it.support@cybershield.biz", "IT Đức",
                        "Cập nhật agent bảo mật phiên bản mới",
                        "Kính gửi anh/chị,\n\nĐội IT phát hành bản update agent bảo mật nội bộ. Vui lòng truy cập link cybershield.internal và thực hiện theo hướng dẫn.\n\nTrân trọng,\nIT Support",
                        "https://update.cybershield.internal/agent", "Truy cập ngay",
                        null,
                        List.of()
                );
                addVirtualInboxEmail(
                        emails, step, 3, "PHISH", true,
                        "it.support@cybershield.biz", "IT Đức",
                        "Bản vá bảo mật khẩn cấp",
                        "Anh gửi em link update mới, em mở ngay để vá lỗ hổng bảo mật trước 12h.",
                        "https://cybershield-security-fix.xyz/update", "Truy cập ngay",
                        null,
                        List.of("Link cập nhật không phải domain .internal", "Dùng lý do khẩn cấp để ép thao tác")
                );
                addVirtualInboxEmail(
                        emails, step, 4, "PHISH", true,
                        "it.support@cybershield.biz", "IT Đức",
                        "Hỗ trợ cài đặt ứng dụng từ xa",
                        "Em gửi mật khẩu máy qua Zalo để anh đăng nhập từ xa cài app cho nhanh nhé.",
                        null, null,
                        null,
                        List.of("Yêu cầu chia sẻ mật khẩu máy là vi phạm chính sách an toàn")
                );
                addVirtualInboxEmail(
                        emails, step, 5, "LEGIT", false,
                        "it.support@cybershield.biz", "IT Đức",
                        "Hướng dẫn bảo mật mới tháng này",
                        "Chào anh/chị,\n\nĐội IT gửi tài liệu PDF hướng dẫn bảo mật mới áp dụng từ tháng này. Nhờ anh/chị đọc và xác nhận đã nhận qua Zalo.\n\nTrân trọng,\nIT Support",
                        null, null,
                        buildAttachmentJson("HuongDan_BaoMat_ThangNay.pdf", "PDF", "Hướng dẫn bảo mật", "Tài liệu tổng hợp checklist bảo mật endpoint, quy tắc quản lý mật khẩu và quy trình phản hồi sự cố cho toàn bộ nhân viên.", List.of()),
                        List.of()
                );
                return emails;
            }

            addVirtualInboxEmail(
                    emails, step, 1, "LEGIT", false,
                    "ke-toan.lan@cybershield.biz", "Kế toán Lan",
                    "Đối chiếu hóa đơn chi phí dự án",
                    "Chị gửi ảnh hóa đơn qua Zalo để em kiểm tra và xác nhận giúp chị theo quy trình đối soát hôm nay.",
                    null, null,
                    buildAttachmentJson("HoaDon_DuAn_042026.jpg", "JPG", "Ảnh hóa đơn", "Ảnh hóa đơn thanh toán vật tư dự án gồm số hóa đơn, mã số thuế nhà cung cấp và tổng số tiền cần đối chiếu.", List.of()),
                    List.of()
            );
            addVirtualInboxEmail(
                    emails, step, 2, "PHISH", true,
                    "ke-toan.lan@cybershield.biz", "Kế toán Lan",
                    "Xem bảng lương tháng qua cổng ngân hàng",
                    "Em vào link ngân hàng dưới đây để xem bảng lương tháng này và xác nhận giúp chị nhé.",
                    "https://salary-vcb-secure-login.biz/payroll", "Truy cập ngay",
                    null,
                    List.of("Kế toán không gửi link đăng nhập ngân hàng qua email")
            );
            addVirtualInboxEmail(
                    emails, step, 3, "PHISH", true,
                    "hr.linh@cybershield.biz", "HR Linh",
                    "Danh sách nhân sự cập nhật quý 2",
                    "Em mở file zip đính kèm giúp chị để rà soát danh sách nhân sự trước giờ họp nhân sự.",
                    null, null,
                    buildAttachmentJson("DanhSachNhanSu_Q2.zip", "ZIP", "Danh sách nhân sự", "Tệp zip chứa danh sách nhân sự mới cập nhật nhưng không kèm bất kỳ thông tin mật khẩu bảo vệ nào.", List.of("Tệp danh sách nhân viên không có cơ chế bảo vệ mật khẩu theo SOP")),
                    List.of("Tệp nhân sự nhạy cảm bắt buộc phải có mật khẩu bảo vệ")
            );
            addVirtualInboxEmail(
                    emails, step, 4, "LEGIT", false,
                    "hr.linh@cybershield.biz", "HR Linh",
                    "Danh sách nhân sự có mật khẩu bảo vệ",
                    "Chị gửi file zip danh sách nhân sự. Mật khẩu mở tệp là mã nhân viên của em như đã nhắn qua Zalo.",
                    null, null,
                    buildAttachmentJson("DanhSachNhanSu_BaoMat.zip", "ZIP", "Danh sách nhân sự bảo mật", "Tệp zip chứa danh sách nhân sự cập nhật có bảo vệ mật khẩu theo đúng quy trình bảo mật dữ liệu nhân sự.", List.of()),
                    List.of()
            );
            addVirtualInboxEmail(
                    emails, step, 5, "PHISH", true,
                    "finance-partner@vendor-settlement.org", "Đối tác thanh toán",
                    "Đề nghị đổi số tài khoản nhận tiền",
                    "Do thay đổi ngân hàng nhận tiền, đề nghị công ty cập nhật số tài khoản mới và chuyển khoản theo thông tin đính kèm ngay hôm nay.",
                    null, null,
                    null,
                    List.of("Thông tin đổi tài khoản không khớp xác nhận từ Kế toán Lan trên Zalo", "Yêu cầu thay đổi tài khoản nhận tiền là tình huống rủi ro cao")
            );
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

    private void addVirtualInboxEmail(
            List<VirtualInboxEmail> emails,
            ScenarioStep step,
            int queueOrder,
            String mailType,
            boolean phishing,
            String fromEmail,
            String fromName,
            String subject,
            String body,
            String linkUrl,
            String ctaLabel,
            String attachmentJson,
            List<String> redFlags
    ) {
        emails.add(buildInboxEmail(
                step,
                queueOrder,
                mailType,
                phishing,
                fromEmail,
                fromName,
                subject,
                body,
                linkUrl,
                ctaLabel,
                attachmentJson,
                redFlags
        ));
    }

    private String buildAttachmentJson(
            String fileName,
            String mimeLabel,
            String viewerTitle,
            String content,
            List<String> fileWarnings
    ) {
        StringBuilder warningsBuilder = new StringBuilder("[");
        List<String> safeWarnings = fileWarnings == null ? List.of() : fileWarnings;
        for (int i = 0; i < safeWarnings.size(); i++) {
            if (i > 0) warningsBuilder.append(",");
            warningsBuilder.append("\"").append(escapeJson(safeWarnings.get(i))).append("\"");
        }
        warningsBuilder.append("]");

        return "{"
                + "\"fileName\":\"" + escapeJson(fileName) + "\","
                + "\"mimeLabel\":\"" + escapeJson(mimeLabel) + "\","
                + "\"viewerTitle\":\"" + escapeJson(viewerTitle) + "\","
                + "\"content\":\"" + escapeJson(content) + "\","
                + "\"fileWarnings\":" + warningsBuilder
                + "}";
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
    }

    private String randomSixDigitOtp() {
        int value = ThreadLocalRandom.current().nextInt(100000, 1000000);
        return String.valueOf(value);
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
