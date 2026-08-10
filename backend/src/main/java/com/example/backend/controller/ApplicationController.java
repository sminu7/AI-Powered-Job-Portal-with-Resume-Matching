package com.example.backend.controller;

import com.example.backend.model.Application;
import com.example.backend.model.Job;
import com.example.backend.model.User;
import com.example.backend.repository.ApplicationRepository;
import com.example.backend.repository.JobRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    // A clean constructor handles all three injections and removes all warnings
    public ApplicationController(ApplicationRepository applicationRepository, 
                                 UserRepository userRepository, 
                                 JobRepository jobRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }

    // Endpoint for a candidate to apply for a job with their resume text processed by AI microservice
    @PostMapping("/apply")
    public ResponseEntity<?> applyForJob(
            @RequestParam("userId") Long userId,
            @RequestParam("jobId") Long jobId,
            @RequestParam("resume") MultipartFile file) {

        try {
            // 1. Verify that the candidate and target job requisition exist
            User candidate = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            // 2. Convert MultipartFile payload stream into a clean searchable String
            String extractedResumeText = new String(file.getBytes(), StandardCharsets.UTF_8);

            // 3. Trigger the external Python AI Microservice Call
            RestTemplate restTemplate = new RestTemplate();
            String aiServiceUrl = "http://127.0.0.1:5000/api/ai/match";

            // Prepare the payload body mapping
            Map<String, String> requestBody = Map.of(
                "resume_text", extractedResumeText,
                "job_description", job.getDescription() != null ? job.getDescription() : ""
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

            // POST data directly to the Python server
            Map<?, ?> aiResponse = restTemplate.postForObject(aiServiceUrl, request, Map.class);

            // 4. Extract processed metrics from the microservice response response
            int matchScore = 75; // Safe fallback default
            String matchedSkills = "None";
            String missingSkills = "None";

            if (aiResponse != null) {
                if (aiResponse.get("score") != null) {
                    matchScore = (int) aiResponse.get("score");
                }
                if (aiResponse.get("matched") != null) {
                    matchedSkills = (String) aiResponse.get("matched");
                }
                if (aiResponse.get("missing") != null) {
                    missingSkills = (String) aiResponse.get("missing");
                }
            }

            // 5. Build and save the application entity mapping matrix
            Application application = new Application();
            application.setUser(candidate);
            application.setJob(job);
            application.setMatchScore(matchScore);
            application.setMatchedSkills(matchedSkills);
            application.setMissingSkills(missingSkills);

            Application savedApplication = applicationRepository.save(application);
            return ResponseEntity.ok(savedApplication);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("AI Diagnostic microservice integration breakdown: " + e.getMessage());
        }
    }

    // Get all applications submitted by a specific candidate
    @GetMapping("/candidate/{userId}")
    public List<Application> getCandidateApplications(@PathVariable Long userId) {
        return applicationRepository.findByUserId(userId);
    }

    // Get all applicants for a specific job (Recruiter view)
    @GetMapping("/job/{jobId}")
    public List<Application> getJobApplicants(@PathVariable Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }
}