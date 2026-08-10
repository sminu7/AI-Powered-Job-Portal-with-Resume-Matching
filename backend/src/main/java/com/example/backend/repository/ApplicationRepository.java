package com.example.backend.repository;

import com.example.backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByUserId(Long userId); // For candidate tracking
    List<Application> findByJobId(Long jobId);   // For recruiters viewing applicants
}