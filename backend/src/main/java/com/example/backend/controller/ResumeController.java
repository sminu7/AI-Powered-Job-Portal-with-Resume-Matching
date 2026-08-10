package com.example.backend.controller;

import com.example.backend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin(origins = "*")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/parse")
    public ResponseEntity<?> parseAndMatchResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "requiredSkills", required = false, defaultValue = "Java,Spring Boot,MySQL") String requiredSkillsStr) {
        
        try {
            // 1. Extract raw text from PDF
            String text = resumeService.extractTextFromPdf(file);
            
            // 2. Detect candidate skills
            List<String> candidateSkills = resumeService.extractSkills(text);

            // 3. Process required skills list
            List<String> requiredSkills = Arrays.asList(requiredSkillsStr.split(","));

            // 4. Calculate score & match breakdown
            Map<String, Object> matchResult = resumeService.calculateMatchScore(candidateSkills, requiredSkills);
            matchResult.put("extractedTextSample", text.length() > 200 ? text.substring(0, 200) + "..." : text);

            return ResponseEntity.ok(matchResult);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to parse PDF: " + e.getMessage()));
        }
    }
}