package com.example.backend.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    // Common technical skills database to scan against
    private static final List<String> KNOWN_SKILLS = Arrays.asList(
        "Java", "Spring Boot", "React", "MySQL", "PostgreSQL", "Python", 
        "Docker", "AWS", "JavaScript", "HTML", "CSS", "Tailwind", "Git", "REST API"
    );

    /**
     * Extracts raw text from an uploaded PDF file
     */
    public String extractTextFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    /**
     * Detects known skills present inside the extracted resume text
     */
    public List<String> extractSkills(String extractedText) {
        String lowerCaseText = extractedText.toLowerCase();
        return KNOWN_SKILLS.stream()
                .filter(skill -> lowerCaseText.contains(skill.toLowerCase()))
                .collect(Collectors.toList());
    }

    /**
     * Calculates the Match Score (%) and separates Matched vs Missing skills
     */
    public Map<String, Object> calculateMatchScore(List<String> candidateSkills, List<String> requiredSkills) {
        if (requiredSkills == null || requiredSkills.isEmpty()) {
            return Map.of("score", 100, "matchedSkills", candidateSkills, "missingSkills", Collections.emptyList());
        }

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String required : requiredSkills) {
            boolean hasSkill = candidateSkills.stream()
                    .anyMatch(s -> s.equalsIgnoreCase(required.trim()));
            if (hasSkill) {
                matched.add(required);
            } else {
                missing.add(required);
            }
        }

        int score = (int) Math.round(((double) matched.size() / requiredSkills.size()) * 100);

        Map<String, Object> result = new HashMap<>();
        result.put("score", score);
        result.put("matchedSkills", matched);
        result.put("missingSkills", missing);
        return result;
    }
}