package com.example.cybershield.service;

import com.example.cybershield.dto.request.DataLeakRequest;
import com.example.cybershield.dto.response.DataLeakResponse;
import com.example.cybershield.entity.DataLeak;
import com.example.cybershield.entity.TrainingSession;
import com.example.cybershield.repository.DataLeakRepository;
import com.example.cybershield.repository.TrainingSessionRepository;
import com.example.cybershield.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DataLeakService {

    private final DataLeakRepository dataLeakRepository;
    private final UserRepository userRepository;
    private final TrainingSessionRepository trainingSessionRepository;

    public List<DataLeakResponse> getAll() {
        return dataLeakRepository.findAll().stream()
                .map(DataLeakResponse::fromEntity)
                .toList();
    }

    public DataLeakResponse getById(UUID id) {
        DataLeak dataLeak = dataLeakRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Data Leak!"));
        return DataLeakResponse.fromEntity(dataLeak);
    }

    public DataLeakResponse create(DataLeakRequest request) {
        DataLeak dataLeak = new DataLeak();
        updateEntityFromRequest(dataLeak, request);
        return DataLeakResponse.fromEntity(dataLeakRepository.save(dataLeak));
    }

    public DataLeakResponse update(UUID id, DataLeakRequest request) {
        DataLeak dataLeak = dataLeakRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Data Leak!"));

        updateEntityFromRequest(dataLeak, request);
        return DataLeakResponse.fromEntity(dataLeakRepository.save(dataLeak));
    }

    public void delete(UUID id) {
        if (!dataLeakRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Data Leak để xóa!");
        }
        dataLeakRepository.deleteById(id);
    }

    private void updateEntityFromRequest(DataLeak dataLeak, DataLeakRequest request) {
        dataLeak.setUser(
                userRepository.findById(request.userId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"))
        );
        dataLeak.setSession(
                trainingSessionRepository.findById(request.sessionId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy Training Session!"))
        );
        dataLeak.setDataType(request.dataType());
        dataLeak.setLeakedValue(request.leakedValue());
    }
}
