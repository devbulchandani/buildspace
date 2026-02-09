package org.devbulchandani.backend.controllers;

import org.devbulchandani.backend.models.LearningPlan;
import org.devbulchandani.backend.repositories.LearningPlanRepository;
import org.devbulchandani.backend.services.LearningContextService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/context")
public class ContextController {
    private final LearningContextService  learningContextService;
    private final LearningPlanRepository  planRepo;


    public ContextController(LearningContextService learningContextService, LearningPlanRepository planRepo) {
        this.learningContextService = learningContextService;
        this.planRepo = planRepo;
    }

    @GetMapping("/learning-plan/{planId}")
    public String getLearningContext(@PathVariable("planId") long planId){
        LearningPlan plan = planRepo.findById(planId)
                .orElseThrow(() -> new RuntimeException("Learning plan not found"));
        return learningContextService.buildPlanContext(plan);
    }
}
