package org.devbulchandani.backend.controllers;

import org.devbulchandani.backend.dtos.PlanRequest;
import org.devbulchandani.backend.models.LearningPlan;
import org.devbulchandani.backend.services.CurriculumGeneratorService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
public class CurriculumGeneratorController {
    private final CurriculumGeneratorService service;

    public CurriculumGeneratorController(CurriculumGeneratorService service) {
        this.service = service;
    }

    @Value("${gemini.api.key:${GEMINI_API_KEY}}")
    private String key;

    @GetMapping("/debug-key")
    public String debug(){
        return key;
    }

    @PostMapping
    public LearningPlan createPlan(
            @RequestBody PlanRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return service.generatePlan(
                token,
                request.technology(),
                request.duration(),
                request.skillLevel()
        );
    }

    @GetMapping("/my-plans")
    public List<LearningPlan> getMyPlans(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return service.findByUserEmail(token);
    }

    @GetMapping("/{planId}")
    public LearningPlan getPlan(@PathVariable long planId){
        return service.getPlanById(planId);
    }

    @PutMapping("/{planId}/github")
    public LearningPlan addGithubUrl(
            @PathVariable long planId,
            @RequestParam String githubUrl,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        return service.updateGithubUrl(planId, githubUrl, token);
    }

}
