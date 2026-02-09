package org.devbulchandani.backend.controllers;

import org.devbulchandani.backend.dtos.VerifyRequest;
import org.devbulchandani.backend.services.VerificationService;
import org.springframework.web.bind.annotation.*;

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
                "completed", aiFeedback.contains("COMPLETED"),
                "feedback", aiFeedback,
                "milestoneId", milestoneId
        );
    }
}
