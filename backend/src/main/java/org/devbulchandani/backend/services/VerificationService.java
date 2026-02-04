package org.devbulchandani.backend.services;

import org.devbulchandani.backend.dtos.MentorBot;
import org.devbulchandani.backend.models.LearningPlan;
import org.devbulchandani.backend.models.Milestone;
import org.devbulchandani.backend.repositories.LearningPlanRepository;
import org.devbulchandani.backend.repositories.MilestoneRepository;
import org.springframework.stereotype.Service;

@Service
public class VerificationService {
    private final MentorBot mentorBot;
    private final MilestoneRepository milestoneRepo;
    private final LearningPlanRepository planRepo;
    private final MilestoneContextService milestoneContext;
    private final LearningContextService planContext;

    public VerificationService(MentorBot mentorBot, MilestoneRepository milestoneRepo, LearningPlanRepository planRepo, MilestoneContextService milestoneContext, LearningContextService planContext) {
        this.mentorBot = mentorBot;
        this.milestoneRepo = milestoneRepo;
        this.planRepo = planRepo;
        this.milestoneContext = milestoneContext;
        this.planContext = planContext;
    }

    public String verifyMilestone(Long milestoneId){
        Milestone m = milestoneRepo.findById(milestoneId)
                .orElseThrow();

        LearningPlan plan = m.getLearningPlan();


        String prompt = """
        You are reviewing the user's progress.

        %s

        %s

        Using the actual code you can read via MCP tools,
        decide whether this milestone is COMPLETE.

        If complete, start your answer with: COMPLETED and commend the user's progress and explain its significance
        Otherwise, explain what is still missing (Socratically, no code).
        """
                .formatted(
                        planContext.buildPlanContext(plan),
                        milestoneContext.buildMilestoneContext(m)
                );

        String aiResponse = mentorBot.chat(prompt);

        boolean completed = aiResponse.contains("COMPLETED");
        m.setCompleted(completed);
        milestoneRepo.save(m);

        return aiResponse;
    }
}
