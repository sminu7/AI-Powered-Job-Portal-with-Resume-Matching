package com.example.backend.controller;

import com.example.backend.model.Job;
import com.example.backend.repository.JobRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobController {

    private final JobRepository jobRepository;

    // Constructor injection clears the warning!
    public JobController(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    // 1. CREATE: Endpoint to create a new job listing
    @PostMapping
    public Job createJob(@RequestBody Job job) {
        return jobRepository.save(job);
    }

    // 2. READ ALL: Endpoint to get all job listings for the feed
    @GetMapping
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    // 3. UPDATE: Update an existing job's details
    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @RequestBody Job jobDetails) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
        
        job.setTitle(jobDetails.getTitle());
        job.setCompany(jobDetails.getCompany());
        job.setLocation(jobDetails.getLocation());
        job.setSalaryRange(jobDetails.getSalaryRange());
        job.setDescription(jobDetails.getDescription());
        
        Job updatedJob = jobRepository.save(job);
        return ResponseEntity.ok(updatedJob);
    }

    // 4. DELETE: Remove a job posting permanently
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
        
        jobRepository.delete(job);
        return ResponseEntity.ok("{\"message\": \"Job deleted successfully\"}");
    }

    // 5. VIEW APPLICANTS: Fetch all incoming candidate applications for a specific job pipeline
    @GetMapping("/{id}/applicants")
    public ResponseEntity<?> getJobApplicants(@PathVariable Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
        
        // Return the applications collection mapped to this job model instance
        // Assuming your Job entity has a mapped field like: @OneToMany(mappedBy = "job", cascade = CascadeType.ALL) List<Application> applications;
        return ResponseEntity.ok(job.getApplications());
    }
}