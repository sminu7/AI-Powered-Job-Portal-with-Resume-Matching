package com.example.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user; // Candidate

    @ManyToOne
    private Job job; // The Job

    private int matchScore; // e.g., 87

    @Column(columnDefinition = "TEXT")
    private String matchedSkills; // Comma-separated or JSON string of matched skills

    @Column(columnDefinition = "TEXT")
    private String missingSkills; // Comma-separated or JSON string of missing skills

    public Application() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }
    public String getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(String matchedSkills) { this.matchedSkills = matchedSkills; }
    public String getMissingSkills() { return missingSkills; }
    public void setMissingSkills(String missingSkills) { this.missingSkills = missingSkills; }
}