package com.example.cybershield.service;

import com.example.cybershield.dto.request.LoginRequest;
import com.example.cybershield.dto.request.RegisterRequest;
import com.example.cybershield.dto.response.AuthResponse;
import com.example.cybershield.entity.User;
import com.example.cybershield.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    // TODO: Sẽ Inject JwtService và RedisTemplate vào đây ở các bước sau

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        User user = new User();
        user.setUsername(request.username());

        // Tạm thời lưu plain text để test luồng, bài sau sẽ đắp PasswordEncoder
        user.setPasswordHash(request.password());

        // Tự động tạo avatar mặc định dựa trên tên đăng nhập
        String defaultAvatar = "https://ui-avatars.com/api/?name=" + request.username() + "&background=random";
        user.setAvatarUrl(defaultAvatar);

        user.setLevel(1);
        user.setTotalExp(0);
        user.setTrapClicks(0);
        user.setCorrectReports(0);
        user.setAvgResponseTime(0.0f);

        userRepository.save(user);

        // Tạm thời trả về token giả. Về sau sẽ tạo JWT thật và lưu vào Redis.
        return new AuthResponse("jwt-token-demo", user.getUsername(), "ROLE_USER");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("Sai tài khoản hoặc mật khẩu!"));

        // Kiểm tra password
        if (!user.getPasswordHash().equals(request.password())) {
            throw new RuntimeException("Sai tài khoản hoặc mật khẩu!");
        }

        // Luồng chuẩn bị làm: Sinh JWT -> Lưu Token vào Redis -> Trả JWT về cho Client gọi API dạng Stateless
        return new AuthResponse("jwt-token-demo", user.getUsername(), "ROLE_USER");
    }

    public void logout(String token) {
        // TODO: Xóa token này khỏi Redis để vô hiệu hóa vĩnh viễn
        System.out.println("Đã xóa token khỏi Redis: " + token);
    }
}