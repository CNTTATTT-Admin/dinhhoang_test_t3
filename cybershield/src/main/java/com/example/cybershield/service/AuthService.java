package com.example.cybershield.service;

import com.example.cybershield.dto.request.LoginRequest;
import com.example.cybershield.dto.request.RegisterRequest;
import com.example.cybershield.dto.response.AuthResponse;
import com.example.cybershield.entity.User;
import com.example.cybershield.repository.UserRepository;
import com.example.cybershield.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        User user = new User();
        user.setUsername(request.username());

        // Mã hóa mật khẩu bằng BCrypt trước khi lưu xuống DB
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        String defaultAvatar = "https://ui-avatars.com/api/?name=" + request.username() + "&background=random";
        user.setAvatarUrl(defaultAvatar);

        user.setLevel(1);
        user.setTotalExp(0);
        user.setTrapClicks(0);
        user.setCorrectReports(0);
        user.setAvgResponseTime(0.0f);
        // Role mặc định là ROLE_USER đã set cứng ở Entity

        userRepository.save(user);

        // Sinh JWT Token thật
        String jwtToken = jwtService.generateToken(user.getUsername());

        return new AuthResponse(jwtToken, user.getId(), user.getUsername(), user.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        // Ủy quyền cho AuthenticationManager tự động check (gọi UserDetailsService và đối chiếu BCrypt)
        // Nếu sai pass hoặc user không tồn tại, nó sẽ tự throw Exception (BadCredentialsException)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        // Chạy xuống được đây nghĩa là thông tin chuẩn 100%
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        // Sinh JWT Token thật
        String jwtToken = jwtService.generateToken(user.getUsername());

        return new AuthResponse(jwtToken, user.getId(), user.getUsername(), user.getRole());
    }

    public void logout(String token) {
        jwtService.revokeToken(token);
    }
}