package org.devbulchandani.backend.controllers;

import org.devbulchandani.backend.services.VerificationService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/verify")
public class VerificationController {
    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping("/{milestoneId}")
    public Map<String, Object> verify(@PathVariable Long milestoneId) {

        String aiFeedback = verificationService.verifyMilestone(milestoneId);

        return Map.of(
                "feedback", aiFeedback,
                "milestoneId", milestoneId
        );
    }
}
