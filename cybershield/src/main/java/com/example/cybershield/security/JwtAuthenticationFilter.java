package com.example.cybershield.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Lấy Header Authorization từ Request
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // 2. Kiểm tra xem Header có chứa Token không (phải bắt đầu bằng "Bearer ")
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // Không có token thì cho đi tiếp (tới SecurityConfig để quyết định chặn hay thả)
            return;
        }

        // 3. Cắt chuỗi để lấy đúng phần Token (Bỏ chữ "Bearer " đi)
        jwt = authHeader.substring(7).trim();
        if (jwt.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }
        try {
            username = jwtService.extractUsername(jwt);
        } catch (JwtException | IllegalArgumentException ex) {
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
            return;
        }

        // 4. Nếu có username trong token và người dùng chưa được xác thực trong SecurityContext
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Lấy thông tin user từ Database (sẽ cấu hình ở bước sau)
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 5. Kiểm tra Token có hợp lệ với User này không
            if (jwtService.isTokenValid(jwt, userDetails.getUsername())) {

                // Nếu hợp lệ, tạo một đối tượng Authentication
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                // Bổ sung thêm thông tin chi tiết của Request (IP, SessionId...)
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // 6. Lưu Authentication vào SecurityContext (Đánh dấu là đã đăng nhập thành công)
                org.springframework.security.core.context.SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authToken);
                SecurityContextHolder.setContext(context);
            }
        }

        // 7. Cho phép Request đi tiếp đến Controller
        filterChain.doFilter(request, response);
    }
}