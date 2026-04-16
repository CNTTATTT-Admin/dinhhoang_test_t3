package com.example.cybershield.service;

import com.example.cybershield.dto.response.LeaderboardEntryResponse;
import com.example.cybershield.entity.User;
import com.example.cybershield.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;

    public List<LeaderboardEntryResponse> getTopByExp() {
        List<User> users = userRepository.findTop10ByOrderByTotalExpDesc();
        return users.stream()
                .map(u -> new LeaderboardEntryResponse(
                        u.getId(),
                        u.getUsername(),
                        u.getLevel(),
                        u.getTotalExp()
                ))
                .toList();
    }
}
