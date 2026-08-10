package com.example.backend.repository;

import com.example.backend.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {
    // JpaRepository gives us everything we need automatically!
}