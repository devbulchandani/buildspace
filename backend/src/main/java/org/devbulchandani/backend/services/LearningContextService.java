package org.devbulchandani.backend.services;

import org.devbulchandani.backend.models.LearningPlan;
import org.devbulchandani.backend.models.Milestone;
import org.springframework.stereotype.Service;

@Service
public class LearningContextService {
    public String buildPlanContext(LearningPlan plan) {

        StringBuilder sb = new StringBuilder();

        sb.append("=== LEARNING PLAN CONTEXT ===\n");
        sb.append("Project: ").append(plan.getProjectName()).append("\n");
        sb.append("Description: ").append(plan.getProjectDescription()).append("\n");
        sb.append("Duration: ").append(plan.getDurationDays()).append(" days\n");
        sb.append("Skill Level: ").append(plan.getSkillLevel()).append("\n\n");

        sb.append("Milestones so far:\n");

        for (Milestone m : plan.getMilestones()) {
            sb.append(String.format(
                    "M%d [%s]: %s\n",
                    m.getSequenceNumber(),
                    m.isCompleted() ? "DONE" : "PENDING",
                    m.getTitle()
            ));
        }

        return sb.toString();
    }
}
